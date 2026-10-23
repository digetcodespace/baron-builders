import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { personaFromParam } from "@/components/auth/personas";
import { SignInForm } from "@/components/auth/SignInForm";
import { isSupabaseConfigured } from "@/lib/config";
import { PORTAL_HOME, createRequestContext } from "@/lib/http";

export const metadata = { title: "Sign in" };

/** Someone already signed in goes straight to their own portal. */
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ email?: string; for?: string }> }) {
  if (isSupabaseConfigured()) {
    const ctx = await createRequestContext().catch(() => null);
    if (ctx) redirect(PORTAL_HOME[ctx.role]);
  }
  const { email, for: who } = await searchParams;
  const persona = personaFromParam(who);
  return (
    <AuthShell persona={persona}>
      <SignInForm persona={persona} initialEmail={typeof email === "string" ? email.slice(0, 254) : ""} />
    </AuthShell>
  );
}
