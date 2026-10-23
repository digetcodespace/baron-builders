import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baron Builders",
  description: "Baron Builders selections portal",
  icons: { icon: "/brand/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
