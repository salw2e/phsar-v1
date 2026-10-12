import Link from "next/link";
import { Suspense } from "react";
import { button, skeleton } from "@/components/admin/ui";
import { allBundles } from "@/lib/admin";
import { requireOwner } from "@/lib/auth";
import { money } from "@/lib/store";

async function List() {
  await requireOwner();
  const bundles = allBundles();
  return (
    <>
      <div className="mt-7 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Bundles <span className="text-muted">{bundles.length}</span></h1>
        <Link href="/admin/bundles/new" className={`${button} flex items-center`}>New bundle</Link>
      </div>
      <div className="mt-4 space-y-2">
        {bundles.map((b) => (
          <Link key={b.id} href={`/admin/bundles/${b.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <span className="size-11 shrink-0 rounded-xl" style={{ background: b.color }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{b.name}</div>
              <div className="truncate text-xs text-muted">{b.blurb}</div>
            </div>
            <span className="text-sm font-bold">{money(b.price_cents)}</span>
            <span className="text-muted">›</span>
          </Link>
        ))}
        {bundles.length === 0 && <p className="py-10 text-center text-sm text-muted">No bundles yet.</p>}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><List /></Suspense>;
}
