import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { AppBadge, AppButton, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import { DetalleTramitePanel } from "@/components/tramites";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = certificaciones.find((cert) => cert.id === selectedId);

  return (
    <>
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
            minWidth={1040}
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
                    <p className="app-table-primary">{formatMoney(cert.monto)}</p>
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
                  <p className="app-table-secondary">
                    Obs: {cert.observaciones}
                  </p>
                )}
                <AppButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedId(cert.id)}
                >
                  Abrir detalle
                </AppButton>
              </div>
            )}
          >
            {certificaciones.map((cert) => (
              <tr
                key={cert.id}
                className="app-surface-row app-table-row-clickable"
                onClick={() => setSelectedId(cert.id)}
              >
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
                <td className="px-4 py-3">
                  <span className="app-table-primary">
                    {cert.solicitante?.nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  <span className="app-table-primary">
                    {formatMoney(cert.monto)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <AppBadge tone={estadoTone[cert.estado] || "neutral"}>
                    {estadoLabels[cert.estado] || cert.estado}
                  </AppBadge>
                </td>
                <td
                  className="px-4 py-3 text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <AppButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedId(cert.id)}
                  >
                    Abrir
                  </AppButton>
                </td>
              </tr>
            ))}
          </AppTable>
        )}
      </SectionCard>
      {selected && (
        <CertificacionDetailDrawer
          cert={selected}
          canApprove={canApprove}
          canObserve={canObserve}
          canSubscribe={canSubscribe}
          canUse={canUse}
          canCreate={canCreate}
          onAccion={onAccion}
          onDescargar={onDescargar}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
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
}: {
  cert: Certificacion;
  canApprove: boolean;
  canObserve: boolean;
  canSubscribe: boolean;
  canUse: boolean;
  canCreate: boolean;
  onAccion: (id: string, tipo: CertificacionAccion) => void;
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
          Aprobar
        </AppButton>
      )}
      {cert.estado === "generada" && canSubscribe && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "suscribir")}
        >
          Suscribir
        </AppButton>
      )}
      {cert.estado === "suscrita" && canUse && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "marcar-uso")}
        >
          Uso
        </AppButton>
      )}
      {cert.estado === "devuelta_financiero" && canCreate && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onAccion(cert.id, "reenviar")}
        >
          Reenviar
        </AppButton>
      )}
      {["solicitada", "generada"].includes(cert.estado) && canObserve && (
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onAccion(cert.id, "observar")}
        >
          Observar
        </AppButton>
      )}
    </div>
  );
}

function CertificacionDetailDrawer({
  cert,
  canApprove,
  canObserve,
  canSubscribe,
  canUse,
  canCreate,
  onAccion,
  onDescargar,
  onClose,
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
  onClose: () => void;
}) {
  const documentosSistema = cert.documentos.filter(
    (doc) => doc.tipo !== "habilitante",
  );
  const adjuntos = cert.documentos.filter((doc) => doc.tipo === "habilitante");

  return (
    <DetalleTramitePanel
      title={cert.numero || "Certificación pendiente"}
      subtitle={`${cert.tipo || "POA"} · ${cert.actividad?.actividadCodigo || "Sin actividad"}`}
      onClose={onClose}
    >
      <div className="flex items-center justify-between gap-3">
        <AppBadge tone={estadoTone[cert.estado] || "neutral"}>
          {estadoLabels[cert.estado] || cert.estado}
        </AppBadge>
        <span className="app-table-secondary">{formatDate(cert.createdAt)}</span>
      </div>

      <CertificacionActions
        cert={cert}
        canApprove={canApprove}
        canObserve={canObserve}
        canSubscribe={canSubscribe}
        canUse={canUse}
        canCreate={canCreate}
        onAccion={onAccion}
      />

      <div className="app-detail-box p-3">
        <p className="mb-3 app-table-primary font-medium">
          Información principal
        </p>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem label="Monto" value={formatMoney(cert.monto)} />
          <DetailItem label="Solicitante" value={cert.solicitante?.nombre || "-"} />
          <DetailItem label="Correo" value={cert.solicitante?.email || "-"} />
          <DetailItem label="Con IVA" value={cert.conIva ? "Sí" : "No"} />
        </dl>
      </div>

      <div className="app-detail-box p-3">
        <p className="mb-3 app-table-primary font-medium">
          Estructura presupuestaria
        </p>
        <dl className="space-y-2">
          <DetailItem
            label="Programa"
            value={`${cert.actividad?.programaCodigo || "-"} · ${cert.actividad?.programaNombre || "-"}`}
          />
          <DetailItem
            label="Actividad"
            value={`${cert.actividad?.actividadCodigo || "-"} · ${cert.actividad?.actividadNombre || "-"}`}
          />
          <DetailItem
            label="Ítem"
            value={`${cert.actividad?.itemCodigo || "-"} · ${cert.actividad?.itemNombre || "-"}`}
          />
          <DetailItem
            label="Fuente"
            value={`${cert.actividad?.fuenteCodigo || "-"} · ${cert.actividad?.fuenteNombre || "-"}`}
          />
        </dl>
      </div>

      {cert.observaciones && (
        <div className="app-detail-box p-3">
          <p className="mb-1 app-table-primary font-medium">Observaciones</p>
          <p className="app-table-secondary">{cert.observaciones}</p>
        </div>
      )}

      <div>
        <p className="mb-2 app-table-primary font-medium">
          Documentos generados
        </p>
        <CertificacionDocumentList
          documentos={documentosSistema}
          onDownload={(documentoId, nombre) =>
            onDescargar(cert.id, documentoId, nombre)
          }
        />
      </div>

      <div>
        <p className="mb-2 app-table-primary font-medium">Adjuntos</p>
        <CertificacionDocumentList
          documentos={adjuntos}
          onDownload={(documentoId, nombre) =>
            onDescargar(cert.id, documentoId, nombre)
          }
        />
      </div>
    </DetalleTramitePanel>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="app-table-secondary">{label}</dt>
      <dd className="app-table-primary">{value}</dd>
    </div>
  );
}

function CertificacionDocumentList({
  documentos,
  onDownload,
}: {
  documentos: Certificacion["documentos"];
  onDownload: (id: string, nombre: string) => void;
}) {
  if (documentos.length === 0) {
    return <p className="app-table-secondary">Sin documentos disponibles.</p>;
  }

  return (
    <div className="app-list-frame">
      {documentos.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => onDownload(doc.id, doc.nombreOriginal || "documento")}
          className="app-list-item group"
          title={`Descargar ${doc.nombreOriginal || doc.tipo || "documento"}`}
        >
          <FileText size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate app-table-primary font-medium">
              {doc.nombreOriginal || doc.tipo || "Documento"}
            </span>
            <span className="block app-table-secondary">
              {[doc.tipo, doc.plantilla, doc.versionPlantilla]
                .filter(Boolean)
                .join(" ·") || "Documento disponible"}
            </span>
          </span>
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50"
            aria-hidden="true"
          >
            <Download size={15} />
          </span>
        </button>
      ))}
    </div>
  );
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
