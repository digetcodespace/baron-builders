import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import "./globals.css";

// Self-hosted and preloaded by Next, with fallback metrics matched, so text never jumps when fonts arrive.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Baron Builders", template: "%s | Baron Builders" },
  description: "Baron Builders selections portal",
  icons: { icon: "/brand/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
