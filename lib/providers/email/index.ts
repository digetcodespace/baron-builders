import { Resend } from "resend";
import { serverEnv } from "@/lib/config";

export interface OutboundEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Replies route back to the house through this address. */
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailProvider {
  send(message: OutboundEmail): Promise<{ id: string }>;
}

class ResendProvider implements EmailProvider {
  async send(message: OutboundEmail): Promise<{ id: string }> {
    const env = serverEnv();
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      headers: message.headers,
    });
    if (error || !data) throw new Error(error?.message ?? "Email provider returned no id");
    return { id: data.id };
  }
}

export function getEmailProvider(): EmailProvider {
  return new ResendProvider();
}
