import type { Metadata } from "next";
import "./globals.css";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { SupabaseListener } from "@/components/providers/SupabaseListener";

export const metadata: Metadata = {
  title: {
    default: "Smart Prospect",
    template: "%s | Smart Prospect",
  },
  description: "KI-gestützte Multichannel-Kampagnen mit Landingpages, PDFs, Videos und mehr.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="de">
      <body className="antialiased font-sans min-h-screen bg-background text-foreground">
        <SupabaseProvider initialSession={session}>
          <SupabaseListener accessToken={session?.access_token ?? undefined} />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
