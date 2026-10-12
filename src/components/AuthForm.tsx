"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { keep } from "./keep";

const field = "h-12 w-full rounded-xl border border-line bg-card px-4 text-[15px] outline-none placeholder:text-muted focus:border-accent";

export function AuthForm({ mode, google }: { mode: "login" | "signup"; google: boolean }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const error = state?.error ?? (params.get("error") === "google" ? "Google sign in failed" : undefined);
  return (
    <form action={action} onSubmit={keep(action)} className="mt-6 space-y-2.5">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && <input name="name" placeholder="Name" autoComplete="name" className={field} />}
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={field} />
      <input name="password" type="password" placeholder="Password" required minLength={mode === "signup" ? 8 : undefined}
        autoComplete={mode === "login" ? "current-password" : "new-password"} className={field} />
      {error && <p role="alert" className="pt-1 text-sm text-red-400">{error}</p>}
      <button disabled={pending} className="btn glow !mt-4 h-12 w-full rounded-full text-[15px] font-bold text-white disabled:opacity-60">
        {mode === "login" ? "Log in" : "Sign up"}
      </button>
      {google && (
        <a href={`/auth/google?next=${encodeURIComponent(next)}`} className="flex h-12 w-full items-center justify-center rounded-full border border-line bg-card text-[15px] font-semibold">
          Continue with Google
        </a>
      )}
      <p className="pt-3 text-sm text-muted">
        {mode === "login" ? "No account? " : "Have an account? "}
        <Link href={mode === "login" ? `/signup?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`} className="font-semibold text-text">
          {mode === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
