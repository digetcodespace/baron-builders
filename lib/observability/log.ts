/**
 * The one door for reporting errors. Today it writes to stderr; when an error
 * tracker (Sentry) is added, wire it here and nowhere else.
 */
export function logError(error: unknown, context: Record<string, unknown> = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(
    JSON.stringify({
      level: "error",
      message: err.message,
      name: err.name,
      stack: err.stack,
      ...context,
    }),
  );
}

export function logWarn(message: string, context: Record<string, unknown> = {}): void {
  console.error(JSON.stringify({ level: "warn", message, ...context }));
}
