const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

function readEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing.`);
  }
  return value;
}

export const env = {
  supabaseUrl: readEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
  demoOwnerId: import.meta.env.VITE_DEMO_OWNER_ID ?? null
};
