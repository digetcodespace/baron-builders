/**
 * Who is signing in, taken from the link (`/sign-in?for=buyer`). The page cannot ask the
 * server who an email belongs to (that would reveal who has an account), so the link carries it:
 * invitation emails and portal redirects add `for=`, and everyone else sees the neutral wording.
 */
export type Persona = "default" | "buyer" | "vendor" | "staff";

export interface PersonaCopy {
  /** Big line on the brand panel. */
  headline: string;
  /** One quiet line under it. */
  line: string;
  /** The form's title. */
  title: string;
}

export const PERSONAS: Record<Persona, PersonaCopy> = {
  default: { headline: "Come on in.", line: "Your selections, from contract to signed.", title: "Sign in" },
  buyer: { headline: "Welcome home.", line: "Choose the finishes for your house, one step at a time.", title: "Sign in" },
  vendor: { headline: "Houses are waiting.", line: "See which ones need your trade, and answer in minutes.", title: "Sign in" },
  staff: { headline: "Back to work.", line: "Every project, house, and selection in one place.", title: "Sign in" },
};

/** Only the three known values are honored; anything else is the neutral page. */
export function personaFromParam(value: unknown): Persona {
  return value === "buyer" || value === "vendor" || value === "staff" ? value : "default";
}
