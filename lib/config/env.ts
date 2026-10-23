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

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  CRON_SECRET: z.string().min(16),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

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

let cachedServer: ServerEnv | undefined;

/** Server-only secrets. Never import this from a client component. */
export function serverEnv(): ServerEnv {
  cachedServer ??= parseOrConfigError(serverSchema, process.env, "server");
  return cachedServer;
}

/** True when Supabase is configured, so the app can degrade instead of crashing at boot. */
export function isSupabaseConfigured(): boolean {
  return publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }).success;
}
