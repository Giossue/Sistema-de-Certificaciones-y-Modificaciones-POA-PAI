import { Button } from "@heroui/react";
import { CheckCircle, XCircle } from "lucide-react";
import { AppTable } from "@/components/app-ui";
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
  return (
    <SectionCard title="Historial" contentClassName="p-0">
      {anulaciones.length === 0 ? (
        <EmptyState title="Sin anulaciones" />
      ) : (
        <AppTable
          columns={anulacionesColumns}
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
                <p className="app-table-secondary">{a.motivo}</p>
              </td>
              <td className="text-center">${formatMoney(a.montoLiberado)}</td>
              <td className="text-center">
                <EstadoBadge estado={a.estado || "aprobada"} />
              </td>
              <td>
                <div className="flex justify-center gap-2">
                  {a.estado === "solicitada" && canApprove && (
                    <>
                      <Button
                        size="sm"
                        className="app-button app-button-primary"
                        onPress={() => onAprobar(a.id)}
                      >
                        <CheckCircle size={14} /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => onRechazar(a.id)}
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
