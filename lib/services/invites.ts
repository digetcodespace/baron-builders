import { addHouseBuyer, addVendorUser, createAuthUser, getHouse, getProfileByEmail, getVendor, type UserRole } from "@/lib/data";
import { getEmailProvider, isEmailAvailable } from "@/lib/providers/email";
import { enforceRateLimit } from "@/lib/rate-limit";
import { inviteInput, parseOrThrow } from "@/lib/validation";
import { getServiceSupabase, type RequestContext } from "./_context";
import { buildInviteEmail } from "./_inviteEmail";
import { ConflictError, NotFoundError } from "./_errors";
import { assertStaff } from "./access";
import { recordAudit } from "./audit";

export interface InviteResult {
  userId: string;
  /** False when the person already had an account and was only linked to the house or vendor. */
  created: boolean;
  /** False when email is not configured yet or the send failed; the office can share the sign-in link instead. */
  emailSent: boolean;
  signInUrl: string;
}

/**
 * Staff add a person. Accounts exist only by invite (public sign-up is off): the
 * account is created confirmed with its role, a buyer is linked to a house, a
 * vendor person to their company, and an email tells them how to sign in. The
 * invitation holds no secret; they ask for a code on the sign-in page.
 */
export async function inviteUser(ctx: RequestContext, raw: unknown): Promise<InviteResult> {
  const input = parseOrThrow(inviteInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("invite", ctx.userId);

  if (input.role === "buyer" && !(await getHouse(ctx.db, input.houseId as string))) throw new NotFoundError("That house was not found");
  if (input.role === "vendor" && !(await getVendor(ctx.db, input.vendorId as string))) throw new NotFoundError("That vendor was not found");

  const existing = await getProfileByEmail(ctx.db, input.email);
  let userId: string;
  let created = false;
  if (existing) {
    if (existing.role !== input.role) {
      throw new ConflictError(`${input.email} already has a ${existing.role} account, so it cannot also be a ${input.role}.`);
    }
    userId = existing.id;
  } else {
    // auth-admin: the only way to create an account with a server-set role.
    ({ userId } = await createAuthUser(getServiceSupabase("auth-admin"), {
      email: input.email,
      fullName: input.fullName,
      role: input.role as UserRole,
    }));
    created = true;
  }

  if (input.role === "buyer") await addHouseBuyer(ctx.db, input.houseId as string, userId);
  if (input.role === "vendor") await addVendorUser(ctx.db, input.vendorId as string, userId);

  await recordAudit(ctx, {
    action: created ? "person.invited" : "person.linked",
    entityType: "profile",
    entityId: userId,
    houseId: input.role === "buyer" ? input.houseId : null,
    details: { role: input.role, email: input.email },
  });

  const signInUrl = `${ctx.siteUrl}/sign-in?email=${encodeURIComponent(input.email)}`;
  let emailSent = false;
  if (isEmailAvailable()) {
    try {
      const message = buildInviteEmail({ fullName: input.fullName, role: input.role as UserRole, signInUrl });
      await getEmailProvider().send({ to: input.email, ...message });
      emailSent = true;
    } catch (error) {
      ctx.logError(error, { step: "send-invite-email", userId });
    }
  }
  return { userId, created, emailSent, signInUrl };
}
