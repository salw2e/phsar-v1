import { getSettings } from "@/lib/store";
import { Shell } from "./Shell";

export const textPages = { terms: ["Terms of Use", "pageTerms"], privacy: ["Privacy Policy", "pagePrivacy"], support: ["Support", "pageSupport"] } as const;

// blank line = new paragraph, a line starting with # = heading. thats the whole format
export async function TextPage({ page }: { page: keyof typeof textPages }) {
  const s = await getSettings();
  const [title, key] = textPages[page];
  const blocks = s[key].replaceAll("{name}", s.name).split(/\n\s*\n/).flatMap((b) => {
    const lines = b.trim().split("\n");
    return lines[0].startsWith("#") ? [lines[0], lines.slice(1).join("\n")] : [b.trim()];
  }).filter(Boolean);
  return (
    <Shell>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
        {blocks.map((b, i) => b.startsWith("#")
          ? <h2 key={i} className="!mt-7 text-[15px] font-bold text-text">{b.replace(/^#+\s*/, "")}</h2>
          : <p key={i} className="whitespace-pre-line break-words">{b}</p>)}
      </div>
    </Shell>
  );
}
