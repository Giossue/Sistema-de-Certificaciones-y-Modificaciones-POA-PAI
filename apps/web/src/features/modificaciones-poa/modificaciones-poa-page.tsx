import { PageHeader } from "@/components/saas-layout";
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  FormField,
  InlineAlert,
  ObservationDialog,
} from "@/components/app-ui";
import type { EditarModificacionObservadaPayload } from "./types";
import { ModificacionForm } from "./components/modificacion-form";
import { ModificacionesBandeja } from "./components/modificaciones-bandeja";
import { useModificacionesPoaPage } from "./use-modificaciones-poa-page";

export function ModificacionesPoaPage() {
  const page = useModificacionesPoaPage();

  return (
    <div className="p-6">
      <PageHeader
        title="Modificaciones POA"
        description="Solicitud, revision y versionamiento controlado del POA"
      />
      <ModificacionesMessage message={page.message} />
      <div className="space-y-6">
        {page.canCreate && (
          <ModificacionForm
            periodos={page.periodos}
            periodoFiscalId={page.periodoFiscalId}
            setPeriodoFiscalId={page.setPeriodoFiscalId}
            actividadSearch={page.actividadSearch}
            setActividadSearch={page.setActividadSearch}
            actividadId={page.actividadId}
            setActividadId={page.setActividadId}
            actividades={page.actividades}
            motivos={page.motivos}
            motivo={page.motivo}
            setMotivo={page.setMotivo}
            programaCodigo={page.programaCodigo}
            setProgramaCodigo={page.setProgramaCodigo}
            actividadCodigo={page.actividadCodigo}
            setActividadCodigo={page.setActividadCodigo}
            itemCodigo={page.itemCodigo}
            setItemCodigo={page.setItemCodigo}
            actividad={page.actividad}
            montoPlanificadoNuevo={page.montoPlanificadoNuevo}
            setMontoPlanificadoNuevo={page.setMontoPlanificadoNuevo}
            responsableNuevoNombre={page.responsableNuevoNombre}
            setResponsableNuevoNombre={page.setResponsableNuevoNombre}
            tipoDiscrepancia={page.tipoDiscrepancia}
            setTipoDiscrepancia={page.setTipoDiscrepancia}
            observacionBienes={page.observacionBienes}
            setObservacionBienes={page.setObservacionBienes}
            loading={page.loading}
            onEnviar={page.enviar}
          />
        )}
        <ModificacionesBandeja
          modificaciones={page.modificaciones}
          currentPage={page.currentPage}
          totalPages={page.totalPages}
          totalModificaciones={page.totalModificaciones}
          pageSize={page.pageSize}
          onPageChange={page.setCurrentPage}
          onItemsPerPageChange={page.setPageSize}
          onDescargarInforme={page.descargarInforme}
          onAccion={page.accion}
          onEditar={page.abrirEdicion}
          accionEnCursoId={page.accionEnCursoId}
          canResend={page.canCreate}
          canEdit={page.canCreate}
          canSubscribe={page.canSubscribe}
          canApprove={page.canApprove}
          canObserve={page.canObserve}
        />
      </div>
      <ModificacionObservationModal
        open={Boolean(page.observacionDialog)}
        action={
          page.observacionDialog?.tipo === "reenviar"
            ? "reenviar"
            : "observar"
        }
        value={page.observacionTexto}
        loading={page.accionLoading}
        onChange={page.setObservacionTexto}
        onClose={page.cerrarObservacion}
        onConfirm={page.confirmarObservacion}
      />
      <ModificacionEditModal
        open={Boolean(page.edicionDialog)}
        form={page.edicionForm}
        motivos={page.motivos}
        loading={page.edicionLoading}
        onChange={page.actualizarEdicionForm}
        onClose={page.cerrarEdicion}
        onConfirm={async () => {
          await page.guardarEdicion();
        }}
      />
    </div>
  );
}

function ModificacionesMessage({
  message,
}: {
  message: { type: "ok" | "error"; text: string } | null;
}) {
  if (!message) return null;
  return (
    <InlineAlert tone={message.type === "ok" ? "success" : "danger"}>
      {message.text}
    </InlineAlert>
  );
}

