import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (value: number) => void;
}
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  itemsPerPageOptions = PAGE_SIZE_OPTIONS,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalPages <= 1 && !onItemsPerPageChange) return null;
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);
  const pages = compactPages(currentPage, totalPages);
  const goToPage = (value: string) => {
    const page = Number(value);
    if (!Number.isInteger(page)) return;
    onPageChange(Math.min(totalPages, Math.max(1, page)));
  };
  return (
    <div className="app-pagination">
      <div className="app-pagination-summary">
        <div className="app-pagination-count">
          {totalItems
            ? `Mostrando ${startItem}-${endItem} de ${totalItems}`
            : `Página ${currentPage} de ${totalPages}`}
        </div>
        {onItemsPerPageChange && (
          <label className="app-pagination-page-size">
            Ver
            <select
              value={itemsPerPage}
              onChange={(event) => {
                onItemsPerPageChange(Number(event.target.value));
                onPageChange(1);
              }}
              className="app-pagination-select"
            >
              {itemsPerPageOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {totalPages > 1 && (
        <div className="app-pagination-controls">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className="app-pagination-button"
          >
            <ChevronsLeft size={14} /> Primero
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="app-pagination-button"
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="app-pagination-ellipsis"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`app-pagination-button app-pagination-page ${page === currentPage ? "is-active" : ""}`}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="app-pagination-button"
          >
            Siguiente <ChevronRight size={15} />
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="app-pagination-button"
          >
            Final <ChevronsRight size={14} />
          </button>
          <label className="app-pagination-jump">
            Ir a
            <input
              type="number"
              min={1}
              max={totalPages}
              inputMode="numeric"
              className="app-pagination-input"
              defaultValue={currentPage}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToPage(event.currentTarget.value);
              }}
              onBlur={(event) => goToPage(event.currentTarget.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
function compactPages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }
  if (currentPage <= 4) {
    [2, 3, 4, 5].forEach((page) => pages.add(page));
  }
  if (currentPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach(
      (page) => pages.add(page),
    );
  }
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}
