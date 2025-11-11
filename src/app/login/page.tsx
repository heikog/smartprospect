import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env.server";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

export const metadata: Metadata = {
  title: "Smart Prospect – Login",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const requestedRedirect = searchParams?.redirect ?? "/dashboard";
  const redirectPath = requestedRedirect.startsWith("/") ? requestedRedirect : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-slate-100 px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Willkommen zurück</h1>
          <p className="text-sm text-slate-500">Login via Magic Link – keine Passwörter nötig.</p>
        </div>
        <MagicLinkForm
          redirectTo={`${env.APP_BASE_URL}/auth/callback`}
          redirectPath={redirectPath}
        />
        <p className="text-center text-xs text-slate-400">
          Mit dem Login akzeptierst du den Zugriff auf Supabase & Stripe in der Smart Prospect Instanz.
        </p>
        <Link href="/" className="block text-center text-sm text-indigo-600 hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
