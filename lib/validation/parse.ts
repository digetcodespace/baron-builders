import type { z } from "zod";
import { BadRequestError } from "@/lib/services/_errors";

/**
 * First line of every service function that accepts user input.
 * A failing schema path becomes `BadRequestError.field`.
 */
export function parseOrThrow<S extends z.ZodType>(schema: S, raw: unknown): z.infer<S> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue.path.length > 0 ? issue.path.join(".") : undefined;
  throw new BadRequestError(issue.message, field);
}
