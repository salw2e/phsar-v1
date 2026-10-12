import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Header";
import { io } from "next/cache";
import { secret } from "@/lib/pay";
import { getSettings } from "@/lib/store";

async function Form() {
  await io();
  return <AuthForm mode="signup" google={secret("googleId") !== ""} />;
}

export default async function Page() {
  const s = await getSettings();
  return (
    <main className="mx-auto w-full max-w-[400px] px-6 pt-24">
      <Logo s={s} />
      <h1 className="mt-10 text-2xl font-extrabold tracking-tight">Sign up</h1>
      <Suspense>
        <Form />
      </Suspense>
    </main>
  );
}
