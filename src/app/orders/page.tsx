import Link from "next/link";
import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { day, methodName, Status } from "@/components/Status";
import { requireUser } from "@/lib/auth";
import { ordersOf } from "@/lib/orders";
import { syncStripe } from "@/lib/pay";
import { money } from "@/lib/store";

async function List() {
  const user = await requireUser("/orders");
  const orders = await Promise.all(ordersOf(user.id).map(syncStripe));
  return (
    <>
      <h1 className="mt-4 text-xl font-extrabold">Orders</h1>
      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{o.title}</div>
              <div className="text-xs text-muted">{day(o.created_at)} · {methodName[o.method] ?? o.method} · {money(o.amount_cents)}</div>
            </div>
            <Status status={o.status} />
          </Link>
        ))}
        {orders.length === 0 && <p className="py-10 text-center text-sm text-muted">No orders yet.</p>}
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
