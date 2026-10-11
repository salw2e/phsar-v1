import Link from "next/link";
import { money, type Bundle } from "@/lib/store";

export function BundleCard({ b }: { b: Bundle }) {
  return (
    <Link href={`/b/${b.slug}`} className="relative block overflow-hidden rounded-2xl border border-line p-5"
      style={{ background: `linear-gradient(150deg, ${b.color}, #0d0d12 80%)` }}>
      <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/15 text-white">›</span>
      <div className="text-xl font-extrabold">{b.name}</div>
      <p className="mt-1 max-w-[80%] text-[13px] text-white/75">{b.blurb} {b.items} items.</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-xl font-extrabold">{money(b.price_cents)}</span>
        {b.compare_cents && <span className="text-sm text-white/50 line-through">{money(b.compare_cents)}</span>}
      </div>
    </Link>
  );
}
