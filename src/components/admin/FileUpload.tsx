"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { file as fileInput } from "./ui";

export function FileUpload({ productId, current }: { productId: number; current: string | null }) {
  const router = useRouter();
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState("");
  const url = `/admin/products/${productId}/file`;

  function send(f: File) {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-file-name", encodeURIComponent(f.name));
    xhr.upload.onprogress = (e) => setPct(Math.round((e.loaded / e.total) * 100));
    xhr.onloadend = () => {
      setPct(null);
      if (xhr.status === 200) router.refresh();
      else setError("Upload failed, try again.");
    };
    setError("");
    setPct(0);
    xhr.send(f);
  }

  async function remove() {
    if (!confirm("Remove the file? Buyers will have nothing to download.")) return;
    await fetch(url, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-2xl border border-line bg-card p-4">
      {current
        ? <div className="flex items-center justify-between gap-3 text-sm">
            <a href={`/dl/${productId}`} className="min-w-0 truncate font-semibold">{current}</a>
            <button type="button" onClick={remove} className="shrink-0 text-xs font-semibold text-red-400">Remove</button>
          </div>
        : <p className="text-sm text-muted">No file yet. Buyers get this after they pay.</p>}
      {pct === null
        ? <input type="file" aria-label="Download file" onChange={(e) => e.target.files?.[0] && send(e.target.files[0])} className={`${fileInput} mt-3 file:!bg-bg`} />
        : <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg" role="progressbar" aria-valuenow={pct}>
            <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
          </div>}
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
