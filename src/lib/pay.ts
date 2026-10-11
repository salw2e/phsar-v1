import "server-only";
import { db } from "./db";
import { setStatus, type Order } from "./orders";

export const secret = (key: string) => (db.prepare("select value from secrets where key = ?").get(key) as { value: string } | undefined)?.value ?? "";
export const setSecret = (key: string, value: string) =>
  db.prepare("insert into secrets (key, value) values (?, ?) on conflict(key) do update set value = excluded.value").run(key, value);

export const wallets = () =>
  secret("wallets").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(":");
    return i > 0 ? { label: l.slice(0, i).trim(), address: l.slice(i + 1).trim() } : { label: "Wallet", address: l };
  });

export const methods = () => ({ stripe: secret("stripeKey") !== "", crypto: wallets().length > 0 });

type Session = { id: string; url: string; status: string; payment_status: string; amount_total: number; client_reference_id: string };

async function stripe(path: string, body?: Record<string, string>): Promise<Session> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${secret("stripeKey")}` },
    body: body && new URLSearchParams(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? `stripe ${res.status}`);
  return json;
}

// ponytail: usd only, add a currency setting when someone needs another
export async function startStripe(order: { id: number; title: string; amount_cents: number }, email: string, origin: string) {
  const s = await stripe("checkout/sessions", {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(order.amount_cents),
    "line_items[0][price_data][product_data][name]": order.title,
    client_reference_id: String(order.id),
    customer_email: email,
    success_url: `${origin}/orders/${order.id}`,
    cancel_url: `${origin}/orders/${order.id}`,
  });
  db.prepare("update orders set reference = ? where id = ?").run(s.id, order.id);
  return s.url;
}

// ponytail: no webhook, a card order is settled when the buyer lands back on their orders. add one if orders sit unpaid
export async function syncStripe(o: Order) {
  if (o.method !== "stripe" || o.status !== "pending" || !o.reference) return o;
  const s = await stripe(`checkout/sessions/${o.reference}`).catch(() => null);
  if (!s) return o;
  const paid = s.payment_status === "paid" && s.amount_total === o.amount_cents && s.client_reference_id === String(o.id);
  if (paid) setStatus(o.id, "paid");
  else if (s.status === "expired") setStatus(o.id, "cancelled");
  else return o;
  return { ...o, status: paid ? "paid" : "cancelled" };
}
