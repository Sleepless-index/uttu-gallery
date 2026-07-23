import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}