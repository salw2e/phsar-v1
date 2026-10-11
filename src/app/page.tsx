import Link from "next/link";
import { Suspense } from "react";
import { BundleCard } from "@/components/BundleCard";
import { ProductCard } from "@/components/ProductCard";
import { Shell } from "@/components/Shell";
import { getBundles, getCategories, getProducts, getSettings } from "@/lib/store";

type Search = Promise<{ q?: string; c?: string }>;

async function Catalog({ searchParams }: { searchParams: Search }) {
  const { q = "", c = "" } = await searchParams;
  const [s, categories, products, bundles] = await Promise.all([getSettings(), getCategories(), getProducts(q, c), getBundles()]);
  const filtering = q !== "" || c !== "";
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <form action="/" className="mt-6 flex h-12 items-center rounded-xl border border-line bg-card pl-4 pr-1.5">
        <input name="q" defaultValue={q} placeholder={`${s.searchHint} (${products.length})`}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
        {c && <input type="hidden" name="c" value={c} />}
        <button aria-label="Search" className="grid size-9 place-items-center rounded-lg bg-accent text-white">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" />
          </svg>
        </button>
      </form>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={c === cat.slug ? "/" : `/?c=${cat.slug}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${c === cat.slug ? "border-accent bg-accent text-white" : "border-line bg-card"}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      {filtering ? (
        <section className="mt-8">
          <h2 className="text-[15px] font-bold">{products.length} found</h2>
          <div className="mt-3 space-y-3">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-9">
              <h2 className="text-[15px] font-bold">Featured</h2>
              <div className="mt-3 space-y-3">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </section>
          )}
          {bundles.length > 0 && <div className="mt-3 space-y-3">{bundles.map((b) => <BundleCard key={b.id} b={b} />)}</div>}
          <section className="mt-9">
            <h2 className="text-[15px] font-bold">All products</h2>
            <div className="mt-3 space-y-3">{products.filter((p) => !p.featured).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </section>
        </>
      )}
    </>
  );
}

export default function Home({ searchParams }: { searchParams: Search }) {
  return (
    <Shell>
      <Hero />
      <Suspense fallback={<div className="mt-6 h-12 animate-pulse rounded-xl bg-card" />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </Shell>
  );
}

async function Hero() {
  const s = await getSettings();
  return <h1 className="mx-auto mt-6 max-w-[14ch] text-center text-[26px] font-black uppercase leading-[1.15] tracking-tight">{s.heroTitle}</h1>;
}
