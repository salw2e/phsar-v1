import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buy } from "@/app/actions/orders";
import { ActionForm } from "@/components/admin/Form";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { findItem, ownedIds } from "@/lib/orders";
import { methods } from "@/lib/pay";
import { money } from "@/lib/store";

type Search = Promise<{ p?: string; b?: string }>;

async function View({ searchParams }: { searchParams: Search }) {
  const { p = "", b = "" } = await searchParams;
  const user = await requireUser(`/checkout?${p ? `p=${p}` : `b=${b}`}`);
  const item = findItem(p, b);
  if (!item) notFound();
  const owned = ownedIds(user.id);
  const on = methods();

  const pay = (label: string, method = "") => (
    <ActionForm action={buy} submit={label} className="mt-3 space-y-2 [&_button]:h-12 [&_button]:w-full [&_button]:rounded-xl [&_button]:text-[15px]">
      <input type="hidden" name="p" value={p} />
      <input type="hidden" name="b" value={b} />
      <input type="hidden" name="method" value={method} />
    </ActionForm>
  );

  return (
    <>
      <h1 className="mt-4 text-xl font-extrabold">Checkout</h1>
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        {item.products.length > 1 && <div className="pb-2 text-[15px] font-bold">{item.title}</div>}
        {item.products.map((x) => (
          <div key={x.id} className="flex justify-between py-1.5 text-sm">
            <span>{x.name}</span>
            <span className="text-muted">{money(x.price_cents)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-[15px] font-bold">
          <span>Total</span>
          <span>{money(item.amount_cents)}</span>
        </div>
      </div>
      <div className="mt-5">
        {item.products.every((x) => owned.includes(x.id))
          ? <p className="text-sm text-muted">You already have this. <Link href="/library" className="font-semibold text-text">Open your library</Link></p>
          : item.amount_cents === 0 ? pay("Get it free")
          : !on.stripe && !on.crypto ? <p className="text-sm text-muted">This store is not taking payments yet.</p>
          : <>{on.stripe && pay("Pay with card", "stripe")}{on.crypto && pay("Pay with crypto", "crypto")}</>}
      </div>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: Search }) {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-2xl bg-card" />}>
        <View searchParams={searchParams} />
      </Suspense>
    </Shell>
  );
}
