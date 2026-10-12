import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { sendTx } from "@/app/actions/orders";
import { ActionForm } from "@/components/admin/Form";
import { input } from "@/components/admin/ui";
import { Shell } from "@/components/Shell";
import { day, methodName, Status } from "@/components/Status";
import { requireUser } from "@/lib/auth";
import { orderOf } from "@/lib/orders";
import { syncStripe, wallets } from "@/lib/pay";
import { money } from "@/lib/store";

async function View({ id }: { id: string }) {
  const user = await requireUser(`/orders/${id}`);
  const found = orderOf(user.id, Number(id));
  if (!found) notFound();
  const o = await syncStripe(found);
  const open = o.status === "pending" || o.status === "review";

  return (
    <>
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-extrabold leading-tight">{o.title}</h1>
          <Status status={o.status} />
        </div>
        <div className="mt-1 text-xs text-muted">Order {o.id} · {day(o.created_at)} · {methodName[o.method] ?? o.method}</div>
        <div className="mt-4 text-2xl font-extrabold">{money(o.amount_cents)}</div>
      </div>

      {o.status === "paid" && (
        <Link href="/library" className="mt-4 flex h-12 items-center justify-center rounded-xl bg-accent text-[15px] font-bold text-white">Library</Link>
      )}

      {o.method === "stripe" && o.status === "pending" && (
        <p className="mt-4 text-sm text-muted">Payment not completed</p>
      )}

      {o.method === "crypto" && open && (
        <>
          <h2 className="mt-7 text-[15px] font-bold">Send {money(o.amount_cents)} to</h2>
          <div className="mt-3 space-y-2">
            {wallets().map((w) => (
              <div key={w.address} className="rounded-2xl border border-line bg-card p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted">{w.label}</div>
                <div className="mt-1 select-all break-all font-mono text-[13px]">{w.address}</div>
              </div>
            ))}
          </div>
          <h2 className="mt-7 text-[15px] font-bold">Transaction ID</h2>
          <ActionForm action={sendTx} submit={o.status === "review" ? "Update" : "Submit"} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={o.id} />
            <input name="tx" defaultValue={o.reference} placeholder="Transaction ID / hash" required className={`${input} font-mono`} />
          </ActionForm>
          {o.status === "review" && <p className="mt-4 text-sm text-muted">Waiting for confirmation</p>}
        </>
      )}
    </>
  );
}

export default function Page({ params }: PageProps<"/orders/[id]">) {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-2xl bg-card" />}>
        {params.then(({ id }) => <View id={id} />)}
      </Suspense>
    </Shell>
  );
}
