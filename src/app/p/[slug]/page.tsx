import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon, Stars, Tags } from "@/components/Icon";
import { ProductCard, Shot } from "@/components/ProductCard";
import { Shell } from "@/components/Shell";
import { getProduct, getProducts, money } from "@/lib/store";

async function View({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p) notFound();
  const more = (await getProducts("", p.category ?? "")).filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <div className="mt-4 flex items-start gap-4">
        <Icon name={p.name} color={p.color} src={p.icon} size={84} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold leading-tight">{p.name}</h1>
          <p className="text-sm text-muted">{p.tagline}</p>
          {p.reviews > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted"><Stars rating={p.rating} /> {p.reviews}</div>}
          <div className="mt-2"><Tags tags={p.platforms} /></div>
        </div>
      </div>

      <Link href={`/checkout?p=${p.slug}`}
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-bold text-white">
        Buy {money(p.price_cents)}
        {p.compare_cents && <span className="text-sm font-medium text-white/60 line-through">{money(p.compare_cents)}</span>}
      </Link>

      {p.media.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 [&>*]:w-[46%]">
          {p.media.map((m) => <Shot key={m.id} caption={m.caption} color={m.color} url={m.url} kind={m.kind} />)}
        </div>
      )}

      <h2 className="mt-8 text-[15px] font-bold">About</h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{p.description}</p>

      {more.length > 0 && (
        <>
          <h2 className="mt-9 text-[15px] font-bold">More like this</h2>
          <div className="mt-3 space-y-3">{more.map((x) => <ProductCard key={x.id} p={{ ...x, media: [] }} />)}</div>
        </>
      )}
    </>
  );
}

export default function Page({ params }: PageProps<"/p/[slug]">) {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-4 h-24 animate-pulse rounded-2xl bg-card" />}>
        {params.then(({ slug }) => <View slug={slug} />)}
      </Suspense>
    </Shell>
  );
}
