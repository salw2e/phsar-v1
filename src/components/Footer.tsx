import Link from "next/link";
import type { Settings } from "@/lib/store";
import { Logo } from "./Header";

const columns: [string, [string, string][]][] = [
  ["Store", [["Browse", "/"], ["Support", "/support"]]],
  ["Account", [["Account", "/account"], ["Library", "/library"], ["Orders", "/orders"]]],
];

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="mt-12 border-t border-line px-4 pb-10 pt-8">
      <Logo s={s} />
      {s.footerBlurb && <p className="mt-4 text-sm text-muted">{s.footerBlurb}</p>}
      <div className="mt-8 grid grid-cols-2 gap-6">
        {columns.map(([title, links]) => (
          <div key={title}>
            <div className="text-[13px] font-bold">{title}</div>
            <ul className="mt-3 space-y-2.5 text-[13px] text-muted">
              {links.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-5 text-xs text-muted">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
