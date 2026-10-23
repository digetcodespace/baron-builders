/** Re-mounts on every navigation, so each page eases in instead of cutting. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 animate-page-in flex-col">{children}</div>;
}
