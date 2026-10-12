import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { seed } from "./seed";

const path = process.env.DATABASE_PATH ?? "data/phsar.db";

const globalForDb = globalThis as unknown as { db?: Database.Database };

function open() {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    create table if not exists settings (key text primary key, value text not null);
    create table if not exists categories (
      id integer primary key, slug text unique not null, name text not null, position integer not null default 0
    );
    create table if not exists products (
      id integer primary key,
      slug text unique not null,
      name text not null,
      tagline text not null default '',
      description text not null default '',
      price_cents integer not null default 0,
      compare_cents integer,
      icon text,
      color text not null default '#3b82f6',
      category_id integer references categories(id) on delete set null,
      platforms text not null default '',
      featured integer not null default 0,
      is_new integer not null default 0,
      rating real not null default 0,
      reviews integer not null default 0,
      position integer not null default 0,
      published integer not null default 1,
      created_at integer not null default (unixepoch())
    );
    create table if not exists media (
      id integer primary key,
      product_id integer not null references products(id) on delete cascade,
      kind text not null default 'image',
      url text,
      caption text not null default '',
      color text not null default '#1f2937',
      position integer not null default 0
    );
    create table if not exists bundles (
      id integer primary key, slug text unique not null, name text not null, blurb text not null default '',
      price_cents integer not null, compare_cents integer, color text not null default '#4f46e5'
    );
    create table if not exists users (
      id integer primary key, email text unique not null, name text not null default '',
      password_hash text not null, role text not null default 'customer', created_at integer not null default (unixepoch())
    );
    create table if not exists sessions (
      token_hash text primary key, user_id integer not null references users(id) on delete cascade, expires_at integer not null
    );
    create table if not exists secrets (key text primary key, value text not null);
    create table if not exists files (
      product_id integer primary key references products(id) on delete cascade,
      path text not null, name text not null, size integer not null
    );
    create table if not exists orders (
      id integer primary key,
      user_id integer not null references users(id) on delete cascade,
      title text not null,
      amount_cents integer not null,
      method text not null,
      status text not null default 'pending',
      reference text not null default '',
      created_at integer not null default (unixepoch()),
      paid_at integer
    );
    create table if not exists order_items (
      order_id integer not null references orders(id) on delete cascade,
      product_id integer not null references products(id) on delete cascade,
      primary key (order_id, product_id)
    );
    create table if not exists bundle_items (
      bundle_id integer not null references bundles(id) on delete cascade,
      product_id integer not null references products(id) on delete cascade,
      primary key (bundle_id, product_id)
    );
  `);
  const has = (table: string, col: string) => (db.prepare(`pragma table_info(${table})`).all() as { name: string }[]).some((c) => c.name === col);
  if (!has("users", "google")) db.exec("alter table users add column google integer not null default 0");
  const empty = (db.prepare("select count(*) n from products").get() as { n: number }).n === 0;
  if (empty) seed(db);
  return db;
}

export const db = globalForDb.db ?? (globalForDb.db = open());
