import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const zhongsong = localFont({
  src: "./fonts/STZHONGS.ttf",
  variable: "--font-zhongsong",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcanist Dashboard — Reverse: 1999 Tracker",
  description:
    "Track your Reverse: 1999 arcanist collection, portraits, resonance, and pull priority.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${zhongsong.variable} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
