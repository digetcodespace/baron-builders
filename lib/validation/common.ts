import { z } from "zod";

export const uuid = z.uuid();

export const pageInput = z.object({
  cursor: z.string().min(1).max(512).nullish(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
