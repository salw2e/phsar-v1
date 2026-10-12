import Link from "next/link";
import { Suspense } from "react";
import { currentUser } from "@/lib/auth";
import type { Settings } from "@/lib/store";

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <span className="btn grid shrink-0 place-items-center shadow-[inset_0_1px_0_#ffffff40]" style={{ width: size, height: size, borderRadius: size * 0.27 }}>
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 32 32" fill="none">
        <path fill="#fff" d="M7.2 6h17.6l3.7 7.6a3.1 3.1 0 0 1-6.25 0 3.1 3.1 0 0 1-6.25 0 3.1 3.1 0 0 1-6.25 0 3.1 3.1 0 0 1-6.25 0z" />
        <path stroke="#fff" strokeOpacity=".72" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M7.6 20v6h16.8v-6M13.6 26v-3.6h4.8V26" />
      </svg>
    </span>
  );
}

export function Logo({ s }: { s: Settings }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {s.logo ? <img src={s.logo} alt="" className="size-[30px] rounded-lg object-cover" /> : <Mark />}
      <span className="leading-none">
        <span className="block font-hero text-[19px] font-extrabold uppercase tracking-wide [font-stretch:85%]">{s.name}</span>
        {s.byline && <span className="mt-[3px] block text-[8.5px] font-medium uppercase tracking-[0.2em] text-muted">{s.byline}</span>}
      </span>
    </Link>
  );
}

const pill = "flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-line bg-bg/60 px-4 text-sm font-semibold";

function SignIn() {
  return <Link href="/login" className={pill}>Sign in <span className="text-muted">›</span></Link>;
}

async function Account() {
  const user = await currentUser();
  if (!user) return <SignIn />;
  return (
    <>
      {user.role === "owner" && <Link href="/admin" className={pill}>Admin</Link>}
      <Link href="/account" aria-label="Account" className="btn grid size-9 place-items-center rounded-full text-sm font-bold text-white">
        {(user.name || user.email).slice(0, 1).toUpperCase()}
      </Link>
    </>
  );
}

const menu = [["Browse", "/"], ["Library", "/library"], ["Orders", "/orders"], ["Account", "/account"], ["Support", "/support"]];

export function Header({ s }: { s: Settings }) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <Logo s={s} />
      <div className="flex items-center gap-2">
        <Suspense fallback={<SignIn />}>
          <Account />
        </Suspense>
        <button popoverTarget="menu" aria-label="Menu" className="grid size-9 place-items-center rounded-full border-[1.5px] border-line bg-bg/60">
          <svg width="16" height="12" viewBox="0 0 16 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1h14M1 6h14M1 11h14" /></svg>
        </button>
        <nav id="menu" popover="auto" className="fixed inset-auto right-[max(16px,calc(50vw-304px))] top-16 m-0 w-52 rounded-2xl border-[1.5px] border-line bg-card p-2 shadow-2xl">
          {menu.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-xl px-3.5 py-2.5 text-[15px] font-semibold hover:bg-white/5">{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
