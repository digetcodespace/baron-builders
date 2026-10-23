/** A rule between sections. With a label it reads "── Or ──". */
export function Divider({ label, className = "" }: { label?: string; className?: string }) {
  if (!label) return <hr className={`border-0 border-t border-border ${className}`} />;
  return (
    <div role="separator" className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-border" />
      <span className="t-label text-n-500">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
