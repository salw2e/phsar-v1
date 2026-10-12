import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { defaults } from "./seed";

export type Settings = Record<string, string>;
export type Category = { id: number; slug: string; name: string };
export type Media = { id: number; kind: string; url: string | null; caption: string; color: string };
export type Product = {
  id: number; slug: string; name: string; tagline: string; description: string;
  price_cents: number; compare_cents: number | null; icon: string | null; color: string;
  platforms: string[]; featured: boolean; is_new: boolean; rating: number; reviews: number; category: string | null;
  media: Media[];
};
export type Bundle = { id: number; slug: string; name: string; blurb: string; price_cents: number; compare_cents: number | null; color: string; items: number };

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  const rows = db.prepare("select key, value from settings").all() as { key: string; value: string }[];
  return { ...defaults, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  return db.prepare("select id, slug, name from categories order by position, name").all() as Category[];
}

type Row = Omit<Product, "platforms" | "featured" | "is_new" | "media"> & { platforms: string; featured: number; is_new: number };

export async function getProducts(q = "", category = ""): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  const rows = db.prepare(`
    select p.id, p.slug, p.name, p.tagline, p.description, p.price_cents, p.compare_cents, p.icon, p.color, p.platforms, p.featured, p.is_new,
      c.slug as category,
      (select count(*) from reviews r where r.product_id = p.id) as reviews,
      coalesce((select avg(rating) from reviews r where r.product_id = p.id), 0) as rating
    from products p left join categories c on c.id = p.category_id
    where p.published = 1
      and (@q = '' or p.name like '%' || @q || '%' or p.tagline like '%' || @q || '%')
      and (@category = '' or c.slug = @category)
    order by p.position, p.id
  `).all({ q: q.trim(), category }) as Row[];
  if (rows.length === 0) return [];
  const media = db.prepare(
    `select id, product_id, kind, url, caption, color from media where product_id in (${rows.map(() => "?").join(",")}) order by position, id`,
  ).all(...rows.map((r) => r.id)) as (Media & { product_id: number })[];
  return rows.map((r) => ({
    ...r,
    platforms: r.platforms.split(",").map((s) => s.trim()).filter(Boolean),
    featured: r.featured === 1,
    is_new: r.is_new === 1,
    media: media.filter((m) => m.product_id === r.id),
  }));
}

export type Review = { id: number; author: string; rating: number; body: string; created_at: number };

export async function getReviews(productId: number): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  return db.prepare("select id, author, rating, body, created_at from reviews where product_id = ? order by id desc limit 50").all(productId) as Review[];
}

export async function getBundles(): Promise<Bundle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  return db.prepare(`
    select b.*, (select count(*) from bundle_items i where i.bundle_id = b.id) as items from bundles b order by b.id
  `).all() as Bundle[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getBundle(slug: string): Promise<(Bundle & { products: Product[] }) | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("store");
  const b = (await getBundles()).find((x) => x.slug === slug);
  if (!b) return null;
  const ids = (db.prepare("select product_id from bundle_items where bundle_id = ?").all(b.id) as { product_id: number }[]).map((r) => r.product_id);
  const products = (await getProducts()).filter((p) => ids.includes(p.id));
  return { ...b, products };
}

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export const size = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);
