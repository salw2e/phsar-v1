"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrder, findItem, ownedIds, setStatus } from "@/lib/orders";
import { methods, startStripe } from "@/lib/pay";
import type { FormState } from "./admin";

export async function buy(_: FormState, f: FormData): Promise<FormState> {
  const p = String(f.get("p") ?? ""), b = String(f.get("b") ?? "");
  const user = await requireUser(`/checkout?${p ? `p=${p}` : `b=${b}`}`);
  const item = findItem(p, b);
  if (!item) return { error: "That one is gone." };
  const owned = ownedIds(user.id);
  if (item.products.every((x) => owned.includes(x.id))) redirect("/library");
  if (item.amount_cents === 0) {
    createOrder(user.id, item, "free", true);
    redirect("/library");
  }

  const on = methods();
  const method = String(f.get("method"));
  if (method === "crypto" && on.crypto) redirect(`/orders/${createOrder(user.id, item, "crypto")}`);
  if (method !== "stripe" || !on.stripe) return { error: "That way to pay is off right now." };

  const id = createOrder(user.id, item, "stripe");
  let url: string;
  try {
    url = await startStripe({ id, ...item }, user.email, (await headers()).get("origin") ?? "");
  } catch (e) {
    console.error("stripe:", (e as Error).message);
    setStatus(id, "cancelled");
    return { error: "Card payments are not working right now. Try again in a bit." };
  }
  redirect(url);
}

export async function sendTx(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser("/orders");
  const id = Number(f.get("id"));
  const tx = String(f.get("tx") ?? "").trim().slice(0, 200);
  if (tx.length < 8) return { error: "Paste the transaction id from your wallet." };
  const done = db.prepare(`
    update orders set reference = ?, status = 'review' where id = ? and user_id = ? and method = 'crypto' and status in ('pending', 'review')
  `).run(tx, id, user.id).changes;
  if (!done) return { error: "This order can't be changed any more." };
  redirect(`/orders/${id}`);
}
