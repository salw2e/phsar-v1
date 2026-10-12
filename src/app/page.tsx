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
      <form action="/" className="mt-7 flex h-[50px] items-center rounded-2xl border-[1.5px] border-line bg-card/80 pl-4 pr-1.5 backdrop-blur-sm">
        <input name="q" defaultValue={q} placeholder={`${s.searchHint} (${products.length})`}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted" />
        {c && <input type="hidden" name="c" value={c} />}
        <button aria-label="Search" className="btn glow grid size-[38px] place-items-center rounded-[11px] text-white">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" />
          </svg>
        </button>
      </form>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={c === cat.slug ? "/" : `/?c=${cat.slug}`}
            className={`shrink-0 rounded-full px-4 py-[7px] text-sm font-medium ${c === cat.slug ? "bg-accent text-white" : "bg-[#14161d] text-muted"}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      {filtering ? (
        <section className="mt-8">
          <h2 className="font-head text-[19px] font-extrabold tracking-tight">{products.length} found</h2>
          <div className="mt-3 space-y-3">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-10">
              <h2 className="font-head text-[19px] font-extrabold tracking-tight">Featured</h2>
              <div className="mt-4 space-y-3.5">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </section>
          )}
          {bundles.length > 0 && <div className="mt-3.5 space-y-3.5">{bundles.map((b) => <BundleCard key={b.id} b={b} />)}</div>}
          <section className="mt-9">
            <h2 className="font-head text-[19px] font-extrabold tracking-tight">All products</h2>
            <div className="mt-4 space-y-3.5">{products.filter((p) => !p.featured).map((p) => <ProductCard key={p.id} p={p} />)}</div>
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
  return <h1 className="mx-auto mt-7 max-w-[17ch] text-balance text-center font-hero text-[31px] font-extrabold uppercase leading-[1.08] tracking-[0.01em] [font-stretch:80%]">{s.heroTitle}</h1>;
}
