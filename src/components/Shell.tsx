import { getSettings } from "@/lib/store";
import { Footer } from "./Footer";
import { Header } from "./Header";

export async function Shell({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <Header s={s} />
      <main className="px-4">{children}</main>
      <Footer s={s} />
    </div>
  );
}
