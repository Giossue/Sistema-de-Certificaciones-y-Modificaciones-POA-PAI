import type { ReactNode } from "react";
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-header motion-section">
      <div className="page-header-main">
        <h1 className="">{title}</h1>
        {description && <p className="mt-1">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
interface SectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideHeader?: boolean;
}
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  hideHeader,
}: SectionCardProps) {
  return (
    <section className={cx("section-card motion-section", className)}>
      {!hideHeader && (
        <div className="section-card-header">
          <div className="section-card-title">
            <h2 className="">{title}</h2>
            {description && <p className="mt-1">{description}</p>}
          </div>
          {actions && <div className="section-card-actions">{actions}</div>}
        </div>
      )}
      <div className={cx("section-card-body", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
interface InlineMessageProps {
  tone?: "neutral" | "success" | "danger";
  children: ReactNode;
}
export function InlineMessage({
  tone = "neutral",
  children,
}: InlineMessageProps) {
  return (
    <div
      className={cx(
        "app-inline-message motion-message",
        `app-inline-message-${tone}`,
      )}
    >
      {children}
    </div>
  );
}
interface EmptyStateProps {
  title: string;
  description?: string;
}
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="app-empty-state motion-section">
      <p className="">{title}</p>
      {description && <p className="mt-1">{description}</p>}
    </div>
  );
}
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="table-skeleton">
      <div
        className="table-skeleton-head"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton-medium skeleton-line" />
        ))}
      </div>
      <div className="table-skeleton-body">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="table-skeleton-row"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, column) => (
              <div key={column} className="table-skeleton-cell">
                <div className="skeleton-medium skeleton-line" />
                {column < 2 && <div className="skeleton-short skeleton-line" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
