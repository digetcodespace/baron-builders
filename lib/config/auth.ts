/**
 * Sign-in settings shared by the server and the browser.
 * AUTH_OTP_LENGTH must match the one-time-code length set on the Supabase project
 * (Authentication, Email: `otp_length` in supabase/config.toml).
 */
export const AUTH_OTP_LENGTH = 8;

/** How long a person waits before asking for another code, in seconds. */
export const AUTH_RESEND_SECONDS = 45;
