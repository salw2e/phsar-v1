import "server-only";
import { db } from "./db";
import { origin } from "./limit";
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
export async function startStripe(order: { id: number; title: string; amount_cents: number }, email: string) {
  const site = await origin();
  const s = await stripe("checkout/sessions", {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(order.amount_cents),
    "line_items[0][price_data][product_data][name]": order.title,
    client_reference_id: String(order.id),
    customer_email: email,
    success_url: `${site}/orders/${order.id}`,
    cancel_url: `${site}/orders/${order.id}`,
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

const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
export const isTron = (address: string) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
type Transfer = { transaction_id: string; to: string; value: string; block_timestamp: number; token_info?: { address: string } };

let checked = 0;

// usdt sent to a tron wallet settles the open order with exactly that amount, no tx id needed
// ponytail: at most one look every 15s and only the last 200 transfers per wallet
export async function syncCrypto() {
  if (Date.now() - checked < 15_000) return;
  checked = Date.now();
  db.prepare("update orders set status = 'cancelled' where method = 'crypto' and status = 'pending' and created_at < unixepoch() - 86400").run();
  const open = db.prepare("select * from orders where method = 'crypto' and status in ('pending', 'review') order by id").all() as Order[];
  const tron = wallets().filter((w) => isTron(w.address));
  if (!open.length || !tron.length) return;
  const since = Math.min(...open.map((o) => o.created_at)) * 1000;
  const used = new Set((db.prepare("select reference from orders where method = 'crypto' and status = 'paid'").all() as { reference: string }[]).map((r) => r.reference));
  const settle = db.prepare("update orders set status = 'paid', paid_at = unixepoch(), reference = ? where id = ? and status in ('pending', 'review')");

  for (const w of tron) {
    const url = `https://api.trongrid.io/v1/accounts/${w.address}/transactions/trc20?only_confirmed=true&only_to=true&limit=200&contract_address=${USDT}&min_timestamp=${since}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
    if (!res?.ok) {
      console.error("trongrid:", res?.status ?? "no reply");
      continue;
    }
    const transfers: Transfer[] = (await res.json()).data ?? [];
    for (const t of transfers.reverse()) {
      if (t.to !== w.address || t.token_info?.address !== USDT || used.has(t.transaction_id)) continue;
      const o = open.find((x) => x.status !== "paid" && String(x.amount_cents * 10000) === t.value && t.block_timestamp >= x.created_at * 1000);
      if (!o) continue;
      settle.run(t.transaction_id, o.id);
      o.status = "paid";
      used.add(t.transaction_id);
    }
  }
}
