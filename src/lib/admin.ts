import "server-only";
import { db } from "./db";
import type { Media } from "./store";

export type ProductRow = {
  id: number; slug: string; name: string; tagline: string; description: string; price_cents: number; compare_cents: number | null;
  icon: string | null; color: string; category_id: number | null; platforms: string; featured: number; is_new: number;
  position: number; published: number;
};
export type BundleRow = { id: number; slug: string; name: string; blurb: string; price_cents: number; compare_cents: number | null; color: string };
export type CategoryRow = { id: number; slug: string; name: string; position: number; products: number };

export const allProducts = () => db.prepare("select * from products order by position, id").all() as ProductRow[];
export const productById = (id: number) => db.prepare("select * from products where id = ?").get(id) as ProductRow | undefined;
export const mediaOf = (id: number) =>
  db.prepare("select id, kind, url, caption, color from media where product_id = ? order by position, id").all(id) as Media[];
export const allBundles = () => db.prepare("select * from bundles order by id").all() as BundleRow[];
export const bundleById = (id: number) => db.prepare("select * from bundles where id = ?").get(id) as BundleRow | undefined;
export const bundleProductIds = (id: number) =>
  (db.prepare("select product_id from bundle_items where bundle_id = ?").all(id) as { product_id: number }[]).map((r) => r.product_id);
export const allCategories = () => db.prepare(`
  select c.*, (select count(*) from products p where p.category_id = c.id) as products from categories c order by c.position, c.name
`).all() as CategoryRow[];
