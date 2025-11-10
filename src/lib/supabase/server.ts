import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function readCookies(): CookieStore {
  const store = cookies();
  return (store as unknown as CookieStore);
}

export function createSupabaseServerClient(): SupabaseClient<Database> {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return readCookies().get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          readCookies().set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          readCookies().delete({ name, ...options });
        },
      },
    },
  );
}
