import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { Shell } from "@/components/Shell";
import { currentUser } from "@/lib/auth";

async function Me() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  return (
    <div className="mt-6 rounded-2xl border border-line bg-card p-5">
      <div className="text-lg font-bold">{user.name || user.email}</div>
      <div className="text-sm text-muted">{user.email}</div>
      <form action={logout} className="mt-5">
        <button className="h-11 rounded-full border border-line px-5 text-sm font-semibold">Log out</button>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<div className="mt-6 h-32 animate-pulse rounded-2xl bg-card" />}>
        <Me />
      </Suspense>
    </Shell>
  );
}
