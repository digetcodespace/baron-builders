import { normalizePhone } from "@/lib/phone";
import { z } from "zod";

export const uuid = z.uuid();

export const pageInput = z.object({
  cursor: z.string().min(1).max(512).nullish(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/** A required phone number, saved as E.164 (`+17325550142`). Any common way of writing it is accepted. */
export const phone = z
  .string()
  .trim()
  .refine((value) => normalizePhone(value) !== null, "Enter the full phone number, like (732) 555-0142")
  .transform((value) => normalizePhone(value) as string);
