import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { bundleBg } from "@/components/BundleCard";
import { ProductCard } from "@/components/ProductCard";
import { Shell } from "@/components/Shell";
import { getBundle, money } from "@/lib/store";

async function View({ slug }: { slug: string }) {
  const b = await getBundle(slug);
  if (!b) notFound();
  return (
    <>
      <div className="mt-4 rounded-[24px] border-[1.5px] border-white/10 p-5" style={{ background: bundleBg(b.color) }}>
        <h1 className="font-head text-2xl font-extrabold">{b.name}</h1>
        <p className="mt-1 text-sm text-white/75">{b.blurb}</p>
        <Link href={`/checkout?b=${b.slug}`} className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-bold text-black">
          Buy {money(b.price_cents)}
          {b.compare_cents && <span className="text-sm font-medium text-black/45 line-through">{money(b.compare_cents)}</span>}
        </Link>
      </div>
      <h2 className="mt-9 font-head text-[19px] font-extrabold tracking-tight">In this bundle</h2>
      <div className="mt-4 space-y-3.5">{b.products.map((p) => <ProductCard key={p.id} p={{ ...p, media: [] }} />)}</div>
    </>
  );
}

export default function Page({ params }: PageProps<"/b/[slug]">) {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-2xl bg-card" />}>
        {params.then(({ slug }) => <View slug={slug} />)}
      </Suspense>
    </Shell>
  );
}
