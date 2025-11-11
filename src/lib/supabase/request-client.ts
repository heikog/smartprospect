import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env.server";
import type { Database } from "@/types/database";
import { swallowCookieMutationError } from "@/lib/supabase/cookie-helpers";

export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse = NextResponse.next(),
): {
  supabase: SupabaseClient<Database>;
  response: NextResponse;
} {
  const safeSet = swallowCookieMutationError(
    (name: string, value: string, options?: CookieOptions) =>
      response.cookies.set({ name, value, ...options }),
  );
  const safeRemove = swallowCookieMutationError(
    (name: string, options?: CookieOptions) =>
      response.cookies.delete({ name, ...options }),
  );

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          void safeSet?.(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          void safeRemove?.(name, options);
        },
      },
    },
  );

  return { supabase, response };
}
