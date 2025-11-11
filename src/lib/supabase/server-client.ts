import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env.server";
import type { Database } from "@/types/database";
import { swallowCookieMutationError } from "@/lib/supabase/cookie-helpers";

export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const mutableStore = cookieStore as unknown as {
    set?: (name: string, value: string, options?: CookieOptions) => void;
    delete?: (name: string, options?: CookieOptions) => void;
  };

  const safeSet = swallowCookieMutationError(mutableStore.set);
  const safeDelete = swallowCookieMutationError(mutableStore.delete);

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          void safeSet?.(name, value, options);
        },
        remove(name: string, options?: CookieOptions) {
          void safeDelete?.(name, options);
        },
      },
    },
  );
}
