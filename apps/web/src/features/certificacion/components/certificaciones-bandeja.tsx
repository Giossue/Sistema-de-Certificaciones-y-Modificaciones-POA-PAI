import { Button } from "@heroui/react";
import { CheckCircle, Download, Eye, PenLine, Send } from "lucide-react";
import { AppBadge, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import type { Certificacion, CertificacionAccion } from "../types";

const estadoLabels: Record<string, string> = {
  solicitada: "Solicitada",
  observada: "Observada",
  generada: "Generada",
  suscrita: "Suscrita",
  en_uso: "En uso",
  devuelta_financiero: "Devuelta financiero",
  liquidada_a: "Liquidada A",
  liquidada_b: "Liquidada B",
  anulada: "Anulada",
};

const estadoTone: Record<
  string,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  solicitada: "info",
  observada: "warning",
  generada: "info",
  suscrita: "success",
  en_uso: "neutral",
  devuelta_financiero: "warning",
  liquidada_a: "neutral",
  liquidada_b: "neutral",
  anulada: "danger",
};

const certificacionesColumns = [
  { key: "numero", label: "Número", width: "16%" },
  { key: "tipo", label: "Tipo", width: "8%" },
  { key: "actividad", label: "Actividad", width: "30%" },
  { key: "solicitante", label: "Solicitante", width: "18%" },
  { key: "monto", label: "Monto", align: "center" as const, width: "11%" },
  { key: "estado", label: "Estado", align: "center" as const, width: "10%" },
  {
    key: "acciones",
    label: "Acciones",
    align: "center" as const,
    width: "15%",
  },
];

export function CertificacionesBandeja({
  loadingCerts,
  certificaciones,
  currentPage,
  totalPages,
  totalCertificaciones,
  pageSize,
  onPageChange,
  onItemsPerPageChange,
  onAccion,
  onDescargar,
  canApprove,
  canObserve,
  canSubscribe,
  canUse,
  canCreate,
}: {
  loadingCerts: boolean;
  certificaciones: Certificacion[];
  currentPage: number;
  totalPages: number;
  totalCertificaciones: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (pageSize: number) => void;
  onAccion: (id: string, tipo: CertificacionAccion) => void;
  onDescargar: (
    certificacionId: string,
    documentoId: string,
    nombre: string,
  ) => void;
  canApprove: boolean;
  canObserve: boolean;
  canSubscribe: boolean;
  canUse: boolean;
  canCreate: boolean;
}) {
  return (
    <SectionCard title="Bandeja" contentClassName="p-0">
      {loadingCerts ? (
        <EmptyState title="Cargando certificaciones..." />
      ) : certificaciones.length === 0 ? (
        <EmptyState title="No hay certificaciones registradas" />
      ) : (
        <AppTable
          columns={certificacionesColumns}
          minWidth={1180}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalCertificaciones,
            itemsPerPage: pageSize,
            onPageChange,
            onItemsPerPageChange,
          }}
        >
          {certificaciones.map((cert) => (
            <tr key={cert.id} className="app-surface-row">
              <td className="px-4 py-3">
                <p className="app-table-primary font-mono">
                  {cert.numero || "Pendiente"}
                </p>
              </td>
              <td className="px-4 py-3">
                <AppBadge>{cert.tipo || "POA"}</AppBadge>
              </td>
              <td className="px-4 py-3">
                <p className="app-table-primary">
                  {cert.actividad?.actividadCodigo} -
                  {cert.actividad?.actividadNombre}
                </p>
                <p className="app-table-secondary">
                  {cert.actividad?.itemCodigo} / Fuente
                  {cert.actividad?.fuenteCodigo}
                </p>
                {cert.observaciones && (
                  <p className="mt-1">Obs: {cert.observaciones}</p>
                )}
              </td>
              <td className="px-4 py-3">{cert.solicitante?.nombre}</td>
              <td className="px-4 py-3 text-center tabular-nums">
                $
                {cert.monto.toLocaleString("es-EC", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-3 text-center">
                <AppBadge tone={estadoTone[cert.estado] || "neutral"}>
                  {estadoLabels[cert.estado] || cert.estado}
                </AppBadge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {["solicitada", "observada"].includes(cert.estado) &&
                    canApprove && (
                      <Button
                        size="sm"
                        className="app-button app-button-primary"
                        onPress={() => onAccion(cert.id, "aprobar")}
                      >
                        <CheckCircle size={14} /> Aprobar
                      </Button>
                    )}
                  {cert.estado === "generada" && canSubscribe && (
                    <Button
                      size="sm"
                      className="app-button app-button-primary"
                      onPress={() => onAccion(cert.id, "suscribir")}
                    >
                      <PenLine size={14} /> Suscribir
                    </Button>
                  )}
                  {cert.estado === "suscrita" && canUse && (
                    <Button
                      size="sm"
                      className="app-button app-button-primary"
                      onPress={() => onAccion(cert.id, "marcar-uso")}
                    >
                      <CheckCircle size={14} /> Uso
                    </Button>
                  )}
                  {cert.estado === "devuelta_financiero" && canCreate && (
                    <Button
                      size="sm"
                      className="app-button app-button-primary"
                      onPress={() => onAccion(cert.id, "reenviar")}
                    >
                      <Send size={14} /> Reenviar
                    </Button>
                  )}
                  {["solicitada", "generada"].includes(cert.estado) &&
                    canObserve && (
                      <Button
                        size="sm"
                        className="app-button app-button-secondary"
                        variant="outline"
                        onPress={() => onAccion(cert.id, "observar")}
                      >
                        <Eye size={14} /> Observar
                      </Button>
                    )}
                  {cert.documentos
                    .filter((doc) => doc.tipo !== "habilitante")
                    .map((doc) => (
                      <Button
                        key={doc.id}
                        size="sm"
                        className="app-button app-button-secondary"
                        variant="outline"
                        onPress={() =>
                          onDescargar(cert.id, doc.id, doc.nombreOriginal)
                        }
                      >
                        <Download size={14} /> PDF
                      </Button>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}
