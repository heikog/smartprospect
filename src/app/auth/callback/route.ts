import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectParam = url.searchParams.get("redirect") ?? "/dashboard";
  const redirectPath = redirectParam.startsWith("/") ? redirectParam : `/dashboard`;
  const redirectResponse = NextResponse.redirect(new URL(redirectPath, url.origin));
  const { supabase, response } = createSupabaseRouteHandlerClient(request, redirectResponse);

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
