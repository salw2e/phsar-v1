import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { library } from "@/lib/orders";
import { size } from "@/lib/store";

async function List() {
  const user = await requireUser("/library");
  const items = library(user.id);
  return (
    <>
      <h1 className="mt-4 text-xl font-extrabold">Library</h1>
      <div className="mt-4 space-y-2">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <Icon name={p.name} color={p.color} src={p.icon} size={48} />
            <Link href={`/p/${p.slug}`} className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{p.name}</div>
              <div className="truncate text-xs text-muted">{p.file ? `${p.file} · ${size(p.size ?? 0)}` : "No file added yet"}</div>
            </Link>
            {p.file && <a href={`/dl/${p.id}`} className="flex h-9 shrink-0 items-center rounded-full bg-accent px-4 text-[13px] font-bold text-white">Download</a>}
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Nothing here yet. <Link href="/" className="font-semibold text-text">Browse the store</Link></p>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-2xl bg-card" />}><List /></Suspense>
    </Shell>
  );
}
