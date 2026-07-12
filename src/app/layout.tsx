import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "Reality Check — srovnávač nemovitostí s AI",
    template: "%s | Reality Check",
  },
  description:
    "Porovnávejte realitní nabídky z různých portálů na jednom místě a získejte AI hodnocení ceny, lokality a rizik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="flex min-h-screen flex-col bg-zinc-50 antialiased dark:bg-zinc-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
