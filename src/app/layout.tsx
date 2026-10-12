import type { Metadata } from "next";
import { Archivo, Inter, Poppins } from "next/font/google";
import { getSettings } from "@/lib/store";
import "./globals.css";

const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const head = Poppins({ variable: "--font-head", subsets: ["latin"], weight: ["600", "700", "800"] });
const hero = Archivo({ variable: "--font-hero", subsets: ["latin"], axes: ["wdth"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.name, description: s.heroTitle };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  return (
    <html lang="en" className={`${body.variable} ${head.variable} ${hero.variable} h-full antialiased`}
      style={{ "--accent": s.accent } as React.CSSProperties}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
