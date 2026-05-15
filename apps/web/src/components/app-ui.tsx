import {
  Children,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type Key,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, LoaderCircle } from "lucide-react";
import { Pagination } from "@/components/pagination";
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
type AppTone = "neutral" | "info" | "success" | "warning" | "danger";
type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type AppButtonSize = "sm" | "md";
type AppTableDensity = "compact" | "normal";
type DialogTone = "danger" | "warning" | "info";
type ControlSize = "sm" | "md";
export type AppTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  sortable?: boolean;
};
type AppTablePagination = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
};
type AppTableProps<TItem = ReactNode> = {
  columns: AppTableColumn[];
  children: ReactNode;
  data?: TItem[];
  minWidth?: number | string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  pagination?: AppTablePagination;
  clientPagination?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  density?: AppTableDensity;
  stickyHeader?: boolean;
  mobileRender?: (item: TItem, index: number) => ReactNode;
  getRowKey?: (item: TItem, index: number) => Key;
};
export function AppTable<TItem = ReactNode>({
  columns,
  children,
  data,
  minWidth = 1080,
  sortKey,
  sortDirection,
  onSort,
  pagination,
  clientPagination = false,
  title,
  description,
  actions,
  emptyState,
  loading = false,
  error,
  density = "normal",
  stickyHeader = false,
  mobileRender,
  getRowKey,
}: AppTableProps<TItem>) {
  const rows = useMemo(() => Children.toArray(children), [children]);
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);
  const clientTotalPages = Math.max(1, Math.ceil(rows.length / clientPageSize));
  useEffect(() => {
    if (clientPage > clientTotalPages) setClientPage(clientTotalPages);
  }, [clientPage, clientTotalPages]);
  const visibleRows = clientPagination
    ? rows.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize)
    : rows;
  const mobileItems = useMemo(() => {
    if (!data) return visibleRows as TItem[];
    return clientPagination
      ? data.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize)
      : data;
  }, [clientPage, clientPageSize, clientPagination, data, visibleRows]);
  const paginationConfig = clientPagination
    ? {
        currentPage: clientPage,
        totalPages: clientTotalPages,
        totalItems: rows.length,
        itemsPerPage: clientPageSize,
        onPageChange: setClientPage,
        onItemsPerPageChange: setClientPageSize,
      }
    : pagination;
  const hasHeader = Boolean(title || description || actions);
  const hasState = loading || Boolean(error) || (!rows.length && Boolean(emptyState));
  const tableContent = (
    <>
      {hasState ? (
        <div className="app-table-state">
          {renderTableState({ loading, error, emptyState })}
        </div>
      ) : (
        <>
          <div
            className={cx(
              "app-table-frame",
              mobileRender && "app-table-desktop-frame",
            )}
          >
            <table
              className={cx(
                "app-table",
                `app-table-density-${density}`,
                stickyHeader && "app-table-sticky-header",
              )}
              style={{ minWidth }}
            >
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={alignClass(column.align)}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => onSort?.(column.key)}
                          className={cx(
                            "table-sort-button inline-flex w-full items-center gap-1",
                            justifyClass(column.align),
                          )}
                          aria-sort={
                            sortKey === column.key
                              ? sortDirection === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <span>{column.label}</span>
                          {sortKey === column.key ? (
                            sortDirection === "asc" ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-55" />
                          )}
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{visibleRows}</tbody>
            </table>
          </div>
          {mobileRender && (
            <div className="app-table-mobile-list">
              {mobileItems.map((item, index) => (
                <AppCard
                  key={getRowKey?.(item, index) ?? index}
                  className="app-table-mobile-card"
                >
                  {mobileRender(item, index)}
                </AppCard>
              ))}
            </div>
          )}
        </>
      )}
      {paginationConfig && !hasState && (
        <Pagination
          currentPage={paginationConfig.currentPage}
          totalPages={paginationConfig.totalPages}
          totalItems={paginationConfig.totalItems}
          itemsPerPage={paginationConfig.itemsPerPage}
          onPageChange={paginationConfig.onPageChange}
          onItemsPerPageChange={paginationConfig.onItemsPerPageChange}
        />
      )}
    </>
  );
  if (!hasHeader) return tableContent;
  return (
    <AppCard padded={false} className="app-table-card">
      <AppSectionHeader
        title={title}
        description={description}
        actions={actions}
      />
      {tableContent}
    </AppCard>
  );
}
function renderTableState({
  loading,
  error,
  emptyState,
}: {
  loading: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
}) {
  if (loading) return <LoadingState title="Cargando datos..." />;
  if (error) {
    return (
      <ErrorState
        description={
          typeof error === "boolean" ? undefined : renderStateNode(error)
        }
      />
    );
  }
  if (emptyState) {
    const content = renderStateNode(emptyState);
    return typeof emptyState === "string" || typeof emptyState === "number" ? (
      <EmptyState title={content} />
    ) : (
      content
    );
  }
  return null;
}
function renderStateNode(node: ReactNode) {
  if (typeof node === "string" || typeof node === "number") return node;
  return node;
}
export function AppButton({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  className,
  type,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        "app-button",
        `app-button-${size}`,
        variant === "primary" && "app-button-primary",
        variant === "secondary" && "app-button-secondary",
        variant === "ghost" && "app-button-ghost",
        variant === "danger" && "app-button-danger",
        loading && "is-loading",
        className,
      )}
    >
      {loading && (
        <LoaderCircle
          size={14}
          className="app-button-spinner"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
export function AppIconButton({
  label,
  icon,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  className,
  title,
  type = "button",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  label: string;
  icon: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-label={label}
      aria-busy={loading || undefined}
      title={title ?? label}
      className={cx(
        "app-button app-icon-button",
        `app-button-${size}`,
        variant === "primary" && "app-button-primary",
        variant === "secondary" && "app-button-secondary",
        variant === "ghost" && "app-button-ghost",
        variant === "danger" && "app-button-danger",
        loading && "is-loading",
        className,
      )}
    >
      {loading ? (
        <LoaderCircle
          size={14}
          className="app-button-spinner"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
    </button>
  );
}
export function AppBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: AppTone;
  className?: string;
}) {
  return (
    <span className={cx("app-badge", `app-badge-${tone}`, className)}>
      {children}
    </span>
  );
}
export function AppCard({
  children,
  className,
  padded = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
}) {
  return (
    <div
      {...props}
      className={cx("app-card motion-section", padded && "app-card-padded", className)}
    >
      {children}
    </div>
  );
}
export function AppSectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("app-section-header", className)}>
      <div className="app-section-header-main">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="app-section-header-actions">{actions}</div>}
    </div>
  );
}
export function InlineAlert({
  tone = "info",
  title,
  children,
  actions,
  className,
  role,
}: {
  tone?: Exclude<AppTone, "neutral">;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  role?: HTMLAttributes<HTMLDivElement>["role"];
}) {
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={cx(
        "app-inline-message motion-message",
        `app-inline-message-${tone}`,
        className,
      )}
    >
      <div className="app-inline-message-content">
        {title && <p className="app-inline-message-title">{title}</p>}
        <div>{children}</div>
      </div>
      {actions && <div className="app-inline-message-actions">{actions}</div>}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("app-empty-state motion-section", className)}>
      {icon && <div className="app-state-icon">{icon}</div>}
      <p className="app-state-title">{title}</p>
      {description && <p className="app-state-description">{description}</p>}
      {actions && <div className="app-state-actions">{actions}</div>}
    </div>
  );
}
export function LoadingState({
  title = "Cargando...",
  description,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("app-empty-state app-loading-state motion-section", className)}>
      <LoaderCircle size={20} className="app-loading-spinner" aria-hidden="true" />
      <p className="app-state-title">{title}</p>
      {description && <p className="app-state-description">{description}</p>}
    </div>
  );
}
export function ErrorState({
  title = "No se pudo cargar la información",
  description,
  actions,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("app-empty-state app-error-state motion-section", className)}>
      <p className="app-state-title">{title}</p>
      {description && <p className="app-state-description">{description}</p>}
      {actions && <div className="app-state-actions">{actions}</div>}
    </div>
  );
}
export function MetricCard({
  label,
  value,
  description,
  icon,
  tone = "neutral",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: AppTone;
  className?: string;
}) {
  return (
    <div className={cx("app-metric-card", `app-metric-card-${tone}`, className)}>
      <div className="app-metric-card-header">
        <p className="app-metric-card-label">{label}</p>
        {icon && <div className="app-metric-card-icon">{icon}</div>}
      </div>
      <p className="app-metric-card-value">{value}</p>
      {description && <p className="app-metric-card-description">{description}</p>}
    </div>
  );
}
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tone = "info",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: DialogTone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const busy = loading || pending;

  useEffect(() => {
    if (!open) setPending(false);
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (busy) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className={cx("app-dialog", `app-dialog-${tone}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="app-dialog-header">
          <h2 id="confirm-dialog-title">{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="app-dialog-actions">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            {cancelText}
          </AppButton>
          <AppButton
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            loading={busy}
            disabled={busy}
            onClick={handleConfirm}
          >
            {confirmText}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
export function ObservationDialog({
  open,
  title,
  description,
  label = "Observación",
  placeholder,
  value,
  onChange,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  required = false,
  loading = false,
  tone = "info",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  loading?: boolean;
  tone?: DialogTone;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const busy = loading || pending;
  const isInvalid = required && value.trim().length === 0;

  useEffect(() => {
    if (!open) setPending(false);
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (busy || isInvalid) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="app-dialog-backdrop" role="presentation">
      <form
        className={cx("app-dialog", `app-dialog-${tone}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="observation-dialog-title"
        onSubmit={(event) => {
          event.preventDefault();
          void handleConfirm();
        }}
      >
        <div className="app-dialog-header">
          <h2 id="observation-dialog-title">{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <FormField label={label} required={required}>
          <AppTextarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={4}
            disabled={busy}
            autoFocus
          />
        </FormField>
        <div className="app-dialog-actions">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            {cancelText}
          </AppButton>
          <AppButton
            type="submit"
            variant={tone === "danger" ? "danger" : "primary"}
            loading={busy}
            disabled={busy || isInvalid}
          >
            {confirmText}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
export const TextPromptDialog = ObservationDialog;
export function FormField({
  label,
  description,
  error,
  required = false,
  children,
  className,
}: {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("app-form-field", className)}>
      {label && (
        <span className="app-form-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}
      {description && <span className="app-form-description">{description}</span>}
      {children}
      {error && <span className="app-form-error">{error}</span>}
    </label>
  );
}
export function AppInput({
  error,
  fullWidth = true,
  size = "md",
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  fullWidth?: boolean;
  size?: ControlSize;
}) {
  return (
    <input
      {...props}
      aria-invalid={Boolean(error) || undefined}
      className={cx(
        "app-field-input",
        fullWidth && "app-control-full",
        `app-control-${size}`,
        error && "app-control-invalid",
        className,
      )}
    />
  );
}
export function AppTextarea({
  error,
  fullWidth = true,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  fullWidth?: boolean;
}) {
  return (
    <textarea
      {...props}
      aria-invalid={Boolean(error) || undefined}
      className={cx(
        "app-field-input",
        fullWidth && "app-control-full",
        error && "app-control-invalid",
        className,
      )}
    />
  );
}
export function AppSelect({
  error,
  placeholder,
  fullWidth = true,
  size = "md",
  className,
  children,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  error?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: ControlSize;
}) {
  return (
    <select
      {...props}
      aria-invalid={Boolean(error) || undefined}
      className={cx(
        "app-field-input",
        fullWidth && "app-control-full",
        `app-control-${size}`,
        error && "app-control-invalid",
        className,
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}
function alignClass(align: AppTableColumn["align"] = "left") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
function justifyClass(align: AppTableColumn["align"] = "left") {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}
