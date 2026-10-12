"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type AuthState = { error?: string } | undefined;

const safeNext = (v: FormDataEntryValue | null) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  if (db.prepare("select 1 from users where email = ?").get(email)) return { error: "Email already in use" };

  const first = (db.prepare("select count(*) n from users").get() as { n: number }).n === 0;
  const id = Number(db.prepare("insert into users (email, name, password_hash, role) values (?, ?, ?, ?)")
    .run(email, name, hashPassword(password), first ? "owner" : "customer").lastInsertRowid);
  await startSession(id);
  redirect(first ? "/admin" : safeNext(form.get("next")));
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = db.prepare("select id, password_hash from users where email = ?").get(email) as { id: number; password_hash: string } | undefined;
  if (!user || !checkPassword(password, user.password_hash)) return { error: "Wrong email or password" };
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}
