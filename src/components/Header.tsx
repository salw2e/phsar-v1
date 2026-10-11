import Link from "next/link";
import { Suspense } from "react";
import { currentUser } from "@/lib/auth";
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

const pill = "flex h-10 items-center gap-1 rounded-full border border-line bg-card px-4 text-sm font-semibold";

function SignIn() {
  return <Link href="/login" className={pill}>Sign in <span className="text-muted">›</span></Link>;
}

async function Account() {
  const user = await currentUser();
  if (!user) return <SignIn />;
  return (
    <>
      {user.role === "owner" && <Link href="/admin" className={pill}>Admin</Link>}
      <Link href="/account" aria-label="Account" className="grid size-10 place-items-center rounded-full bg-accent text-sm font-bold text-white">
        {(user.name || user.email).slice(0, 1).toUpperCase()}
      </Link>
    </>
  );
}

export function Header({ s }: { s: Settings }) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <Logo s={s} />
      <div className="flex items-center gap-2">
        <Suspense fallback={<SignIn />}>
          <Account />
        </Suspense>
      </div>
    </header>
  );
}
