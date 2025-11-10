import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Badge } from "@/components/ui/badge";

export function SiteHeader({
  email,
  credits,
}: {
  email?: string | null;
  credits?: number;
}) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Smart Prospect
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {typeof credits === "number" && (
            <Badge variant="default" className="bg-slate-900 text-white">
              {credits} Credits
            </Badge>
          )}
          {email && <span className="hidden md:inline">{email}</span>}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
