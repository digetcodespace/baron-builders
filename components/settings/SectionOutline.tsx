import { EmptyState, PageHeader, StatusPill, type IconName } from "@/components/ui";

/**
 * A settings section that is designed but not built yet. It says what will live here, so the
 * structure can be reviewed in the real app before the controls exist.
 */
export function SectionOutline({
  title,
  description,
  icon,
  will,
}: {
  title: string;
  description: string;
  icon: IconName;
  /** What staff will be able to do here, one short line each. */
  will: string[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} actions={<StatusPill tone="warn">Coming next</StatusPill>} />
      <EmptyState
        icon={icon}
        title={`${title} is next`}
        description="Here is what you will be able to do on this page."
        action={
          <ul className="mx-auto max-w-md space-y-2 text-left t-body">
            {will.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-n-400" />
                {line}
              </li>
            ))}
          </ul>
        }
      />
    </>
  );
}
