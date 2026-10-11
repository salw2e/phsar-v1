import Link from "next/link";
import { Suspense } from "react";
import { Tabs } from "@/components/admin/Form";

export default function Layout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-20">
      <header className="flex items-center justify-between py-4">
        <Link href="/admin" className="text-[17px] font-extrabold uppercase tracking-wide">Admin</Link>
        <Link href="/" className="text-sm font-semibold text-muted">View store ›</Link>
      </header>
      <Suspense><Tabs /></Suspense>
      {children}
    </div>
  );
}
