"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { keep } from "./keep";

const field = "h-12 w-full rounded-xl border border-line bg-card px-4 text-[15px] outline-none placeholder:text-muted focus:border-accent";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const next = useSearchParams().get("next") ?? "/";
  return (
    <form action={action} onSubmit={keep(action)} className="mt-6 space-y-2.5">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && <input name="name" placeholder="Name" autoComplete="name" className={field} />}
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={field} />
      <input name="password" type="password" placeholder="Password" required minLength={mode === "signup" ? 8 : undefined}
        autoComplete={mode === "login" ? "current-password" : "new-password"} className={field} />
      {state?.error && <p role="alert" className="pt-1 text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="!mt-4 h-12 w-full rounded-full bg-accent text-[15px] font-bold text-white disabled:opacity-60">
        {mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="pt-3 text-sm text-muted">
        {mode === "login" ? "New here? " : "Have an account? "}
        <Link href={mode === "login" ? `/signup?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`} className="font-semibold text-text">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
