import type Database from "better-sqlite3";

const settings: Record<string, string> = {
  name: "phsar",
  byline: "",
  heroTitle: "apps, templates and other stuff",
  searchHint: "Search",
  accent: "#3b6cf6",
  footerBlurb: "",
};

const categories = ["Apps", "Templates", "Icons", "Fonts", "Tools"];

type P = {
  name: string; tagline: string; price: number; compare?: number; color: string; cat: string; platforms: string;
  featured?: boolean; isNew?: boolean; shots: number;
};

const products: P[] = [
  { name: "Ledger Lite", tagline: "money tracker", price: 1400, color: "#2563eb", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3 },
  { name: "Focus Timer", tagline: "pomodoro timer", price: 900, color: "#374151", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3 },
  { name: "Sunny Notes", tagline: "notes app", price: 900, color: "#ca8a04", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3 },
  { name: "Dash Kit", tagline: "admin dashboard template", price: 2500, compare: 3900, color: "#7c3aed", cat: "Templates", platforms: "Web", isNew: true, shots: 2 },
  { name: "Landing One", tagline: "landing page template", price: 1400, color: "#db2777", cat: "Templates", platforms: "Web", shots: 2 },
  { name: "Line Icons", tagline: "600 outline icons, svg + png", price: 900, color: "#059669", cat: "Icons", platforms: "", shots: 2 },
  { name: "Mono Grotesk", tagline: "display font, 8 weights", price: 1900, color: "#ea580c", cat: "Fonts", platforms: "", shots: 2 },
  { name: "Clip Vault", tagline: "clipboard history", price: 500, color: "#0891b2", cat: "Tools", platforms: "macOS,Windows", shots: 2 },
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
      (slug, name, tagline, description, price_cents, compare_cents, color, category_id, platforms, featured, is_new, position)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const shot = db.prepare("insert into media (product_id, caption, color, position) values (?, ?, ?, ?)");
    const ids: Record<string, number> = {};
    products.forEach((p, i) => {
      const id = Number(product.run(slug(p.name), p.name, p.tagline, "demo product", p.price,
        p.compare ?? null, p.color, catId[p.cat], p.platforms, p.featured ? 1 : 0, p.isNew ? 1 : 0, i).lastInsertRowid);
      ids[p.name] = id;
      for (let n = 0; n < p.shots; n++) shot.run(id, "screenshot", p.color, n);
    });

    const bundle = Number(db.prepare("insert into bundles (slug, name, blurb, price_cents, compare_cents, color) values (?, ?, ?, ?, ?, ?)")
      .run("starter-pack", "Starter Pack", "", 2400, 3200, "#4338ca").lastInsertRowid);
    const item = db.prepare("insert into bundle_items (bundle_id, product_id) values (?, ?)");
    for (const n of ["Ledger Lite", "Focus Timer", "Sunny Notes"]) item.run(bundle, ids[n]);
  });
  run();
}
