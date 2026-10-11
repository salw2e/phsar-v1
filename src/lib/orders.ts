import "server-only";
import { db } from "./db";

export type Order = {
  id: number; user_id: number; title: string; amount_cents: number; method: string; status: string; reference: string;
  created_at: number; paid_at: number | null;
};
type Line = { id: number; name: string; slug: string; price_cents: number };
export type Item = { title: string; amount_cents: number; products: Line[] };

export function findItem(p: string, b: string): Item | null {
  if (p) {
    const row = db.prepare("select id, name, slug, price_cents from products where slug = ? and published = 1").get(p) as Line | undefined;
    return row ? { title: row.name, amount_cents: row.price_cents, products: [row] } : null;
  }
  const bundle = db.prepare("select id, name, price_cents from bundles where slug = ?").get(b) as { id: number; name: string; price_cents: number } | undefined;
  if (!bundle) return null;
  const products = db.prepare(`
    select p.id, p.name, p.slug, p.price_cents from bundle_items i join products p on p.id = i.product_id
    where i.bundle_id = ? and p.published = 1 order by p.position, p.id
  `).all(bundle.id) as Line[];
  return products.length ? { title: bundle.name, amount_cents: bundle.price_cents, products } : null;
}

export const ownedIds = (userId: number) =>
  (db.prepare(`
    select distinct i.product_id id from order_items i join orders o on o.id = i.order_id where o.user_id = ? and o.status = 'paid'
  `).all(userId) as { id: number }[]).map((r) => r.id);

export function createOrder(userId: number, item: Item, method: string, paid = false) {
  return db.transaction(() => {
    const id = Number(db.prepare(
      "insert into orders (user_id, title, amount_cents, method, status, paid_at) values (?, ?, ?, ?, ?, ?)",
    ).run(userId, item.title, item.amount_cents, method, paid ? "paid" : "pending", paid ? Math.floor(Date.now() / 1000) : null).lastInsertRowid);
    const add = db.prepare("insert into order_items (order_id, product_id) values (?, ?)");
    for (const p of item.products) add.run(id, p.id);
    return id;
  })();
}

export const setStatus = (id: number, status: "paid" | "cancelled") =>
  db.prepare("update orders set status = @status, paid_at = case when @status = 'paid' then unixepoch() else paid_at end where id = @id and status in ('pending', 'review')")
    .run({ id, status }).changes === 1;

export const ordersOf = (userId: number) => db.prepare("select * from orders where user_id = ? order by id desc").all(userId) as Order[];
export const orderOf = (userId: number, id: number) =>
  db.prepare("select * from orders where id = ? and user_id = ?").get(id, userId) as Order | undefined;
export const allOrders = () => db.prepare(`
  select o.*, u.email from orders o join users u on u.id = o.user_id order by o.id desc limit 200
`).all() as (Order & { email: string })[];

export type Owned = { id: number; slug: string; name: string; tagline: string; icon: string | null; color: string; file: string | null; size: number | null };
export const library = (userId: number) => db.prepare(`
  select p.id, p.slug, p.name, p.tagline, p.icon, p.color, f.name as file, f.size
  from products p left join files f on f.product_id = p.id
  where p.id in (select i.product_id from order_items i join orders o on o.id = i.order_id where o.user_id = ? and o.status = 'paid')
  order by p.name
`).all(userId) as Owned[];

export type StoredFile = { product_id: number; path: string; name: string; size: number };
export const fileOf = (productId: number) => db.prepare("select * from files where product_id = ?").get(productId) as StoredFile | undefined;
