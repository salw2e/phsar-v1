import type Database from "better-sqlite3";

export const defaults: Record<string, string> = {
  name: "phsar",
  byline: "open source store",
  heroTitle: "apps, templates and other stuff",
  searchHint: "Search",
  accent: "#3b6cf6",
  footerBlurb: "Demo store. Nothing here is real, the products are placeholders.",
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
  name: string; art: string; tagline: string; about: string; price: number; compare?: number; color: string; cat: string; platforms: string;
  featured?: boolean; isNew?: boolean; shots: number; reviews?: [string, number, string][];
};

const products: P[] = [
  { name: "Ledger Lite", art: "ledger", tagline: "Money tracker", price: 1400, color: "#2563eb", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3,
    about: "Track what you spend, set a budget for each category and see where the month went.\n\nWorks offline. No account, no bank login. Export to CSV whenever you want.",
    reviews: [["dara", 5, "does what it says, csv export works"], ["mina", 5, "simple, no account needed"], ["alex", 4, "wish it had widgets but good"]] },
  { name: "Focus Timer", art: "focus", tagline: "Pomodoro timer", price: 900, color: "#1f2937", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3,
    about: "25 minutes of work, 5 minutes of break, repeat. Change the lengths if you want.\n\nTurns on do not disturb while a session runs and keeps a streak of the days you used it.",
    reviews: [["sok", 5, "clean"], ["june", 4, "tick sound is nice. long break should be 30 by default"]] },
  { name: "Sunny Notes", art: "notes", tagline: "Notes app", price: 900, color: "#ca8a04", cat: "Apps", platforms: "iOS,Android", featured: true, shots: 3,
    about: "Open it and type. Pin the notes you need on top, search finds text inside every note.\n\nNotes stay on your phone.",
    reviews: [["lina", 5, "search is fast"], ["tom", 4, "good, needs a dark mode"], ["vuthy", 5, ""]] },
  { name: "Dash Kit", art: "dash", tagline: "Admin dashboard template", price: 2500, compare: 3900, color: "#7c3aed", cat: "Templates", platforms: "Web", isNew: true, shots: 2,
    about: "42 screens for an admin panel: tables, charts, settings, login and signup. Next.js and Tailwind, dark and light.",
    reviews: [["kim", 5, "saved me a week"]] },
  { name: "Landing One", art: "landing", tagline: "Landing page template", price: 1400, color: "#db2777", cat: "Templates", platforms: "Web", shots: 2,
    about: "One HTML file with a hero, pricing and FAQ. No build step, change the text and upload it." },
  { name: "Line Icons", art: "icons", tagline: "600 outline icons", price: 900, color: "#059669", cat: "Icons", platforms: "SVG,PNG", shots: 2,
    about: "600 icons drawn on a 24px grid in three stroke weights. SVG and PNG.",
    reviews: [["rath", 5, "used it in two projects already"], ["ben", 4, "missing a few brand icons"]] },
  { name: "Mono Grotesk", art: "font", tagline: "Display font, 8 weights", price: 1900, color: "#ea580c", cat: "Fonts", platforms: "OTF,WOFF2", shots: 2,
    about: "A display font in 8 weights with italics, tabular figures and currency symbols. Desktop and web license." },
  { name: "Clip Vault", art: "clip", tagline: "Clipboard history", price: 500, color: "#0891b2", cat: "Tools", platforms: "macOS,Windows", shots: 2,
    about: "Keeps everything you copy for 30 days. Search it, pin the clips you paste all the time." },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function seed(db: Database.Database) {
  const run = db.transaction(() => {
    const cat = db.prepare("insert into categories (slug, name, position) values (?, ?, ?)");
    const catId: Record<string, number> = {};
    categories.forEach((c, i) => (catId[c] = Number(cat.run(slug(c), c, i).lastInsertRowid)));

    const product = db.prepare(`insert into products
      (slug, name, tagline, description, price_cents, compare_cents, color, category_id, platforms, featured, is_new, position, icon)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const shot = db.prepare("insert into media (product_id, url, caption, color, position) values (?, ?, ?, ?, ?)");
    const review = db.prepare("insert into reviews (product_id, author, rating, body, created_at) values (?, ?, ?, ?, unixepoch() - ?)");
    const ids: Record<string, number> = {};
    products.forEach((p, i) => {
      const id = Number(product.run(slug(p.name), p.name, p.tagline, p.about, p.price,
        p.compare ?? null, p.color, catId[p.cat], p.platforms, p.featured ? 1 : 0, p.isNew ? 1 : 0, i, `/demo/${p.art}.png`).lastInsertRowid);
      ids[p.name] = id;
      for (let n = 0; n < p.shots; n++) shot.run(id, `/demo/${p.art}-${n + 1}.webp`, p.name, p.color, n);
      (p.reviews ?? []).forEach(([author, rating, body], n) => review.run(id, author, rating, body, (n + 1) * 86400 * 3 + i * 40000));
    });

    const bundle = Number(db.prepare("insert into bundles (slug, name, blurb, price_cents, compare_cents, color) values (?, ?, ?, ?, ?, ?)")
      .run("starter-pack", "Starter Pack", "Ledger Lite, Focus Timer and Sunny Notes", 2400, 3200, "#4338ca").lastInsertRowid);
    const item = db.prepare("insert into bundle_items (bundle_id, product_id) values (?, ?)");
    for (const n of ["Ledger Lite", "Focus Timer", "Sunny Notes"]) item.run(bundle, ids[n]);
  });
  run();
}
