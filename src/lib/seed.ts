import type Database from "better-sqlite3";

export const defaults: Record<string, string> = {
  name: "phsar",
  byline: "",
  heroTitle: "apps, templates and other stuff",
  searchHint: "Search",
  accent: "#3b6cf6",
  footerBlurb: "",
  logo: "",
  pageTerms: `By buying from {name} you agree to this.

# What you get
Everything here is digital. After you pay it shows up in your library and you download it from there. You get a license to use it, not to resell or share it.

# Payments
Prices are in USD. Card payments go through Stripe. Crypto payments are final once confirmed.

# Refunds
Digital goods can't be returned. If a file is broken or not what the listing said, contact support and you get a fix or your money back.

# Accounts
Keep your login to yourself. Accounts used for fraud or chargebacks get closed.

# Changes
These terms can change. The current version is always on this page.`,
  pagePrivacy: `# What is stored
Your email, name, a hash of your password and your orders. If you sign in with Google, your name and email come from Google.

# Payments
Card details go straight to Stripe and never touch this site. For crypto only the transaction is seen.

# Cookies
One cookie, to keep you signed in. No tracking, no ads.

# Sharing
Your data is not sold or shared.

# Deleting it
Contact support and your account gets deleted.`,
  pageSupport: `Problem with an order or a download? Send your order number and what went wrong.

No contact added yet.`,
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
