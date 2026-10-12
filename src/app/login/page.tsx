import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Header";
import { getSettings } from "@/lib/store";

export default async function Page() {
  const s = await getSettings();
  return (
    <main className="mx-auto w-full max-w-[400px] px-6 pt-24">
      <Logo s={s} />
      <h1 className="mt-10 text-2xl font-extrabold tracking-tight">Log in</h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
