"use client";

import { useState, type FormEvent } from "react";
import { Button, OtpField, TextField } from "@/components/ui";
import { AUTH_OTP_LENGTH } from "@/lib/config";
import { useSignIn } from "@/hooks/useSignIn";

/**
 * One form for staff, buyers, and vendors. Step one asks for the email; step
 * two takes the emailed code and signs in as soon as the last digit lands. The
 * wording after step one is the same whether or not the address has an account.
 */
export function SignInForm({ initialEmail = "" }: { initialEmail?: string }) {
  const { step, email, emailError, codeError, busy, cooldown, attempt, requestCode, verify, backToEmail } = useSignIn(initialEmail);
  const [draft, setDraft] = useState(initialEmail);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim()) void requestCode(draft.trim());
  };

  if (step === "code") {
    return (
      <div key="code" className="animate-rise-in">
        <h2 className="t-h2">Check your email</h2>
        <p className="mt-2 t-body">
          If <span className="font-semibold text-text">{email}</span> has an account, we just sent it a {AUTH_OTP_LENGTH}-digit code.
        </p>
        <OtpField
          key={attempt}
          className="mt-8"
          length={AUTH_OTP_LENGTH}
          label="One-time code"
          error={codeError}
          disabled={busy}
          autoFocus
          onComplete={(code) => void verify(code)}
        />
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={cooldown > 0 || busy}
            onClick={() => void requestCode(email)}
          >
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={backToEmail}>
            Use a different email
          </Button>
        </div>
        <p className="mt-8 t-small">Codes expire after an hour. The newest code is the only one that works.</p>
      </div>
    );
  }

  return (
    <form key="email" onSubmit={onSubmit} noValidate className="animate-rise-in">
      <h2 className="t-h2">Sign in</h2>
      <p className="mt-2 t-body">Enter your email and we will send you a code. No password to remember.</p>
      <div className="mt-8 space-y-5">
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          leadingIcon="mail"
          value={draft}
          error={emailError}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="lg" fullWidth loading={busy} rightIcon="arrow-right">
          Email me a code
        </Button>
      </div>
      <p className="mt-8 t-small">
        Accounts are created by the Baron Builders office. If you were expecting an invitation and cannot sign in, contact them.
      </p>
    </form>
  );
}
