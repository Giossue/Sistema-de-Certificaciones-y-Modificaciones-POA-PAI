import { Button } from "@heroui/react";
import { CheckCircle, XCircle } from "lucide-react";
import { AppTable } from "@/components/app-ui";
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
  return (
    <SectionCard title="Historial" contentClassName="p-0">
      {liquidaciones.length === 0 ? (
        <EmptyState title="Sin liquidaciones" />
      ) : (
        <AppTable
          columns={liquidacionesColumns}
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
              <td className="text-center">${formatMoney(l.monto)}</td>
              <td className="text-center">
                <EstadoBadge estado={l.estado || "aprobada"} />
              </td>
              <td>
                <div className="flex justify-center gap-2">
                  {l.estado === "solicitada" && canApprove && (
                    <>
                      <Button
                        size="sm"
                        className="app-button app-button-primary"
                        onPress={() => onAprobar(l.id)}
                      >
                        <CheckCircle size={14} /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => onRechazar(l.id)}
                      >
                        <XCircle size={14} /> Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}
