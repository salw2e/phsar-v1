import Link from "next/link";
import { money, type Product } from "@/lib/store";
import { Icon, Stars, Tags } from "./Icon";

export function Shot({ caption, color, url, kind }: { caption: string; color: string; url: string | null; kind?: string }) {
  return (
    <div className="relative aspect-[9/16] w-[31.5%] shrink-0 overflow-hidden rounded-xl border border-line"
      style={{ background: url ? undefined : `color-mix(in srgb, ${color} 22%, var(--card))` }}>
      {url && kind === "video"
        ? <video src={url} muted loop autoPlay playsInline className="size-full object-cover" />
        : url
        ? <img src={url} alt={caption} className="size-full object-cover" />
        : <span className="absolute inset-0 grid place-items-center px-2 text-center text-[11px] text-muted">{caption}</span>}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/p/${p.slug}`} className="relative block rounded-2xl border border-line bg-card p-3.5">
      {p.is_new && (
        <span className="absolute -top-2 right-3 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
          New
        </span>
      )}
      <div className="flex items-start gap-3">
        <Icon name={p.name} color={p.color} src={p.icon} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold">{p.name}</div>
          <div className="truncate text-[13px] text-muted">{p.tagline}</div>
          {p.reviews > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
              <Stars rating={p.rating} /> {p.reviews}
            </div>
          )}
          <div className="mt-1.5"><Tags tags={p.platforms} /></div>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-block rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-extrabold text-accent">{money(p.price_cents)}</span>
          {p.compare_cents && <div className="mt-1 text-[11px] text-muted line-through">{money(p.compare_cents)}</div>}
        </div>
      </div>
      {p.media.length > 0 && (
        <div className="no-scrollbar mt-3.5 flex gap-[2.75%] overflow-x-auto">
          {p.media.map((m) => <Shot key={m.id} caption={m.caption} color={m.color} url={m.url} kind={m.kind} />)}
        </div>
      )}
    </Link>
  );
}
