import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Nothing here yet. Says why, and offers the next step. */
export function EmptyState({ icon = "layers", title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border border-dashed border-n-300 bg-surface px-6 py-12 text-center ${className}`}
    >
      <div className="relative mb-5">
        <span aria-hidden="true" className="absolute -inset-3 rounded-full bg-primary-soft" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary shadow-low">
          <Icon name={icon} size={26} />
        </span>
        <span aria-hidden="true" className="absolute -right-3 -top-3 h-2 w-2 animate-twinkle rounded-full bg-primary" />
      </div>
      <h3 className="t-h4">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm t-small">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
