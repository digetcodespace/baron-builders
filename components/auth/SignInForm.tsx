"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Button, OtpField, TextField } from "@/components/ui";
import { AUTH_OTP_LENGTH } from "@/lib/config";
import { useSignIn } from "@/hooks/useSignIn";
import { PERSONAS, type Persona } from "./personas";

/**
 * One piece of a step. When its step becomes active it eases into place (rising a
 * little and sharpening from a soft blur), one piece after another; when the step
 * leaves, everything fades away together. `order` sets the stagger.
 */
function Reveal({ show, order = 0, children, className = "" }: { show: boolean; order?: number; children: ReactNode; className?: string }) {
  const style: CSSProperties = { transitionDelay: show ? `${140 + order * 70}ms` : "0ms" };
  return (
    <div
      style={style}
      className={`transition-[opacity,translate,filter] duration-[560ms] ease-[var(--ease-out)] ${show ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-[3px]"} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * One form for staff, buyers, and vendors, in two steps that share the same space. Moving
 * forward, the email step slides away to the left while the code step arrives from the right;
 * going back reverses it. The wording after step one is the same whether or not the address has
 * an account.
 */
export function SignInForm({ initialEmail = "", persona = "default" }: { initialEmail?: string; persona?: Persona }) {
  const { step, email, emailError, codeError, busy, cooldown, attempt, requestCode, verify, backToEmail } = useSignIn(initialEmail);
  const [draft, setDraft] = useState(initialEmail);
  const emailPanel = useRef<HTMLDivElement>(null);
  const onCode = step === "code";

  // After the slide settles, put the cursor where the person will type next.
  useEffect(() => {
    if (step !== "email") return;
    const timer = window.setTimeout(() => emailPanel.current?.querySelector("input")?.focus(), 420);
    return () => window.clearTimeout(timer);
  }, [step]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim()) void requestCode(draft.trim());
  };

  const panel = "col-start-1 row-start-1 transition-[opacity,translate,filter] duration-[520ms] ease-[var(--ease-smooth)]";

  return (
    <div className="grid">
      {/* Step one: email */}
      <div
        ref={emailPanel}
        inert={onCode}
        aria-hidden={onCode}
        className={`${panel} ${onCode ? "pointer-events-none -translate-x-10 opacity-0 blur-[4px]" : "translate-x-0 opacity-100 blur-0"}`}
      >
        <form onSubmit={onSubmit} noValidate>
          <Reveal show={!onCode} order={0}>
            <h2 className="t-h1">{PERSONAS[persona].title}</h2>
            <p className="mt-2 t-body">We will email you a code.</p>
          </Reveal>
          <Reveal show={!onCode} order={1} className="mt-8">
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
          </Reveal>
          <Reveal show={!onCode} order={2} className="mt-5">
            <Button type="submit" size="lg" fullWidth loading={busy && !onCode} rightIcon="arrow-right">
              Email me a code
            </Button>
          </Reveal>
        </form>
      </div>

      {/* Step two: code */}
      <div
        inert={!onCode}
        aria-hidden={!onCode}
        className={`${panel} ${onCode ? "translate-x-0 opacity-100 blur-0" : "pointer-events-none translate-x-10 opacity-0 blur-[4px]"}`}
      >
        <Reveal show={onCode} order={0}>
          <h2 className="t-h1">Enter your code</h2>
          <p className="mt-2 t-body">
            Sent to <span className="font-semibold text-text">{email}</span>
          </p>
        </Reveal>
        <Reveal show={onCode} order={1} className="mt-8">
          <OtpField
            key={attempt}
            length={AUTH_OTP_LENGTH}
            label="Code"
            error={codeError}
            disabled={busy}
            autoFocus={onCode}
            onComplete={(code) => void verify(code)}
          />
        </Reveal>
        <Reveal show={onCode} order={2} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button variant="ghost" size="sm" disabled={cooldown > 0 || busy} onClick={() => void requestCode(email)}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={backToEmail}>
            Change email
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
