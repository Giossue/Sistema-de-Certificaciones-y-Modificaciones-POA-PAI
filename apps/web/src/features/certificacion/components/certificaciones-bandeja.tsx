import { CheckCircle, Download, Eye, PenLine, Send } from "lucide-react";
import { AppBadge, AppButton, AppTable } from "@/components/app-ui";
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
          data={certificaciones}
          getRowKey={(cert) => cert.id}
          minWidth={1180}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalCertificaciones,
            itemsPerPage: pageSize,
            onPageChange,
            onItemsPerPageChange,
          }}
          mobileRender={(cert) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="app-table-primary font-mono">
                    {cert.numero || "Pendiente"}
                  </p>
                  <p className="app-table-secondary">
                    {cert.actividad?.actividadCodigo} -
                    {cert.actividad?.actividadNombre}
                  </p>
                </div>
                <AppBadge tone={estadoTone[cert.estado] || "neutral"}>
                  {estadoLabels[cert.estado] || cert.estado}
                </AppBadge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="app-table-secondary">Tipo</p>
                  <p className="app-table-primary">{cert.tipo || "POA"}</p>
                </div>
                <div>
                  <p className="app-table-secondary">Monto</p>
                  <p className="app-table-primary">
                    $
                    {cert.monto.toLocaleString("es-EC", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="app-table-secondary">Solicitante</p>
                  <p className="app-table-primary">
                    {cert.solicitante?.nombre || "-"}
                  </p>
                </div>
                <div>
                  <p className="app-table-secondary">Ítem / Fuente</p>
                  <p className="app-table-primary">
                    {cert.actividad?.itemCodigo || "-"} /
                    {cert.actividad?.fuenteCodigo || "-"}
                  </p>
                </div>
              </div>
              {cert.observaciones && (
                <p className="app-table-secondary">Obs: {cert.observaciones}</p>
              )}
              <CertificacionActions
                cert={cert}
                canApprove={canApprove}
                canObserve={canObserve}
                canSubscribe={canSubscribe}
                canUse={canUse}
                canCreate={canCreate}
                onAccion={onAccion}
                onDescargar={onDescargar}
              />
            </div>
          )}
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
                <CertificacionActions
                  cert={cert}
                  canApprove={canApprove}
                  canObserve={canObserve}
                  canSubscribe={canSubscribe}
                  canUse={canUse}
                  canCreate={canCreate}
                  onAccion={onAccion}
                  onDescargar={onDescargar}
                />
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}

function CertificacionActions({
  cert,
  canApprove,
  canObserve,
  canSubscribe,
  canUse,
  canCreate,
  onAccion,
  onDescargar,
}: {
  cert: Certificacion;
  canApprove: boolean;
  canObserve: boolean;
  canSubscribe: boolean;
  canUse: boolean;
  canCreate: boolean;
  onAccion: (id: string, tipo: CertificacionAccion) => void;
  onDescargar: (
    certificacionId: string,
    documentoId: string,
    nombre: string,
  ) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {["solicitada", "observada"].includes(cert.estado) && canApprove && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "aprobar")}
        >
          <CheckCircle size={14} /> Aprobar
        </AppButton>
      )}
      {cert.estado === "generada" && canSubscribe && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "suscribir")}
        >
          <PenLine size={14} /> Suscribir
        </AppButton>
      )}
      {cert.estado === "suscrita" && canUse && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "marcar-uso")}
        >
          <CheckCircle size={14} /> Uso
        </AppButton>
      )}
      {cert.estado === "devuelta_financiero" && canCreate && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "reenviar")}
        >
          <Send size={14} /> Reenviar
        </AppButton>
      )}
      {["solicitada", "generada"].includes(cert.estado) && canObserve && (
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onAccion(cert.id, "observar")}
        >
          <Eye size={14} /> Observar
        </AppButton>
      )}
      {cert.documentos
        .filter((doc) => doc.tipo !== "habilitante")
        .map((doc) => (
          <AppButton
            key={doc.id}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onDescargar(cert.id, doc.id, doc.nombreOriginal)}
          >
            <Download size={14} /> PDF
          </AppButton>
        ))}
    </div>
  );
}
