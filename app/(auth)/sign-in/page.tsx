import Image from "next/image";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <Image src="/brand/baron-logo.svg" alt="Baron Builders" width={180} height={62} unoptimized priority />
      <h1 className="t-h3">Sign in</h1>
      <p className="t-body">
        Sign-in with an emailed one-time code is not wired up yet. Staff, buyers, and vendors will all sign in on this
        page and land in their own portal.
      </p>
    </div>
  );
}
