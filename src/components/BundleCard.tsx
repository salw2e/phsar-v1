import Link from "next/link";
import { money, type Bundle } from "@/lib/store";

export const bundleBg = (color: string) => `radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, ${color} 92%, white), ${color} 45%, color-mix(in srgb, ${color} 45%, #07080c))`;

export function BundleCard({ b }: { b: Bundle }) {
  return (
    <Link href={`/b/${b.slug}`} className="relative block overflow-hidden rounded-[24px] border-[1.5px] border-white/10 p-5" style={{ background: bundleBg(b.color) }}>
      <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/15 text-white">›</span>
      <div className="font-head text-xl font-extrabold">{b.name}</div>
      <p className="mt-1 max-w-[80%] text-[13.5px] text-white/75">{b.blurb || `${b.items} items`}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-head text-xl font-extrabold">{money(b.price_cents)}</span>
        {b.compare_cents && <span className="text-sm text-white/50 line-through">{money(b.compare_cents)}</span>}
      </div>
    </Link>
  );
}
