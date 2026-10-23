import { z } from "zod";

export const createProjectInput = z.object({
  name: z.string().trim().min(1, "Give the project a name").max(120, "Keep the name under 120 characters"),
});
export type CreateProjectInput = z.infer<typeof createProjectInput>;
