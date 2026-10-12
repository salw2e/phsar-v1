import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { origin } from "@/lib/limit";
import { secret } from "@/lib/pay";

type Claims = { aud: string; email: string; email_verified: boolean; name?: string };

async function claims(code: string): Promise<Claims | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: secret("googleId"),
      client_secret: secret("googleSecret"),
      redirect_uri: `${await origin()}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.id_token) {
    console.error("google:", json.error_description ?? json.error ?? res.status);
    return null;
  }
  // straight from google over tls, so the token is read without checking its signature
  return JSON.parse(Buffer.from(json.id_token.split(".")[1], "base64url").toString());
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const jar = await cookies();
  const [state, next = "/"] = (jar.get("g_state")?.value ?? "").split("|");
  jar.delete("g_state");
  const code = q.get("code");
  if (!state || state !== q.get("state") || !code) redirect("/login?error=google");

  const c = await claims(code);
  if (!c || c.aud !== secret("googleId") || !c.email || !c.email_verified) redirect("/login?error=google");
  const email = c.email.toLowerCase();

  let user = db.prepare("select id, google from users where email = ?").get(email) as { id: number; google: number } | undefined;
  let first = false;
  if (!user) {
    const made = createUser(email, (c.name ?? "").slice(0, 60), "", 1);
    user = { id: made.id, google: 1 };
    first = made.first;
  } else if (!user.google) {
    // nobody proved they own this email when the password account was made, so its password and logins go
    db.prepare("update users set google = 1, password_hash = '' where id = ?").run(user.id);
    db.prepare("delete from sessions where user_id = ?").run(user.id);
  }
  await startSession(user.id);
  redirect(first ? "/admin" : next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
