import { Hash, User } from "lucide-react";
import { AppBadge, AppButton, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard, TableSkeleton } from "@/components/saas-layout";
import type { VersionCedula } from "../types";

const historialColumns = [
  { key: "version", label: "Versión", width: "30%" },
  { key: "importador", label: "Importador", width: "23%" },
  { key: "fecha", label: "Fecha", align: "center" as const, width: "18%" },
  {
    key: "entradas",
    label: "Entradas",
    align: "center" as const,
    width: "12%",
  },
  { key: "estado", label: "Estado", align: "center" as const, width: "9%" },
  { key: "accion", label: "Acción", align: "center" as const, width: "8%" },
];

export function CedulaHistoryPanel({
  periodoFiscalId,
  loadingVersiones,
  versiones,
  versionesPage,
  totalVersiones,
  versionesPageSize,
  selectedVersion,
  onItemsPerPageChange,
  onPageChange,
  onOpenVersion,
  formatearFecha,
}: {
  periodoFiscalId: string;
  loadingVersiones: boolean;
  versiones: VersionCedula[];
  versionesPage: number;
  totalVersiones: number;
  versionesPageSize: number;
  selectedVersion?: VersionCedula;
  onItemsPerPageChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
  onOpenVersion: (versionId: string) => void;
  formatearFecha: (fecha: string) => string;
}) {
  return (
    <SectionCard
      title="Historial de importaciones"
      description="Versiones cargadas para el periodo fiscal"
      contentClassName="p-0"
    >
      {!periodoFiscalId ? (
        <EmptyState title="Seleccione un periodo fiscal para ver el historial" />
      ) : loadingVersiones ? (
        <TableSkeleton rows={5} columns={6} />
      ) : versiones.length === 0 ? (
        <EmptyState
          title="Sin versiones importadas"
          description="Importe un archivo para ver el historial"
        />
      ) : (
        <div className="overflow-x-auto px-4 pb-4">
          <AppTable
            columns={historialColumns}
            data={versiones}
            getRowKey={(version) => version.id}
            minWidth={980}
            mobileRender={(v) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="app-table-primary truncate">{v.archivoNombre}</p>
                    <p className="app-table-secondary inline-flex items-center gap-1">
                      <Hash size={11} /> {v.archivoHash.slice(0, 12)}...
                    </p>
                  </div>
                  {v.vigente ? (
                    <AppBadge tone="success">Vigente</AppBadge>
                  ) : (
                    <AppBadge>Histórica</AppBadge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Importador</span>
                    <p className="truncate">{v.importadoPor}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Entradas</span>
                    <p>{v.totalEntradas.toLocaleString("es-EC")}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Fecha</span>
                    <p>{formatearFecha(v.createdAt).split(",")[0]}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Corte</span>
                    <p>{formatearFecha(v.corteFecha).split(",")[0]}</p>
                  </div>
                </div>
                <AppButton type="button" size="sm" onClick={() => onOpenVersion(v.id)}>
                  Abrir
                </AppButton>
              </div>
            )}
            pagination={{
              currentPage: versionesPage,
              totalPages: Math.max(1, Math.ceil(totalVersiones / versionesPageSize)),
              totalItems: totalVersiones,
              itemsPerPage: versionesPageSize,
              onItemsPerPageChange,
              onPageChange,
            }}
          >
            {versiones.map((v) => (
              <tr
                key={v.id}
                className={`border-b border-slate-100 hover:bg-slate-50 ${selectedVersion?.id === v.id ? "bg-slate-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <p className="app-table-primary">{v.archivoNombre}</p>
                  <p className="app-table-secondary inline-flex items-center gap-1">
                    <Hash size={11} /> {v.archivoHash.slice(0, 12)}
                    ...
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="app-table-primary inline-flex max-w-[220px] items-center gap-1 truncate"
                    title={v.importadoPor}
                  >
                    <User size={12} className="shrink-0" />
                    {v.importadoPor}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="app-table-primary">
                    {formatearFecha(v.createdAt).split(",")[0]}
                  </p>
                  <p className="app-table-secondary">
                    Corte: {formatearFecha(v.corteFecha).split(",")[0]}
                  </p>
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  <span className="app-table-primary">
                    {v.totalEntradas.toLocaleString("es-EC")}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {v.vigente ? (
                    <AppBadge tone="success">Vigente</AppBadge>
                  ) : (
                    <AppBadge>Histórica</AppBadge>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <AppButton type="button" onClick={() => onOpenVersion(v.id)}>
                    Abrir
                  </AppButton>
                </td>
              </tr>
            ))}
          </AppTable>
        </div>
      )}
    </SectionCard>
  );
}
