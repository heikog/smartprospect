import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createSupabaseServerClient(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies }) as unknown as SupabaseClient<Database>;
}
