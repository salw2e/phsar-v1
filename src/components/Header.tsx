import Link from "next/link";
import type { Settings } from "@/lib/store";

export function Logo({ s }: { s: Settings }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-lg font-black text-white">
        {s.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold uppercase tracking-wide">{s.name}</span>
        {s.byline && <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.14em] text-muted">{s.byline}</span>}
      </span>
    </Link>
  );
}

export function Header({ s }: { s: Settings }) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <Logo s={s} />
      <div className="flex items-center gap-2">
        <Link href="/login" className="flex h-10 items-center gap-1 rounded-full border border-line bg-card px-4 text-sm font-semibold">
          Sign in <span className="text-muted">›</span>
        </Link>
        <button aria-label="Menu" className="grid size-10 place-items-center rounded-full border border-line bg-card">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
          </svg>
        </button>
      </div>
    </header>
  );
}
