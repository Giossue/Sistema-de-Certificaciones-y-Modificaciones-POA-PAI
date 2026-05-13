import { Button } from "@heroui/react";
import { Search, X } from "lucide-react";
import {
  EmptyState,
  SectionCard,
  TableSkeleton,
} from "@/components/saas-layout";
import {
  ActionBarPorRol,
  BandejaTable,
  EstadoBadge,
} from "@/components/tramites";
import { Pagination } from "@/components/pagination";
import type { SortDirection, SortKey, Tramite } from "../types";
import {
  bandejaColumns,
  formatDate,
  formatTime,
  kindLabel,
  money,
  quickActions,
} from "../utils/tramites-helpers";

export function TramitesWorkPanel({
  query,
  setQuery,
  estado,
  setEstado,
  estadoOptions,
  totalItems,
  loading,
  pageSize,
  sortKey,
  sortDirection,
  handleSort,
  paginados,
  userRole,
  setSelected,
  postAction,
  page,
  totalPages,
  setPageSize,
  setPage,
}: {
  query: string;
  setQuery: (value: string) => void;
  estado: string;
  setEstado: (value: string) => void;
  estadoOptions: Array<{ value: string; label: string }>;
  totalItems: number;
  loading: boolean;
  pageSize: number;
  sortKey: SortKey;
  sortDirection: SortDirection;
  handleSort: (key: string) => void;
  paginados: Tramite[];
  userRole: string;
  setSelected: (item: Tramite | null) => void;
  postAction: (item: Tramite, action: string) => void;
  page: number;
  totalPages: number;
  setPageSize: (pageSize: number) => void;
  setPage: (page: number) => void;
}) {
  return (
    <SectionCard
      title="Trabajo diario"
      description="Filtros rápidos para revisión, aprobación, devolución y seguimiento"
      contentClassName="p-0"
      hideHeader
    >
      <div className="app-toolbar lg:flex-row lg:items-center lg:justify-between">
        <label className="app-search-box app-search-box-lg">
          <Search size={16} className="shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="tramite-search-input min-w-0 flex-1 bg-transparent outline-none "
            placeholder="Buscar trámite"
          />
          {query && (
            <button
              type="button"
              className="shrink-0 "
              aria-label="Limpiar búsqueda"
              onClick={() => setQuery("")}
            >
              <X size={15} />
            </button>
          )}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1">{totalItems} resultados</span>
          <label className="flex items-center gap-2">
            Estado
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="app-compact-select min-w-44"
            >
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {loading ? (
        <TableSkeleton rows={pageSize} columns={6} />
      ) : totalItems === 0 ? (
        <EmptyState title="Sin trámites para este filtro" />
      ) : (
        <>
          <BandejaTable
            columns={bandejaColumns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          >
            {paginados.map((item) => (
              <tr
                key={`${item.kind}-${item.id}`}
                className="app-table-row-clickable"
                onClick={() => setSelected(item)}
              >
                <td className="w-56 px-4 py-3 align-top">
                  <p className="">{item.numero}</p>
                  <p className="">{kindLabel[item.kind]}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="">{item.titulo}</p>
                  <p className="mt-0.5 max-w-xl">{item.detalle}</p>
                </td>
                <td className="w-64 px-4 py-3 align-top">
                  {item.unidad || "-"}
                </td>
                <td className="w-32 px-4 py-3 align-top">
                  <p className="">{formatDate(item.createdAt)}</p>
                  <p className="">{formatTime(item.createdAt)}</p>
                </td>
                <td className="w-32 px-4 py-3 text-center align-top tabular-nums">
                  {money(item.monto)}
                </td>
                <td className="w-36 px-4 py-3 align-top">
                  <div className="flex w-full flex-wrap items-center justify-center gap-2">
                    <EstadoBadge estado={item.estado} />
                  </div>
                </td>
                <td
                  className="w-32 px-4 py-3 align-top"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ActionBarPorRol align="center">
                    <button
                      type="button"
                      className="compact-control app-control-secondary px-3"
                      onClick={() => setSelected(item)}
                    >
                      Abrir
                    </button>
                    {quickActions(item, userRole).map((action) => (
                      <Button
                        key={action.key}
                        size="sm"
                        className="app-button app-button-primary"
                        onPress={() => postAction(item, action.key)}
                      >
                        {action.icon} {action.label}
                      </Button>
                    ))}
                  </ActionBarPorRol>
                </td>
              </tr>
            ))}
          </BandejaTable>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onItemsPerPageChange={setPageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </SectionCard>
  );
}
