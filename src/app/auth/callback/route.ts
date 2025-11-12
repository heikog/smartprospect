import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env.server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/request-client";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const sessionResponse = new NextResponse();
  const { supabase, response } = createSupabaseRouteHandlerClient(request, sessionResponse);

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadataRedirect = typeof user?.user_metadata?.redirect === "string"
    ? user.user_metadata.redirect
    : undefined;
  const redirectPath = metadataRedirect && metadataRedirect.startsWith("/")
    ? metadataRedirect
    : "/dashboard";

  const redirectUrl = new URL(redirectPath, env.APP_BASE_URL);
  const redirectResponse = NextResponse.redirect(redirectUrl);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  console.log("Auth callback redirect", {
    requestUrl: request.url,
    redirectPath,
  });

  return redirectResponse;
}
