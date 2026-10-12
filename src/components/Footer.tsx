import Link from "next/link";
import type { Settings } from "@/lib/store";
import { Logo } from "./Header";

const columns: [string, [string, string][]][] = [
  ["Store", [["Browse", "/"], ["Search", "/?q="], ["Support", "/support"]]],
  ["Account", [["Account", "/account"], ["Library", "/library"], ["Orders", "/orders"]]],
];

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="mt-14 border-t-[1.5px] border-line bg-bg/70 px-4 pb-10 pt-9">
      <Logo s={s} />
      {s.footerBlurb && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted">{s.footerBlurb}</p>}
      <div className="mt-9 grid grid-cols-2 gap-6">
        {columns.map(([title, links]) => (
          <div key={title}>
            <div className="font-head text-[15px] font-bold">{title}</div>
            <ul className="mt-3.5 space-y-3 text-[15px] text-muted">
              {links.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-9 flex flex-wrap gap-x-3.5 gap-y-2 border-t-[1.5px] border-line pt-5 text-[13px] font-medium text-muted">
        <Link href="/terms">Terms of Use</Link>
        <span className="text-line">|</span>
        <Link href="/privacy">Privacy Policy</Link>
        <span className="text-line">|</span>
        <Link href="/support">Support</Link>
      </div>
    </footer>
  );
}
