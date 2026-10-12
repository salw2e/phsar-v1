"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions/admin";
import { keep } from "../keep";
import { button } from "./ui";

type Action = (state: FormState, form: FormData) => Promise<FormState>;

export function ActionForm({ action, submit = "Save", clear, className, children }: {
  action: Action; submit?: string; clear?: boolean; className?: string; children: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state?.ok) return;
    if (clear) form.current?.reset();
    form.current?.querySelectorAll<HTMLInputElement>("input[type=file]").forEach((i) => (i.value = ""));
  }, [state, clear]);
  return (
    <form ref={form} action={run} onSubmit={keep(run)} className={className}>
      {children}
      {state?.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button disabled={pending} className={button}>{pending ? "Saving" : submit}</button>
        {state?.ok && !pending && <span role="status" className="text-sm text-emerald-400">{state.ok}</span>}
      </div>
    </form>
  );
}

export function Confirm({ ask, className, children }: { ask: string; className?: string; children: React.ReactNode }) {
  return (
    <button className={className} onClick={(e) => { if (!confirm(ask)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

const tabs = [["Products", "/admin"], ["Orders", "/admin/orders"], ["Customers", "/admin/customers"], ["Bundles", "/admin/bundles"], ["Categories", "/admin/categories"], ["Pages", "/admin/pages"], ["Settings", "/admin/settings"]];

export function Tabs() {
  const path = usePathname();
  const on = (href: string) => (href === "/admin" ? path === "/admin" || path.startsWith("/admin/products") : path.startsWith(href));
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {tabs.map(([label, href]) => (
        <Link key={href} href={href}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${on(href) ? "border-accent bg-accent text-white" : "border-line bg-card"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
