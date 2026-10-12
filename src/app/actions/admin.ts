"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { hashPassword, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { fileOf, setStatus } from "@/lib/orders";
import { setSecret } from "@/lib/pay";
import { isVideo, removeFile, removeUpload, saveUpload } from "@/lib/uploads";

export type FormState = { error?: string; ok?: string } | undefined;

const text = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const hex = (v: string, fallback: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : fallback);

function cents(v: string) {
  const n = Math.round(Number(v) * 100);
  return v !== "" && Number.isFinite(n) && n >= 0 && n < 1e9 ? n : null;
}

function freeSlug(table: "products" | "bundles" | "categories", want: string, id: number | null) {
  const base = want || "item";
  let slug = base;
  for (let n = 2; db.prepare(`select 1 from ${table} where slug = ? and id is not ?`).get(slug, id); n++) slug = `${base}-${n}`;
  return slug;
}

function prices(f: FormData) {
  const price = cents(text(f, "price"));
  const compareText = text(f, "compare");
  const compare = compareText ? cents(compareText) : null;
  if (price === null || (compareText && compare === null)) return null;
  return { price, compare: compare && compare > price ? compare : null };
}

export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = Number(f.get("id")) || null;
  const name = text(f, "name", 80);
  if (!name) return { error: "Name is required" };
  const money = prices(f);
  if (!money) return { error: "Invalid price" };
  let icon: string | null;
  try {
    icon = await saveUpload(f.get("icon"));
  } catch (e) {
    return { error: (e as Error).message };
  }

  const row = {
    name,
    slug: freeSlug("products", slugify(text(f, "slug") || name), id),
    tagline: text(f, "tagline", 120),
    description: text(f, "description", 5000),
    price: money.price,
    compare: money.compare,
    color: hex(text(f, "color"), "#3b82f6"),
    category: Number(f.get("category")) || null,
    platforms: text(f, "platforms"),
    featured: f.has("featured") ? 1 : 0,
    is_new: f.has("is_new") ? 1 : 0,
    published: f.has("published") ? 1 : 0,
    position: Math.trunc(Number(f.get("position"))) || 0,
  };

  if (!id) {
    const made = db.prepare(`
      insert into products (name, slug, tagline, description, price_cents, compare_cents, color, category_id, platforms, featured, is_new, published, position, icon)
      values (@name, @slug, @tagline, @description, @price, @compare, @color, @category, @platforms, @featured, @is_new, @published, @position, @icon)
    `).run({ ...row, icon }).lastInsertRowid;
    updateTag("store");
    redirect(`/admin/products/${made}`);
  }

  const old = db.prepare("select icon from products where id = ?").get(id) as { icon: string | null } | undefined;
  if (!old) return { error: "Product not found" };
  const nextIcon = icon ?? (f.has("removeIcon") ? null : old.icon);
  db.prepare(`
    update products set name=@name, slug=@slug, tagline=@tagline, description=@description, price_cents=@price, compare_cents=@compare,
      color=@color, category_id=@category, platforms=@platforms, featured=@featured, is_new=@is_new, published=@published,
      position=@position, icon=@icon where id=@id
  `).run({ ...row, icon: nextIcon, id });
  if (nextIcon !== old.icon) await removeUpload(old.icon);
  updateTag("store");
  return { ok: "Saved" };
}

export async function deleteProduct(f: FormData) {
  await requireOwner();
  const id = Number(f.get("id"));
  const files = [
    ...(db.prepare("select url from media where product_id = ?").all(id) as { url: string | null }[]).map((m) => m.url),
    (db.prepare("select icon from products where id = ?").get(id) as { icon: string | null } | undefined)?.icon,
  ];
  const file = fileOf(id);
  db.prepare("delete from products where id = ?").run(id);
  await Promise.all(files.map(removeUpload));
  if (file) await removeFile(file.path);
  updateTag("store");
  redirect("/admin");
}

export async function addMedia(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = Number(f.get("id"));
  if (!db.prepare("select 1 from products where id = ?").get(id)) return { error: "Product not found" };
  const files = f.getAll("files").filter((x) => x instanceof File && x.size > 0);
  if (files.length === 0) return { error: "No file selected" };
  const urls: string[] = [];
  try {
    for (const file of files) urls.push((await saveUpload(file, true))!);
  } catch (e) {
    await Promise.all(urls.map(removeUpload));
    return { error: (e as Error).message };
  }
  const at = (db.prepare("select coalesce(max(position), -1) n from media where product_id = ?").get(id) as { n: number }).n;
  const add = db.prepare("insert into media (product_id, kind, url, position) values (?, ?, ?, ?)");
  urls.forEach((url, i) => add.run(id, isVideo(url) ? "video" : "image", url, at + 1 + i));
  updateTag("store");
  return { ok: files.length === 1 ? "Added" : `Added ${files.length}` };
}

export async function deleteMedia(f: FormData) {
  await requireOwner();
  const id = Number(f.get("id"));
  const row = db.prepare("select url from media where id = ?").get(id) as { url: string | null } | undefined;
  db.prepare("delete from media where id = ?").run(id);
  await removeUpload(row?.url);
  updateTag("store");
}

