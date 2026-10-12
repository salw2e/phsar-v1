import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { origin } from "@/lib/limit";
import { secret } from "@/lib/pay";

export async function GET(req: Request) {
  await connection();
  const id = secret("googleId");
  if (!id) redirect("/login");
  const state = randomBytes(16).toString("hex");
  const next = new URL(req.url).searchParams.get("next") ?? "/";
  (await cookies()).set("g_state", `${state}|${next}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  redirect("https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: id,
    redirect_uri: `${await origin()}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
  }));
}
