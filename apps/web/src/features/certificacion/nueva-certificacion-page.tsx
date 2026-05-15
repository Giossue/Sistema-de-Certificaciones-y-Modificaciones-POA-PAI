import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/saas-layout";
import {
  AppButton,
  ConfirmDialog,
  InlineAlert,
  ObservationDialog,
} from "@/components/app-ui";
import { CertificacionesBandeja } from "./components/certificaciones-bandeja";
import { NuevaCertificacionForm } from "./components/nueva-certificacion-form";
import type { CertificacionAccion } from "./types";
import { useNuevaCertificacionPage } from "./use-nueva-certificacion-page";

export function NuevaCertificacionPage() {
  const page = useNuevaCertificacionPage();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    tipo: CertificacionAccion;
  } | null>(null);

  const requestAccion = (id: string, tipo: CertificacionAccion) => {
    if (tipo === "observar") {
      void page.accion(id, tipo);
      return;
    }
    setPendingAction({ id, tipo });
  };

  const pendingCert = pendingAction
    ? page.certificaciones.find((cert) => cert.id === pendingAction.id)
    : null;

  const confirmarAccion = async () => {
    if (!pendingAction) return;
    const ok = await page.accion(pendingAction.id, pendingAction.tipo);
    if (ok) setPendingAction(null);
  };

  return (
    <div className="p-6">
      <CertificacionHeader
        activeTab={page.activeTab}
        canCreate={page.canCreate}
        onTabChange={page.setTab}
      />
      <CertificacionMessage message={page.message} />
      {page.activeTab === "nueva" ? (
        <NuevaCertificacionForm
          tipoCertificacion={page.tipoCertificacion}
          setTipoCertificacion={page.setTipoCertificacion}
          periodoFiscalId={page.periodoFiscalId}
          setPeriodoFiscalId={page.setPeriodoFiscalId}
          periodos={page.periodos}
          selectedPrograma={page.selectedPrograma}
          setSelectedPrograma={page.setSelectedPrograma}
          selectedActividad={page.selectedActividad}
          setSelectedActividad={page.setSelectedActividad}
          selectedItem={page.selectedItem}
          setSelectedItem={page.setSelectedItem}
          selectedFuente={page.selectedFuente}
          setSelectedFuente={page.setSelectedFuente}
          loadingCatalogos={page.loadingCatalogos}
          programas={page.programas}
          filteredActividades={page.filteredActividades}
          filteredItems={page.filteredItems}
          filteredFuentes={page.filteredFuentes}
          monto={page.monto}
          setMonto={page.setMonto}
          conIva={page.conIva}
          setConIva={page.setConIva}
          documentos={page.documentos}
          setDocumentos={page.setDocumentos}
          submitting={page.submitting}
          puedeEnviar={page.puedeEnviar}
          onSubmit={() => setSubmitConfirmOpen(true)}
          loadingSaldo={page.loadingSaldo}
          saldo={page.saldo}
          montoNum={page.montoNum}
        />
      ) : (
        <CertificacionesBandeja
          loadingCerts={page.loadingCerts}
          certificaciones={page.certificaciones}
          currentPage={page.currentPage}
          totalPages={page.totalPages}
          totalCertificaciones={page.totalCertificaciones}
          pageSize={page.pageSize}
          onPageChange={page.setCurrentPage}
          onItemsPerPageChange={page.setPageSize}
          onAccion={requestAccion}
          onDescargar={page.descargar}
          canApprove={page.canApprove}
          canObserve={page.canObserve}
          canSubscribe={page.canSubscribe}
          canUse={page.canUse}
          canCreate={page.canCreate}
        />
      )}
      <CertificacionObservationModal
        open={Boolean(page.observacionDialog)}
        value={page.observacionTexto}
        loading={page.accionLoading}
        onChange={page.setObservacionTexto}
        onClose={page.cerrarObservacion}
        onConfirm={page.confirmarObservacion}
      />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction
            ? certificacionConfirmTitle(pendingAction.tipo)
            : "Confirmar acción"
        }
        description={
          pendingAction
            ? certificacionConfirmDescription(
                pendingAction.tipo,
                pendingCert?.numero || "certificación pendiente",
              )
            : undefined
        }
        confirmText={
          pendingAction
            ? certificacionConfirmText(pendingAction.tipo)
            : "Confirmar"
        }
        cancelText="Cancelar"
        tone="info"
        loading={page.accionLoading}
        onConfirm={confirmarAccion}
        onClose={() => {
          if (!page.accionLoading) setPendingAction(null);
        }}
      />
      <ConfirmDialog
        open={submitConfirmOpen}
        title="Enviar solicitud"
        description="Está por enviar una nueva certificación. Revise periodo, estructura presupuestaria, monto y documentos habilitantes antes de continuar."
        confirmText="Enviar solicitud"
        cancelText="Cancelar"
        tone="info"
        loading={page.submitting}
        onConfirm={async () => {
          await page.handleSubmit();
          setSubmitConfirmOpen(false);
        }}
        onClose={() => {
          if (!page.submitting) setSubmitConfirmOpen(false);
        }}
      />
    </div>
  );
}

