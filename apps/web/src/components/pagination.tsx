import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (itemsPerPage || 10) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 10), totalItems || 0);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
      <div className="text-xs text-slate-500">
        {totalItems ? `Mostrando ${startItem}-${endItem} de ${totalItems}` : `Página ${currentPage} de ${totalPages}`}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          isDisabled={currentPage === 1}
          onPress={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Anterior
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "solid" : "outline"}
              className={page === currentPage ? "bg-primary text-white" : ""}
              onPress={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          isDisabled={currentPage === totalPages}
          onPress={() => onPageChange(currentPage + 1)}
        >
          Siguiente <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
