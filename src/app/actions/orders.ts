"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrder, findItem, ownedIds, setStatus } from "@/lib/orders";
import { methods, startStripe } from "@/lib/pay";
import type { FormState } from "./admin";

export async function buy(_: FormState, f: FormData): Promise<FormState> {
  const p = String(f.get("p") ?? ""), b = String(f.get("b") ?? "");
  const user = await requireUser(`/checkout?${p ? `p=${p}` : `b=${b}`}`);
  const item = findItem(p, b);
  if (!item) return { error: "Item not found" };
  const owned = ownedIds(user.id);
  if (item.products.every((x) => owned.includes(x.id))) redirect("/library");
  if (item.amount_cents === 0) {
    createOrder(user.id, item, "free", true);
    redirect("/library");
  }

  const on = methods();
  const method = String(f.get("method"));
  if (method === "crypto" && on.crypto) redirect(`/orders/${createOrder(user.id, item, "crypto")}`);
  if (method !== "stripe" || !on.stripe) return { error: "Payment method unavailable" };

  const id = createOrder(user.id, item, "stripe");
  let url: string;
  try {
    url = await startStripe({ id, ...item }, user.email);
  } catch (e) {
    console.error("stripe:", (e as Error).message);
    setStatus(id, "cancelled");
    return { error: "Card payment failed, try again" };
  }
  redirect(url);
}

export async function sendTx(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser("/orders");
  const id = Number(f.get("id"));
  const tx = String(f.get("tx") ?? "").trim().slice(0, 200);
  if (tx.length < 8) return { error: "Enter the transaction ID" };
  const done = db.prepare(`
    update orders set reference = ?, status = 'review' where id = ? and user_id = ? and method = 'crypto' and status in ('pending', 'review')
  `).run(tx, id, user.id).changes;
  if (!done) return { error: "Order is closed" };
  redirect(`/orders/${id}`);
}

export async function saveReview(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser("/library");
  const product = Number(f.get("product"));
  const rating = Math.trunc(Number(f.get("rating")));
  if (!ownedIds(user.id).includes(product)) return { error: "Buy it first" };
  if (!(rating >= 1 && rating <= 5)) return { error: "Pick 1 to 5 stars" };
  db.prepare(`
    insert into reviews (product_id, user_id, author, rating, body) values (?, ?, ?, ?, ?)
    on conflict(product_id, user_id) do update set rating = excluded.rating, body = excluded.body, author = excluded.author
  `).run(product, user.id, user.name || user.email.split("@")[0], rating, String(f.get("body") ?? "").trim().slice(0, 1000));
  updateTag("store");
  return { ok: "Saved" };
}
