import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/request-client";

async function signOut(request: NextRequest) {
  const { supabase, response } = createSupabaseRouteHandlerClient(request);
  const { error } = await supabase.auth.signOut();

  const status = error ? 500 : 200;
  const payload = error
    ? { success: false, message: error.message }
    : { success: true };

  const result = NextResponse.json(payload, { status });
  response.cookies.getAll().forEach((cookie) => {
    result.cookies.set(cookie);
  });

  return result;
}

export async function POST(request: NextRequest) {
  return signOut(request);
}

export async function GET(request: NextRequest) {
  return signOut(request);
}
