import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="t-h3">Page not found</h1>
      <p className="mt-2 t-body">That page does not exist, or you do not have access to it.</p>
      <Link href="/" className="mt-4 inline-block t-ui underline">
        Go home
      </Link>
    </div>
  );
}
