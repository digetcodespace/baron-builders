import { z } from "zod";
import { AUTH_OTP_LENGTH } from "@/lib/config";
import { pageInput, uuid } from "./common";

/** Emails are compared case-insensitively everywhere, so store and look up one canonical form. */
export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email is too long")
  .pipe(z.email("Enter a valid email address"));

export const requestCodeInput = z.object({ email });

export const verifyCodeInput = z.object({
  email,
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${AUTH_OTP_LENGTH}}$`), `Enter the ${AUTH_OTP_LENGTH}-digit code from your email`),
});

export const inviteInput = z
  .object({
    email,
    fullName: z.string().trim().min(1, "Enter a name").max(120),
    role: z.enum(["staff", "buyer", "vendor"]),
    houseId: uuid.optional(),
    vendorId: uuid.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === "buyer" && !value.houseId) {
      ctx.addIssue({ code: "custom", path: ["houseId"], message: "Choose the house this buyer belongs to" });
    }
    if (value.role === "vendor" && !value.vendorId) {
      ctx.addIssue({ code: "custom", path: ["vendorId"], message: "Choose the vendor company" });
    }
  });
export type InviteInput = z.infer<typeof inviteInput>;

export const listPageInput = pageInput;
