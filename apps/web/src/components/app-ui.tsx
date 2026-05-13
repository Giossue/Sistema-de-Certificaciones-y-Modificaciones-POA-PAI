import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Pagination } from "@/components/pagination";
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
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
export function AppTable({
  columns,
  children,
  minWidth = 1080,
  sortKey,
  sortDirection,
  onSort,
  pagination,
  clientPagination = false,
}: {
  columns: AppTableColumn[];
  children: ReactNode;
  minWidth?: number | string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  pagination?: AppTablePagination;
  clientPagination?: boolean;
}) {
  const rows = useMemo(() => Children.toArray(children), [children]);
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);
  const clientTotalPages = Math.max(1, Math.ceil(rows.length / clientPageSize));
  useEffect(() => {
    if (clientPage > clientTotalPages) setClientPage(clientTotalPages);
  }, [clientPage, clientTotalPages]);
  const visibleChildren = clientPagination
    ? rows.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize)
    : children;
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
  return (
    <>
      <div className="app-table-frame">
        <table className="app-table" style={{ minWidth }}>
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
          <tbody>{visibleChildren}</tbody>
        </table>
      </div>
      {paginationConfig && (
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
}
export function AppButton({
  children,
  variant = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cx(
        "app-button",
        variant === "primary" && "app-button-primary",
        variant === "secondary" && "app-button-secondary",
        variant === "ghost" && "app-button-ghost",
        className,
      )}
    >
      {children}
    </button>
  );
}
export function AppBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <span className={cx("app-badge", `app-badge-${tone}`)}>{children}</span>
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
