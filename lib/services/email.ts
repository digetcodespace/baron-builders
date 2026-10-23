import { z } from "zod";
import { getEmailProvider } from "@/lib/providers/email";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parseOrThrow } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { InternalError } from "./_errors";
import { assertStaff } from "./access";
import { recordAudit } from "./audit";

const sendEmailInput = z.object({
  houseId: z.uuid(),
  to: z.array(z.email()).min(1).max(10),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(100_000),
});

/** Staff email a house's buyers from the system. Every send is audited. */
export async function sendHouseEmail(ctx: RequestContext, raw: unknown): Promise<{ id: string }> {
  const input = parseOrThrow(sendEmailInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("email-send", ctx.userId);

  let id: string;
  try {
    ({ id } = await getEmailProvider().send({ to: input.to, subject: input.subject, html: input.html }));
  } catch (error) {
    ctx.logError(error, { houseId: input.houseId });
    throw new InternalError("The email could not be sent");
  }

  await recordAudit(ctx, {
    action: "email.sent",
    entityType: "email",
    entityId: input.houseId,
    houseId: input.houseId,
    details: { providerId: id, recipients: input.to.length, subject: input.subject },
  });
  return { id };
}
