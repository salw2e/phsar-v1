import { Suspense } from "react";
import { setOrder } from "@/app/actions/admin";
import { skeleton } from "@/components/admin/ui";
import { day, methodName, Status } from "@/components/Status";
import { requireOwner } from "@/lib/auth";
import { allOrders } from "@/lib/orders";
import { money } from "@/lib/store";

async function List() {
  await requireOwner();
  const orders = allOrders();
  const paid = orders.filter((o) => o.status === "paid");
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Orders <span className="text-muted">{orders.length}</span></h1>
      <p className="mt-1 text-sm text-muted">{paid.length} paid · {money(paid.reduce((n, o) => n + o.amount_cents, 0))}</p>
      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-line bg-card p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold">{o.title} · {money(o.amount_cents)}</div>
                <div className="truncate text-xs text-muted">{o.email} · {day(o.created_at)} · {methodName[o.method] ?? o.method}</div>
              </div>
              <Status status={o.status} />
            </div>
            {o.method === "crypto" && o.reference && <div className="mt-2 select-all break-all font-mono text-xs text-muted">{o.reference}</div>}
            {(o.status === "pending" || o.status === "review") && (
              <form action={setOrder} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <button name="status" value="paid" className="h-9 rounded-full bg-accent px-4 text-[13px] font-bold text-white">Mark paid</button>
                <button name="status" value="cancelled" className="h-9 rounded-full border border-line px-4 text-[13px] font-semibold">Cancel</button>
              </form>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="py-10 text-center text-sm text-muted">No orders yet.</p>}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><List /></Suspense>;
}