function ModificacionObservationModal({
  open,
  action,
  value,
  loading,
  onChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  action: "observar" | "reenviar";
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ObservationDialog
      open={open}
      title={
        action === "reenviar"
          ? "Reenviar modificación"
          : "Registrar observación"
      }
      description={
        action === "reenviar"
          ? "Explique la subsanación realizada antes de reenviar la modificación."
          : "Ingrese la observación para continuar con la modificación."
      }
      label="Observación"
      placeholder={
        action === "reenviar"
          ? "Detalle la subsanación"
          : "Detalle la observación"
      }
      value={value}
      onChange={onChange}
      required
      tone="warning"
      confirmText={
        action === "reenviar" ? "Reenviar solicitud" : "Enviar observación"
      }
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function ModificacionEditModal({
  open,
  form,
  motivos,
  loading,
  onChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  form: EditarModificacionObservadaPayload;
  motivos: string[];
  loading: boolean;
  onChange: (field: keyof EditarModificacionObservadaPayload, value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  if (!open) return null;

  const isInvalid =
    !form.motivo ||
    !form.programaCodigo ||
    !form.actividadCodigo ||
    !form.itemCodigo ||
    !form.montoPlanificadoNuevo ||
    !form.justificacion.trim();

  return (
    <div className="app-dialog-backdrop" role="presentation">
      <form
        className="app-dialog app-dialog-warning max-w-3xl"
        onSubmit={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!loading && !isInvalid) await onConfirm();
        }}
      >
        <div className="app-dialog-header">
          <div>
            <p className="app-dialog-title">Editar modificación observada</p>
            <p className="app-dialog-description">
              Corrija los campos observados. La modificación seguirá observada
              hasta que use Reenviar.
            </p>
          </div>
          <button
            type="button"
            className="app-dialog-close"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FormField label="Motivo" required>
            <AppSelect
              value={form.motivo}
              onChange={(event) => onChange("motivo", event.target.value)}
              placeholder="Seleccione motivo"
              disabled={loading}
            >
              {motivos.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </AppSelect>
          </FormField>
          <FormField label="Programa" required>
            <AppInput
              value={form.programaCodigo}
              onChange={(event) =>
                onChange("programaCodigo", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
          <FormField label="Actividad" required>
            <AppInput
              value={form.actividadCodigo}
              onChange={(event) =>
                onChange("actividadCodigo", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
          <FormField label="Item presupuestario" required>
            <AppInput
              value={form.itemCodigo}
              onChange={(event) => onChange("itemCodigo", event.target.value)}
              disabled={loading}
            />
          </FormField>
          <FormField label="Fuente">
            <AppInput
              value={form.fuenteCodigo}
              disabled
              className="app-panel-muted"
            />
          </FormField>
          <FormField label="Monto nuevo" required>
            <AppInput
              value={form.montoPlanificadoNuevo}
              onChange={(event) =>
                onChange("montoPlanificadoNuevo", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
          <FormField label="Responsable nuevo">
            <AppInput
              value={form.responsableNuevoNombre}
              onChange={(event) =>
                onChange("responsableNuevoNombre", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
          <FormField label="Tipo discrepancia bienes">
            <AppInput
              value={form.tipoDiscrepancia}
              onChange={(event) =>
                onChange("tipoDiscrepancia", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
          <FormField label="Observación bienes">
            <AppInput
              value={form.observacionBienes}
              onChange={(event) =>
                onChange("observacionBienes", event.target.value)
              }
              disabled={loading}
            />
          </FormField>
        </div>
        <FormField
          label="Justificación de la edición"
          description="Se registrará en auditoría."
          required
        >
          <AppTextarea
            rows={3}
            value={form.justificacion}
            onChange={(event) => onChange("justificacion", event.target.value)}
            disabled={loading}
            placeholder="Detalle qué se corrigió"
          />
        </FormField>
        <div className="app-dialog-actions">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || isInvalid}
          >
            Guardar edición
          </AppButton>
        </div>
      </form>
    </div>
  );
}
