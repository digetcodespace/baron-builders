import type { Db } from "./_supabase";
import { DataError, toAuthDataError } from "./_errors";
import type { UserRole } from "./types";

/** Codes Supabase returns when the email has no account (sign-up is off, so no account is ever created here). */
const NO_ACCOUNT = new Set(["otp_disabled", "signup_disabled", "user_not_found"]);

/**
 * Email a one-time code to an existing account. `shouldCreateUser: false` means a
 * stranger's address never becomes an account. Returns whether a code went out so
 * the service can answer identically either way.
 */
export async function sendSignInCode(db: Db, email: string): Promise<"sent" | "no_account"> {
  const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (!error) return "sent";
  if (error.code && NO_ACCOUNT.has(error.code)) return "no_account";
  throw toAuthDataError(error, "sign-in code");
}

/** Exchange the emailed code for a session. The session cookies are written through the client's cookie adapter. */
export async function verifySignInCode(db: Db, email: string, token: string): Promise<{ userId: string; role: UserRole | null }> {
  const { data, error } = await db.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw toAuthDataError(error, "sign-in code");
  const user = data.user;
  if (!user) throw new DataError("auth_failed", "Sign-in code is not valid or has expired");
  const claimed = user.app_metadata?.role;
  const role = claimed === "staff" || claimed === "buyer" || claimed === "vendor" ? claimed : null;
  return { userId: user.id, role };
}

export async function endSession(db: Db): Promise<void> {
  const { error } = await db.auth.signOut();
  if (error) throw toAuthDataError(error, "sign-out");
}

/**
 * Create a confirmed account with its role. Admin API: pass the service-role client.
 * The `on_auth_user_created` trigger turns `app_metadata.role` into a profile.
 */
export async function createAuthUser(
  admin: Db,
  input: { email: string; fullName: string; role: UserRole },
): Promise<{ userId: string }> {
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: { full_name: input.fullName },
  });
  if (error || !data.user) throw toAuthDataError(error ?? { message: "no user" }, "account");
  return { userId: data.user.id };
}
