import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Smart Prospect",
    template: "%s | Smart Prospect",
  },
  description: "KI-gestützte Multichannel-Kampagnen mit Landingpages, PDFs, Videos und mehr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
