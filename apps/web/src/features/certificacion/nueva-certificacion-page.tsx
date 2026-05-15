import { AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/saas-layout";
import { AppButton, InlineAlert, ObservationDialog } from "@/components/app-ui";
import { CertificacionesBandeja } from "./components/certificaciones-bandeja";
import { NuevaCertificacionForm } from "./components/nueva-certificacion-form";
import { useNuevaCertificacionPage } from "./use-nueva-certificacion-page";

export function NuevaCertificacionPage() {
  const page = useNuevaCertificacionPage();

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
          onSubmit={page.handleSubmit}
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
          onAccion={page.accion}
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
    </div>
  );
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
        <div className="section-card flex">
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
