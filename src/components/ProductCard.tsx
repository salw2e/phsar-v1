import Link from "next/link";
import { money, type Product } from "@/lib/store";
import { Icon, Stars, Tags } from "./Icon";

export function Shot({ caption, color, url, kind }: { caption: string; color: string; url: string | null; kind?: string }) {
  return (
    <div className="relative aspect-[9/16] w-[31.6%] shrink-0 overflow-hidden rounded-[14px] border-[1.5px] border-line"
      style={{ background: url ? undefined : `color-mix(in srgb, ${color} 22%, var(--card))` }}>
      {url && kind === "video"
        ? <video src={url} muted loop autoPlay playsInline className="size-full object-cover" />
        : url
        ? <img src={url} alt={caption} loading="lazy" className="size-full object-cover" />
        : <span className="absolute inset-0 grid place-items-center px-2 text-center text-[11px] text-muted">{caption}</span>}
    </div>
  );
}

export function Price({ p }: { p: { price_cents: number; compare_cents: number | null } }) {
  return (
    <div className="shrink-0 text-right">
      <span className="pill inline-block rounded-full px-3.5 py-[7px] font-head text-[15px] font-extrabold leading-none">{p.price_cents === 0 ? "Free" : money(p.price_cents)}</span>
      {p.compare_cents && <div className="mt-1 pr-1 text-[11px] text-muted line-through">{money(p.compare_cents)}</div>}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/p/${p.slug}`} className="relative block rounded-[24px] border-[1.5px] border-line bg-card/85 p-3 backdrop-blur-sm">
      {p.is_new && (
        <span className="absolute -top-2 right-4 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
          New
        </span>
      )}
      <div className="flex items-start gap-3.5">
        <Icon name={p.name} color={p.color} src={p.icon} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-head text-[17px] font-bold leading-tight">{p.name}</div>
          <div className="truncate text-[14.5px] text-muted">{p.tagline}</div>
          {p.reviews > 0 && (
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted">
              <Stars rating={p.rating} /> {p.reviews}
            </div>
          )}
          {p.platforms.length > 0 && <div className="mt-2"><Tags tags={p.platforms} /></div>}
        </div>
        <Price p={p} />
      </div>
      {p.media.length > 0 && (
        <div className="no-scrollbar mt-3.5 flex gap-[2.6%] overflow-x-auto">
          {p.media.map((m) => <Shot key={m.id} caption={m.caption} color={m.color} url={m.url} kind={m.kind} />)}
        </div>
      )}
    </Link>
  );
}