export async function deleteReview(f: FormData) {
  await requireOwner();
  db.prepare("delete from reviews where id = ?").run(Number(f.get("id")));
  updateTag("store");
}

export async function saveBundle(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = Number(f.get("id")) || null;
  const name = text(f, "name", 80);
  if (!name) return { error: "Name is required" };
  const money = prices(f);
  if (!money) return { error: "Invalid price" };
  const items = f.getAll("products").map(Number).filter(Boolean);
  if (items.length < 2) return { error: "Pick at least 2 products" };
  const row = {
    name, slug: freeSlug("bundles", slugify(name), id), blurb: text(f, "blurb", 160),
    price: money.price, compare: money.compare, color: hex(text(f, "color"), "#4f46e5"),
  };

  const bundleId = db.transaction(() => {
    const bid = id ?? Number(db.prepare(
      "insert into bundles (name, slug, blurb, price_cents, compare_cents, color) values (@name, @slug, @blurb, @price, @compare, @color)",
    ).run(row).lastInsertRowid);
    if (id) {
      db.prepare("update bundles set name=@name, slug=@slug, blurb=@blurb, price_cents=@price, compare_cents=@compare, color=@color where id=@id")
        .run({ ...row, id });
      db.prepare("delete from bundle_items where bundle_id = ?").run(id);
    }
    const add = db.prepare("insert or ignore into bundle_items (bundle_id, product_id) select ?, id from products where id = ?");
    for (const p of items) add.run(bid, p);
    return bid;
  })();
  updateTag("store");
  if (!id) redirect(`/admin/bundles/${bundleId}`);
  return { ok: "Saved" };
}

export async function deleteBundle(f: FormData) {
  await requireOwner();
  db.prepare("delete from bundles where id = ?").run(Number(f.get("id")));
  updateTag("store");
  redirect("/admin/bundles");
}

export async function saveCategory(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = Number(f.get("id")) || null;
  const name = text(f, "name", 40);
  if (!name) return { error: "Name is required" };
  const slug = freeSlug("categories", slugify(name), id);
  if (id) {
    db.prepare("update categories set name = ?, slug = ?, position = ? where id = ?").run(name, slug, Math.trunc(Number(f.get("position"))) || 0, id);
  } else {
    db.prepare("insert into categories (name, slug, position) select ?, ?, coalesce(max(position), -1) + 1 from categories").run(name, slug);
  }
  updateTag("store");
  return { ok: id ? "Saved" : "Added" };
}

export async function deleteCategory(f: FormData) {
  await requireOwner();
  db.prepare("delete from categories where id = ?").run(Number(f.get("id")));
  updateTag("store");
}

const settingKeys = ["name", "byline", "heroTitle", "searchHint", "footerBlurb"];

export async function saveSettings(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  if (!text(f, "name")) return { error: "Store name is required" };
  let logo: string | null;
  try {
    logo = await saveUpload(f.get("logo"));
  } catch (e) {
    return { error: (e as Error).message };
  }
  const old = (db.prepare("select value from settings where key = 'logo'").get() as { value: string } | undefined)?.value ?? "";
  const nextLogo = logo ?? (f.has("removeLogo") ? "" : old);
  const set = db.prepare("insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value");
  db.transaction(() => {
    for (const k of settingKeys) set.run(k, text(f, k, 300));
    set.run("accent", hex(text(f, "accent"), "#3b6cf6"));
    set.run("logo", nextLogo);
  })();
  if (nextLogo !== old) await removeUpload(old);
  updateTag("store");
  return { ok: "Saved" };
}

export async function savePages(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const set = db.prepare("insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value");
  for (const k of ["pageTerms", "pagePrivacy", "pageSupport"]) set.run(k, text(f, k, 20000));
  updateTag("store");
  return { ok: "Saved" };
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = Number(f.get("id"));
  const password = randomBytes(9).toString("base64url");
  if (!db.prepare("update users set password_hash = ? where id = ?").run(hashPassword(password), id).changes) return { error: "User not found" };
  db.prepare("delete from sessions where user_id = ?").run(id);
  return { ok: `New password: ${password}` };
}

export async function saveLogin(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const id = text(f, "googleId"), key = text(f, "googleSecret");
  if (id && !id.endsWith(".apps.googleusercontent.com")) return { error: "Invalid client ID" };
  setSecret("googleId", id);
  if (key) setSecret("googleSecret", key);
  if (!id) setSecret("googleSecret", "");
  refresh();
  return { ok: "Saved" };
}

export async function savePayments(_: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const key = text(f, "stripeKey");
  if (key && !/^(sk|rk)_(test|live)_\w+$/.test(key)) return { error: "Invalid Stripe key" };
  if (key) setSecret("stripeKey", key);
  else if (f.has("removeStripe")) setSecret("stripeKey", "");
  setSecret("wallets", text(f, "wallets", 2000));
  refresh();
  return { ok: "Saved" };
}

export async function setOrder(f: FormData) {
  await requireOwner();
  const status = f.get("status");
  if (status === "paid" || status === "cancelled") setStatus(Number(f.get("id")), status);
  refresh();
}
