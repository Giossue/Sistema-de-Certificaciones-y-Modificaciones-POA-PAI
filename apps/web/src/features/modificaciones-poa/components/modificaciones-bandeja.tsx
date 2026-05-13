import { Button } from "@heroui/react";
import { CheckCircle, FileText } from "lucide-react";
import { AppTable } from "@/components/app-ui";
import { EstadoBadge } from "@/components/tramites";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import type { Modificacion, ModificacionAccion } from "../types";
import { money } from "./money";

const modificacionesColumns = [
  { key: "numero", label: "Trámite", width: "160px" },
  { key: "motivo", label: "Motivo", width: "160px" },
  { key: "estructura", label: "Cambio POA", width: "300px" },
  { key: "monto", label: "Monto", align: "center" as const, width: "180px" },
  { key: "responsable", label: "Responsable", width: "220px" },
  { key: "estado", label: "Estado", align: "center" as const, width: "120px" },
  {
    key: "acciones",
    label: "Acciones",
    align: "center" as const,
    width: "220px",
  },
];

export function ModificacionesBandeja({
  modificaciones,
  currentPage,
  totalPages,
  totalModificaciones,
  pageSize,
  onPageChange,
  onItemsPerPageChange,
  onDescargarInforme,
  onAccion,
  canSubscribe,
  canApprove,
  canObserve,
}: {
  modificaciones: Modificacion[];
  currentPage: number;
  totalPages: number;
  totalModificaciones: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (pageSize: number) => void;
  onDescargarInforme: (id: string, numero: string) => void;
  onAccion: (id: string, tipo: ModificacionAccion) => void;
  canSubscribe: boolean;
  canApprove: boolean;
  canObserve: boolean;
}) {
  return (
    <SectionCard title="Bandeja" contentClassName="p-0">
      {modificaciones.length === 0 ? (
        <EmptyState title="Sin modificaciones registradas" />
      ) : (
        <AppTable
          columns={modificacionesColumns}
          minWidth={1360}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalModificaciones,
            itemsPerPage: pageSize,
            onPageChange,
            onItemsPerPageChange,
          }}
        >
          {modificaciones.map((mod) => (
            <tr key={mod.id}>
              <td>
                <p className="app-table-primary font-mono">{mod.numero}</p>
              </td>
              <td>
                <p className="app-table-primary">{mod.motivo || "Otro"}</p>
              </td>
              <td>
                <p className="app-table-primary font-mono">
                  {mod.anterior.programaCodigo}/{mod.anterior.actividadCodigo}/
                  {mod.anterior.itemCodigo}
                </p>
                <p className="app-table-secondary font-mono">
                  {"->"} {mod.nuevo.programaCodigo}/
                  {mod.nuevo.actividadCodigo}/{mod.nuevo.itemCodigo}
                </p>
              </td>
              <td className="text-center">
                <p className="app-table-primary">
                  ${money(mod.anterior.montoPlanificado)}
                </p>
                <p className="app-table-secondary">
                  {"->"} ${money(mod.nuevo.montoPlanificado)}
                </p>
              </td>
              <td>
                <p className="app-table-primary">
                  {mod.anterior.responsableNombre || "-"}
                </p>
                <p className="app-table-secondary">
                  {"->"} {mod.nuevo.responsableNombre || "-"}
                </p>
              </td>
              <td className="text-center">
                <EstadoBadge estado={mod.estado} />
              </td>
              <td>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onDescargarInforme(mod.id, mod.numero)}
                  >
                    <FileText size={14} /> Informe
                  </Button>
                  {["solicitada", "observada"].includes(mod.estado) &&
                    canSubscribe && (
                      <Button
                        size="sm"
                        className="app-button app-button-primary"
                        onPress={() => onAccion(mod.id, "suscribir")}
                      >
                        Suscribir
                      </Button>
                    )}
                  {mod.estado === "suscrita" && canApprove && (
                    <Button
                      size="sm"
                      className="app-button app-button-primary"
                      onPress={() => onAccion(mod.id, "aprobar")}
                    >
                      <CheckCircle size={14} /> Aprobar
                    </Button>
                  )}
                  {mod.estado === "aprobada" && canApprove && (
                    <Button
                      size="sm"
                      className="app-button app-button-primary"
                      onPress={() => onAccion(mod.id, "aplicar")}
                    >
                      <CheckCircle size={14} /> Aplicar
                    </Button>
                  )}
                  {mod.estado === "solicitada" && canObserve && (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => onAccion(mod.id, "observar")}
                    >
                      Observar
                    </Button>
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
