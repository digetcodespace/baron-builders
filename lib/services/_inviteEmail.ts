import type { UserRole } from "@/lib/data";
import { emailTheme } from "@/lib/design/tokens";

const ROLE_COPY: Record<UserRole, { subject: string; lead: string }> = {
  staff: { subject: "You have been added to the Baron Builders team", lead: "You now have a staff account on the Baron Builders selections portal." },
  buyer: { subject: "Your Baron Builders selections portal is ready", lead: "Your home's selections will open here, one stage at a time, as your house is built." },
  vendor: { subject: "You have been added to the Baron Builders vendor portal", lead: "You will be emailed when a house is waiting on a choice from your trade." },
};

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Plain, table-free HTML that renders in every mail client. There is no password and no secret in it: the person asks for a code on the sign-in page. */
export function buildInviteEmail(input: { fullName: string; role: UserRole; signInUrl: string }) {
  const copy = ROLE_COPY[input.role];
  const name = escapeHtml(input.fullName.split(/\s+/)[0] || "there");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:${emailTheme.ink}">
<h1 style="font-size:24px;margin:0 0 16px">Come on in, ${name}.</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px">${escapeHtml(copy.lead)}</p>
<p style="margin:0 0 24px"><a href="${escapeHtml(input.signInUrl)}" style="display:inline-block;background:${emailTheme.primary};color:${emailTheme.onPrimary};text-decoration:none;font-weight:700;padding:12px 24px;border-radius:12px">Sign in</a></p>
<p style="font-size:14px;line-height:1.6;color:${emailTheme.muted};margin:0">There is no password. Enter this email address on the sign-in page and we will email you a one-time code each time.</p>
</div>`;
  const text = `Come on in, ${input.fullName.split(/\s+/)[0] || "there"}.\n\n${copy.lead}\n\nSign in: ${input.signInUrl}\n\nThere is no password. Enter this email address on the sign-in page and we will email you a one-time code each time.`;
  return { subject: copy.subject, html, text };
}
