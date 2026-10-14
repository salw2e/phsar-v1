import "server-only";
import { headers } from "next/headers";

const hits = new Map<string, number[]>();

// in memory, per process. move to the db if this ever runs on more than one
export async function tooMany(what: string, max: number, minutes: number, count = true) {
  const h = await headers();
  const key = `${what}:${h.get("x-real-ip") ?? h.get("x-forwarded-for") ?? "local"}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < minutes * 60_000);
  if (count) recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(key, recent);
  return recent.length > max;
}

export async function origin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}
