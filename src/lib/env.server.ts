import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("env.ts must not be imported on the client. Use env.client.ts instead.");
}

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET_UPLOADS: z.string().default("uploads"),
  SUPABASE_STORAGE_BUCKET_STATIC: z.string().default("static"),
  STARTER_CREDIT_AMOUNT: z.coerce.number().int().positive().default(5),
  STRIPE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_CREDITS_5: z.string().min(1),
  STRIPE_PRICE_CREDITS_50: z.string().min(1),
  STRIPE_PRICE_CREDITS_500: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  EXCEL_TEMPLATE_URL: z.string().url(),
  N8N_GENERATION_WEBHOOK_URL: z.string().url(),
  N8N_SEND_WEBHOOK_URL: z.string().url(),
  N8N_GENERATION_CALLBACK_URL: z.string().url(),
  N8N_SEND_CALLBACK_URL: z.string().url(),
  STRIPE_WEBHOOK_HANDLER_URL: z.string().url(),
  N8N_SHARED_SECRET: z.string().optional(),
  N8N_AUTH_HEADER: z.string().default("x-smartprospect-signature"),
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET_UPLOADS: process.env.SUPABASE_STORAGE_BUCKET_UPLOADS,
  SUPABASE_STORAGE_BUCKET_STATIC: process.env.SUPABASE_STORAGE_BUCKET_STATIC,
  STARTER_CREDIT_AMOUNT: process.env.STARTER_CREDIT_AMOUNT,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_CREDITS_5: process.env.STRIPE_PRICE_CREDITS_5,
  STRIPE_PRICE_CREDITS_50: process.env.STRIPE_PRICE_CREDITS_50,
  STRIPE_PRICE_CREDITS_500: process.env.STRIPE_PRICE_CREDITS_500,
  APP_BASE_URL: process.env.APP_BASE_URL,
  EXCEL_TEMPLATE_URL: process.env.EXCEL_TEMPLATE_URL,
  N8N_GENERATION_WEBHOOK_URL: process.env.N8N_GENERATION_WEBHOOK_URL,
  N8N_SEND_WEBHOOK_URL: process.env.N8N_SEND_WEBHOOK_URL,
  N8N_GENERATION_CALLBACK_URL: process.env.N8N_GENERATION_CALLBACK_URL,
  N8N_SEND_CALLBACK_URL: process.env.N8N_SEND_CALLBACK_URL,
  STRIPE_WEBHOOK_HANDLER_URL: process.env.STRIPE_WEBHOOK_HANDLER_URL,
  N8N_SHARED_SECRET: process.env.N8N_SHARED_SECRET,
  N8N_AUTH_HEADER: process.env.N8N_AUTH_HEADER,
});

export const requiredProspectColumns = [
  "company_url",
  "anrede",
  "vorname",
  "nachname",
  "strasse",
  "hausnummer",
  "plz",
  "ort",
] as const;

export const creditPriceMap = new Map<string, number>([
  [env.STRIPE_PRICE_CREDITS_5, 5],
  [env.STRIPE_PRICE_CREDITS_50, 50],
  [env.STRIPE_PRICE_CREDITS_500, 500],
]);
