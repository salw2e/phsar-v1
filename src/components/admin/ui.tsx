export const input = "h-11 w-full rounded-xl border border-line bg-card px-3.5 text-sm outline-none placeholder:text-muted focus:border-accent";
export const area = "w-full rounded-xl border border-line bg-card px-3.5 py-3 text-sm leading-relaxed outline-none placeholder:text-muted focus:border-accent";
export const file = "block w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-card file:px-4 file:text-sm file:font-semibold file:text-text";
export const button = "h-11 shrink-0 rounded-full bg-accent px-6 text-sm font-bold text-white disabled:opacity-60";
export const danger = "h-10 rounded-full border border-red-500/40 px-4 text-sm font-semibold text-red-400";
export const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Check({ name, label, on, value }: { name: string; label: string; on: boolean; value?: string | number }) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} value={value} defaultChecked={on} className="size-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

export function Color({ name, value }: { name: string; value: string }) {
  return <input type="color" name={name} defaultValue={value} className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-card p-1" />;
}

export const skeleton = <div className="mt-6 h-40 animate-pulse rounded-2xl bg-card" />;
