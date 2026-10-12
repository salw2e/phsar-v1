import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon, Stars, Tags } from "@/components/Icon";
import { ProductCard, Shot } from "@/components/ProductCard";
import { ReviewForm, Reviews } from "@/components/Reviews";
import { Shell } from "@/components/Shell";
import { getProduct, getProducts, money } from "@/lib/store";

async function View({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p) notFound();
  const more = (await getProducts("", p.category ?? "")).filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <div className="mt-4 flex items-start gap-4">
        <Icon name={p.name} color={p.color} src={p.icon} size={92} />
        <div className="min-w-0 flex-1">
          <h1 className="font-head text-[22px] font-extrabold leading-tight">{p.name}</h1>
          <p className="text-[15px] text-muted">{p.tagline}</p>
          {p.reviews > 0 && <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-muted"><Stars rating={p.rating} /> {p.reviews}</div>}
          {p.platforms.length > 0 && <div className="mt-2"><Tags tags={p.platforms} /></div>}
        </div>
      </div>

      <Link href={`/checkout?p=${p.slug}`}
        className="btn glow mt-5 flex h-[50px] items-center justify-center gap-2 rounded-2xl font-head text-base font-bold text-white">
        {p.price_cents === 0 ? "Get" : `Buy ${money(p.price_cents)}`}
        {p.compare_cents && <span className="text-sm font-medium text-white/60 line-through">{money(p.compare_cents)}</span>}
      </Link>

      {p.media.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 [&>*]:w-[58%] [&>*]:rounded-[18px]">
          {p.media.map((m) => <Shot key={m.id} caption={m.caption} color={m.color} url={m.url} kind={m.kind} />)}
        </div>
      )}

      <h2 className="mt-9 font-head text-[19px] font-extrabold tracking-tight">About</h2>
      <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-muted">{p.description}</p>

      <h2 className="mt-9 font-head text-[19px] font-extrabold tracking-tight">Reviews</h2>
      <Reviews productId={p.id} rating={p.rating} count={p.reviews} />
      <Suspense><ReviewForm productId={p.id} /></Suspense>

      {more.length > 0 && (
        <>
          <h2 className="mt-10 font-head text-[19px] font-extrabold tracking-tight">Related</h2>
          <div className="mt-4 space-y-3.5">{more.map((x) => <ProductCard key={x.id} p={{ ...x, media: [] }} />)}</div>
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
