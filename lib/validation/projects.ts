import { z } from "zod";
import { uuid } from "./common";

const stage = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(1, "Name this stage").max(80, "Keep stage names under 80 characters"),
  cutoffDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a real date")
    .nullish(),
});

export const MAX_STAGES = 200;

/** One shape for create and update: a project name and its stages in display order. */
export const saveProjectInput = z.object({
  projectId: uuid.optional(),
  name: z.string().trim().min(1, "Give the project a name").max(120, "Keep the name under 120 characters"),
  stages: z
    .array(stage)
    .max(MAX_STAGES, `A project can have up to ${MAX_STAGES} stages`)
    .refine((list) => new Set(list.map((s) => s.name.toLowerCase())).size === list.length, "Two stages have the same name"),
});
export type SaveProjectInput = z.infer<typeof saveProjectInput>;

export const projectIdInput = z.object({ projectId: uuid });
