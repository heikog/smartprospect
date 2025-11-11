import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

const COOKIE_MUTATION_ERROR = "Cookies can only be modified in a Server Action or Route Handler";

function swallowCookieMutationError<T extends unknown[]>(
  mutate: ((...args: T) => unknown) | undefined,
) {
  if (!mutate) return undefined;
  return async (...args: T) => {
    try {
      await mutate(...args);
    } catch (error) {
      if (error instanceof Error && error.message.includes(COOKIE_MUTATION_ERROR)) {
        return;
      }
      throw error;
    }
  };
}

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
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
