import type Database from "better-sqlite3";

const settings: Record<string, string> = {
  name: "phsar",
  byline: "open source store",
  heroTitle: "Apps and digital goods",
  searchHint: "Search the store",
  accent: "#3b6cf6",
  footerBlurb: "Set this text, the name, the colours and everything else from the admin.",
};

const categories = ["Apps", "Templates", "Icons", "Fonts", "Tools"];

type P = {
  name: string; tagline: string; price: number; compare?: number; color: string; cat: string; platforms: string;
  featured?: boolean; isNew?: boolean; rating: number; reviews: number; shots: [string, string][];
};

const products: P[] = [
  { name: "Ledger Lite", tagline: "Simple money tracker", price: 1400, color: "#3b6cf6", cat: "Apps", platforms: "Desktop & Mobile,iOS",
    featured: true, rating: 5, reviews: 10, shots: [["Track every cent", "#1e3a8a"], ["Budgets that hold", "#1d4ed8"], ["See the month", "#312e81"]] },
  { name: "Focus Timer", tagline: "Pomodoro without the noise", price: 900, color: "#111827", cat: "Apps", platforms: "Mobile,iOS & Android",
    featured: true, rating: 4.5, reviews: 4, shots: [["One tap to start", "#0f172a"], ["Streaks", "#134e4a"], ["Quiet by default", "#1f2937"]] },
  { name: "Sunny Notes", tagline: "Notes that feel like paper", price: 900, color: "#facc15", cat: "Apps", platforms: "Mobile,iOS & Android",
    featured: true, rating: 4, reviews: 7, shots: [["Write anything", "#ca8a04"], ["Pin what matters", "#a16207"], ["Find it later", "#854d0e"]] },
  { name: "Dash Kit", tagline: "Admin dashboard template", price: 2500, compare: 3900, color: "#8b5cf6", cat: "Templates", platforms: "Desktop",
    isNew: true, rating: 5, reviews: 3, shots: [["Tables and charts", "#4c1d95"], ["Dark and light", "#5b21b6"]] },
  { name: "Landing One", tagline: "One page site template", price: 1400, color: "#ec4899", cat: "Templates", platforms: "Desktop & Mobile",
    rating: 4.5, reviews: 12, shots: [["Hero, pricing, FAQ", "#9d174d"], ["Mobile first", "#831843"]] },
  { name: "Line Icons", tagline: "600 outline icons", price: 900, color: "#10b981", cat: "Icons", platforms: "Desktop",
    rating: 5, reviews: 21, shots: [["SVG and PNG", "#065f46"], ["Three weights", "#064e3b"]] },
  { name: "Mono Grotesk", tagline: "A sturdy display font", price: 1900, color: "#f97316", cat: "Fonts", platforms: "Desktop",
    rating: 4, reviews: 5, shots: [["Eight weights", "#9a3412"], ["Latin and Khmer", "#7c2d12"]] },
  { name: "Clip Vault", tagline: "Clipboard history tool", price: 500, color: "#06b6d4", cat: "Tools", platforms: "Desktop",
    rating: 4.5, reviews: 9, shots: [["Everything you copied", "#155e75"], ["Search it", "#164e63"]] },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function seed(db: Database.Database) {
  const run = db.transaction(() => {
    const set = db.prepare("insert or ignore into settings (key, value) values (?, ?)");
    for (const [k, v] of Object.entries(settings)) set.run(k, v);

    const cat = db.prepare("insert into categories (slug, name, position) values (?, ?, ?)");
    const catId: Record<string, number> = {};
    categories.forEach((c, i) => (catId[c] = Number(cat.run(slug(c), c, i).lastInsertRowid)));

    const product = db.prepare(`insert into products
      (slug, name, tagline, description, price_cents, compare_cents, color, category_id, platforms, featured, is_new, rating, reviews, position)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const shot = db.prepare("insert into media (product_id, caption, color, position) values (?, ?, ?, ?)");
    const ids: Record<string, number> = {};
    products.forEach((p, i) => {
      const id = Number(product.run(slug(p.name), p.name, p.tagline, `${p.tagline}. Demo product, replace it with your own.`, p.price,
        p.compare ?? null, p.color, catId[p.cat], p.platforms, p.featured ? 1 : 0, p.isNew ? 1 : 0, p.rating, p.reviews, i).lastInsertRowid);
      ids[p.name] = id;
      p.shots.forEach(([caption, color], n) => shot.run(id, caption, color, n));
    });

    const bundle = Number(db.prepare("insert into bundles (slug, name, blurb, price_cents, compare_cents, color) values (?, ?, ?, ?, ?, ?)")
      .run("starter-pack", "Starter Pack", "Three apps, one price.", 2400, 3200, "#4f46e5").lastInsertRowid);
    const item = db.prepare("insert into bundle_items (bundle_id, product_id) values (?, ?)");
    for (const n of ["Ledger Lite", "Focus Timer", "Sunny Notes"]) item.run(bundle, ids[n]);
  });
  run();
}
