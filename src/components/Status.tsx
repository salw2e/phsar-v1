const labels: Record<string, [string, string]> = {
  pending: ["Waiting for payment", "text-amber-400 bg-amber-400/10"],
  review: ["Checking payment", "text-sky-400 bg-sky-400/10"],
  paid: ["Paid", "text-emerald-400 bg-emerald-400/10"],
  cancelled: ["Cancelled", "text-muted bg-white/5"],
};

export function Status({ status }: { status: string }) {
  const [label, tone] = labels[status] ?? [status, "text-muted bg-white/5"];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{label}</span>;
}

export const methodName: Record<string, string> = { stripe: "Card", crypto: "Crypto", free: "Free" };
export const day = (unix: number) => new Date(unix * 1000).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
