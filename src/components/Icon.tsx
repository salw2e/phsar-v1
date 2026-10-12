export function Icon({ name, color, src, size = 52 }: { name: string; color: string; src?: string | null; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden font-black text-white"
      style={{
        width: size, height: size, borderRadius: size * 0.22, fontSize: size * 0.4, background: color,
      }}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : name.slice(0, 1)}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[11px] tracking-[0.2em]" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={rating >= n - 0.25 ? "text-text" : rating >= n - 0.75 ? "text-text/60" : "text-text/25"}>★</span>
      ))}
    </span>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full border border-line px-2 py-[3px] text-[9px] font-bold uppercase tracking-wider text-muted">{t}</span>
      ))}
    </div>
  );
}
