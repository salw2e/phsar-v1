"use server";

import { redirect } from "next/navigation";
import { checkPassword, createUser, endSession, hashPassword, requireUser, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { tooMany } from "@/lib/limit";

export type AuthState = { error?: string; ok?: string } | undefined;

const safeNext = (v: FormDataEntryValue | null) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  if (db.prepare("select 1 from users where email = ?").get(email)) return { error: "Email already in use" };
  if (await tooMany("signup", 10, 60)) return { error: "Too many signups, try later" };

  const { id, first } = createUser(email, name, hashPassword(password));
  await startSession(id);
  redirect(first ? "/admin" : safeNext(form.get("next")));
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (await tooMany("login", 10, 15, false)) return { error: "Too many tries, wait 15 minutes" };
  const user = db.prepare("select id, password_hash from users where email = ?").get(email) as { id: number; password_hash: string } | undefined;
  if (!user || !checkPassword(password, user.password_hash)) {
    await tooMany("login", 10, 15);
    return { error: "Wrong email or password" };
  }
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function changePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const user = await requireUser("/account");
  const next = String(form.get("password") ?? "");
  if (next.length < 8) return { error: "Password must be at least 8 characters" };
  const { password_hash } = db.prepare("select password_hash from users where id = ?").get(user.id) as { password_hash: string };
  if (password_hash && !checkPassword(String(form.get("current") ?? ""), password_hash)) return { error: "Current password is wrong" };
  db.prepare("update users set password_hash = ? where id = ?").run(hashPassword(next), user.id);
  db.prepare("delete from sessions where user_id = ?").run(user.id);
  await startSession(user.id);
  return { ok: "Password changed" };
}
