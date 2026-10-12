import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Header";
import { io } from "next/cache";
import { secret } from "@/lib/pay";
import { getSettings } from "@/lib/store";

async function Form() {
  await io();
  return <AuthForm mode="login" google={secret("googleId") !== ""} />;
}

export default async function Page() {
  const s = await getSettings();
  return (
    <main className="mx-auto w-full max-w-[400px] px-6 pt-24">
      <Logo s={s} />
      <h1 className="mt-10 font-head text-[26px] font-extrabold tracking-tight">Log in</h1>
      <Suspense>
        <Form />
      </Suspense>
    </main>
  );
}
