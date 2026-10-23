import { z } from "zod";

/**
 * The only place environment variables are read. Services never touch
 * `process.env`; the HTTP layer and providers read config from here.
 */

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// Each secret group is validated on its own, so a feature only needs the keys it uses:
// sign-in needs none of these, invites need the service key, invite emails need Resend.
const serviceSchema = z.object({ SUPABASE_SERVICE_ROLE_KEY: z.string().min(1) });
const emailSchema = z.object({ RESEND_API_KEY: z.string().min(1), EMAIL_FROM: z.string().min(1) });
const cronSchema = z.object({ CRON_SECRET: z.string().min(16) });

export type PublicEnv = z.infer<typeof publicSchema>;
export type EmailEnv = z.infer<typeof emailSchema>;

function parseOrConfigError<T>(schema: z.ZodType<T>, raw: unknown, label: string): T {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const names = result.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new ConfigError(`Invalid ${label} environment: ${names}`);
}

let cachedPublic: PublicEnv | undefined;

/** Public values. Referenced by name so Next can inline them into the browser bundle. */
export function publicEnv(): PublicEnv {
  cachedPublic ??= parseOrConfigError(
    publicSchema,
    {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
    "public",
  );
  return cachedPublic;
}

/** The RLS-bypassing key. Server only; reachable only through `getServiceSupabase()`. */
export function supabaseServiceKey(): string {
  return parseOrConfigError(serviceSchema, process.env, "Supabase service").SUPABASE_SERVICE_ROLE_KEY;
}

/** Resend credentials for outbound email. */
export function emailEnv(): EmailEnv {
  return parseOrConfigError(emailSchema, process.env, "email");
}

/** Shared secret that gates cron endpoints. */
export function cronSecret(): string {
  return parseOrConfigError(cronSchema, process.env, "cron").CRON_SECRET;
}

/** True when Supabase is configured, so the app can degrade instead of crashing at boot. */
export function isSupabaseConfigured(): boolean {
  return publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }).success;
}

/** True when invite emails can actually be sent. */
export function isEmailConfigured(): boolean {
  return emailSchema.safeParse(process.env).success;
}
