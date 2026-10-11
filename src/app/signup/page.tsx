import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { getSettings } from "@/lib/store";

export default async function Page() {
  const s = await getSettings();
  return (
    <main className="mx-auto w-full max-w-[400px] px-6 pt-24">
      <span className="grid size-11 place-items-center rounded-xl bg-accent text-xl font-black text-white">{s.name.slice(0, 1).toUpperCase()}</span>
      <h1 className="mt-6 text-[26px] font-extrabold tracking-tight">Join {s.name}</h1>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
