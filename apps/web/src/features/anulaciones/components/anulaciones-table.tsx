import { AppButton, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import { EstadoBadge } from "@/components/tramites";
import { formatMoney } from "@/services/money";
import type { Anulacion } from "../types";

const anulacionesColumns = [
  { key: "certificacion", label: "Certificación", width: "220px" },
  { key: "motivo", label: "Motivo", width: "360px" },
  {
    key: "monto",
    label: "Monto liberado",
    align: "center" as const,
    width: "150px",
  },
  { key: "estado", label: "Estado", align: "center" as const, width: "140px" },
  {
    key: "acciones",
    label: "Acciones",
    align: "center" as const,
    width: "220px",
  },
];

export function AnulacionesTable({
  anulaciones,
  currentPage,
  totalPages,
  totalAnulaciones,
  pageSize,
  setCurrentPage,
  setPageSize,
  canApprove,
  onAprobar,
  onRechazar,
}: {
  anulaciones: Anulacion[];
  currentPage: number;
  totalPages: number;
  totalAnulaciones: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  canApprove: boolean;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}) {
  const renderActions = (anulacion: Anulacion) =>
    anulacion.estado === "solicitada" && canApprove ? (
      <div className="flex flex-wrap justify-center gap-2">
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAprobar(anulacion.id)}
        >
          Aprobar
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onRechazar(anulacion.id)}
        >
          Rechazar
        </AppButton>
      </div>
    ) : null;

  return (
    <SectionCard title="Historial" contentClassName="p-0">
      {anulaciones.length === 0 ? (
        <EmptyState title="Sin anulaciones" />
      ) : (
        <AppTable
          columns={anulacionesColumns}
          data={anulaciones}
          getRowKey={(anulacion) => anulacion.id}
          mobileRender={(anulacion) => (
            <div className="space-y-3">
              <div>
                <p className="app-table-primary font-mono">
                  {anulacion.certificacion?.numero || "-"}
                </p>
                <p className="app-table-secondary">{anulacion.motivo}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>${formatMoney(anulacion.montoLiberado)}</span>
                <EstadoBadge estado={anulacion.estado || "aprobada"} />
              </div>
              {renderActions(anulacion)}
            </div>
          )}
          minWidth={1090}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalAnulaciones,
            itemsPerPage: pageSize,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: setPageSize,
          }}
        >
          {anulaciones.map((a) => (
            <tr key={a.id}>
              <td>
                <p className="app-table-primary font-mono">
                  {a.certificacion?.numero || "-"}
                </p>
              </td>
              <td>
                <p className="app-table-primary">{a.motivo}</p>
              </td>
              <td className="text-center">
                <span className="app-table-primary">
                  ${formatMoney(a.montoLiberado)}
                </span>
              </td>
              <td className="text-center">
                <EstadoBadge estado={a.estado || "aprobada"} />
              </td>
              <td>
                {renderActions(a)}
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}
