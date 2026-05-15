import { AppButton, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import { EstadoBadge } from "@/components/tramites";
import { formatMoney } from "@/services/money";
import type { Liquidacion } from "../types";

const liquidacionesColumns = [
  { key: "certificacion", label: "Certificación", width: "220px" },
  { key: "detalle", label: "Detalle", width: "220px" },
  { key: "monto", label: "Monto", align: "center" as const, width: "140px" },
  { key: "estado", label: "Estado", align: "center" as const, width: "140px" },
  {
    key: "acciones",
    label: "Acciones",
    align: "center" as const,
    width: "220px",
  },
];

export function LiquidacionesTable({
  liquidaciones,
  currentPage,
  totalPages,
  totalLiquidaciones,
  pageSize,
  setCurrentPage,
  setPageSize,
  canApprove,
  onAprobar,
  onRechazar,
}: {
  liquidaciones: Liquidacion[];
  currentPage: number;
  totalPages: number;
  totalLiquidaciones: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  canApprove: boolean;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}) {
  const renderActions = (liquidacion: Liquidacion) =>
    liquidacion.estado === "solicitada" && canApprove ? (
      <div className="flex flex-wrap justify-center gap-2">
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAprobar(liquidacion.id)}
        >
          Aprobar
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onRechazar(liquidacion.id)}
        >
          Rechazar
        </AppButton>
      </div>
    ) : null;

  return (
    <SectionCard title="Historial" contentClassName="p-0">
      {liquidaciones.length === 0 ? (
        <EmptyState title="Sin liquidaciones" />
      ) : (
        <AppTable
          columns={liquidacionesColumns}
          data={liquidaciones}
          getRowKey={(liquidacion) => liquidacion.id}
          mobileRender={(liquidacion) => (
            <div className="space-y-3">
              <div>
                <p className="app-table-primary font-mono">
                  {liquidacion.certificacion?.numero || "-"}
                </p>
                <p className="app-table-secondary">
                  {liquidacion.tipo} · Modo {liquidacion.modo}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>${formatMoney(liquidacion.monto)}</span>
                <EstadoBadge estado={liquidacion.estado || "aprobada"} />
              </div>
              {renderActions(liquidacion)}
            </div>
          )}
          minWidth={940}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalLiquidaciones,
            itemsPerPage: pageSize,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: setPageSize,
          }}
        >
          {liquidaciones.map((l) => (
            <tr key={l.id}>
              <td>
                <p className="app-table-primary font-mono">
                  {l.certificacion?.numero || "-"}
                </p>
              </td>
              <td>
                <p className="app-table-primary">{l.tipo}</p>
                <p className="app-table-secondary">Modo {l.modo}</p>
              </td>
              <td className="text-center">
                <span className="app-table-primary">${formatMoney(l.monto)}</span>
              </td>
              <td className="text-center">
                <EstadoBadge estado={l.estado || "aprobada"} />
              </td>
              <td>
                {renderActions(l)}
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}
