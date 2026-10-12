export function Icon({ name, color, src, size = 58 }: { name: string; color: string; src?: string | null; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden font-head font-extrabold text-white"
      style={{
        width: size, height: size, borderRadius: size * 0.24, fontSize: size * 0.42,
        background: `linear-gradient(150deg, color-mix(in srgb, ${color} 88%, white), color-mix(in srgb, ${color} 80%, black))`,
      }}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : name.slice(0, 1)}
    </span>
  );
}

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-[3px]" role="img" aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20" className={rating >= n - 0.25 ? "text-text" : rating >= n - 0.75 ? "text-text/55" : "text-text/20"}>
          <path fill="currentColor" d="M10 1.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L10 15l-5.4 3 1.1-6.1L1.2 7.6l6.1-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full border-[1.5px] border-line px-2.5 py-[3px] text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">{t}</span>
      ))}
    </div>
  );
}
