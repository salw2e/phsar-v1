import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export type User = { id: number; email: string; name: string; role: "owner" | "customer" };

const COOKIE = "session";
const DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const want = Buffer.from(hash, "hex");
  const got = scryptSync(password, Buffer.from(salt, "hex"), 64);
  return want.length === got.length && timingSafeEqual(want, got);
}

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + DAYS * 86400;
  db.prepare("insert into sessions (token_hash, user_id, expires_at) values (?, ?, ?)").run(digest(token), userId, expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400,
  });
}

export function createUser(email: string, name: string, passwordHash: string, google = 0) {
  return db.transaction(() => {
    const first = (db.prepare("select count(*) n from users").get() as { n: number }).n === 0;
    const id = Number(db.prepare("insert into users (email, name, password_hash, role, google) values (?, ?, ?, ?, ?)")
      .run(email, name, passwordHash, first ? "owner" : "customer", google).lastInsertRowid);
    return { id, first };
  })();
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db.prepare("delete from sessions where token_hash = ?").run(digest(token));
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db.prepare(`
    select u.id, u.email, u.name, u.role from sessions s join users u on u.id = s.user_id
    where s.token_hash = ? and s.expires_at > unixepoch()
  `).get(digest(token)) as User | undefined;
  return row ?? null;
}

// io() keeps what the page reads after this out of the prefetched shell, sqlite is sync so next cant tell
export async function requireUser(next: string): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  await io();
  return user;
}

export async function requireOwner(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "owner") redirect("/");
  await io();
  return user;
}