function certificacionConfirmTitle(tipo: CertificacionAccion) {
  const labels: Record<CertificacionAccion, string> = {
    aprobar: "Confirmar aprobación",
    suscribir: "Confirmar suscripción",
    observar: "Confirmar observación",
    "marcar-uso": "Confirmar uso",
    reenviar: "Confirmar reenvío",
  };
  return labels[tipo];
}

function certificacionConfirmText(tipo: CertificacionAccion) {
  const labels: Record<CertificacionAccion, string> = {
    aprobar: "Aprobar",
    suscribir: "Suscribir",
    observar: "Observar",
    "marcar-uso": "Marcar uso",
    reenviar: "Reenviar",
  };
  return labels[tipo];
}

function certificacionConfirmDescription(
  tipo: CertificacionAccion,
  numero: string,
) {
  const copy: Record<CertificacionAccion, string> = {
    aprobar: "aprobar esta certificación y generar sus documentos",
    suscribir: "suscribir esta certificación",
    observar: "registrar una observación",
    "marcar-uso": "marcar esta certificación como en uso",
    reenviar: "reenviar esta certificación para revisión",
  };
  return `Está por ${copy[tipo]}: ${numero}. Revise que la certificación y el estado sean correctos antes de continuar.`;
}

function CertificacionHeader({
  activeTab,
  canCreate,
  onTabChange,
}: {
  activeTab: string;
  canCreate: boolean;
  onTabChange: (tab: "nueva" | "bandeja") => void;
}) {
  return (
    <PageHeader
      title="Certificaciones POA/PAI"
      description="Solicitud, revisión, suscripción y documentos emitidos"
      actions={
        <div className="section-card app-segmented-tabs">
          {canCreate && (
            <AppButton
              type="button"
              variant={activeTab === "nueva" ? "primary" : "ghost"}
              onClick={() => onTabChange("nueva")}
            >
              Nueva
            </AppButton>
          )}
          <AppButton
            type="button"
            variant={activeTab === "bandeja" ? "primary" : "ghost"}
            onClick={() => onTabChange("bandeja")}
          >
            Bandeja
          </AppButton>
        </div>
      }
    />
  );
}

function CertificacionMessage({
  message,
}: {
  message: { type: "ok" | "error"; text: string } | null;
}) {
  if (!message) return null;
  return (
    <InlineAlert tone={message.type === "ok" ? "success" : "danger"}>
      <div className="flex items-center gap-2">
        {message.type === "ok" ? (
          <CheckCircle size={16} />
        ) : (
          <AlertCircle size={16} />
        )}
        {message.text}
      </div>
    </InlineAlert>
  );
}

function CertificacionObservationModal({
  open,
  value,
  loading,
  onChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ObservationDialog
      open={open}
      title="Registrar observación"
      description="Ingrese el motivo de la observación para continuar con la acción."
      label="Motivo"
      placeholder="Detalle la observación"
      value={value}
      onChange={onChange}
      required
      tone="warning"
      confirmText="Enviar observación"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
