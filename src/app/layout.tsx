import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSettings } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.name, description: s.heroTitle };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--accent": s.accent } as React.CSSProperties}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
