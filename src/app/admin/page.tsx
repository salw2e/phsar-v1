import Link from "next/link";
import { Suspense } from "react";
import { button, skeleton } from "@/components/admin/ui";
import { Icon } from "@/components/Icon";
import { allProducts } from "@/lib/admin";
import { requireOwner } from "@/lib/auth";
import { money } from "@/lib/store";

async function List() {
  await requireOwner();
  const products = allProducts();
  return (
    <>
      <div className="mt-7 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Products <span className="text-muted">{products.length}</span></h1>
        <Link href="/admin/products/new" className={`${button} flex items-center`}>New product</Link>
      </div>
      <div className="mt-4 space-y-2">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <Icon name={p.name} color={p.color} src={p.icon} size={44} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{p.name}</div>
              <div className="truncate text-xs text-muted">
                {[!p.published && "Hidden", p.featured === 1 && "Featured", p.is_new === 1 && "New", p.tagline].filter(Boolean).join(" · ")}
              </div>
            </div>
            <span className="text-sm font-bold">{money(p.price_cents)}</span>
            <span className="text-muted">›</span>
          </Link>
        ))}
        {products.length === 0 && <p className="py-10 text-center text-sm text-muted">Nothing here yet.</p>}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><List /></Suspense>;
}
