import { useState } from "react";
import { PageHeader } from "@/components/saas-layout";
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTextarea,
  ConfirmDialog,
  FormField,
  InlineAlert,
  ObservationDialog,
} from "@/components/app-ui";
import type {
  EditarModificacionObservadaPayload,
  ModificacionAccion,
} from "./types";
import { ModificacionForm } from "./components/modificacion-form";
import { ModificacionesBandeja } from "./components/modificaciones-bandeja";
import { useModificacionesPoaPage } from "./use-modificaciones-poa-page";

export function ModificacionesPoaPage() {
  const page = useModificacionesPoaPage();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    tipo: ModificacionAccion;
  } | null>(null);

  const requestAction = (id: string, tipo: ModificacionAccion) => {
    if (tipo === "observar" || tipo === "reenviar") {
      void page.accion(id, tipo);
      return;
    }
    setPendingAction({ id, tipo });
  };

  const pendingModificacion = pendingAction
    ? page.modificaciones.find((modificacion) => modificacion.id === pendingAction.id)
    : null;

  const confirmarAccion = async () => {
    if (!pendingAction) return;
    const ok = await page.accion(pendingAction.id, pendingAction.tipo);
    if (ok) setPendingAction(null);
  };

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
            onEnviar={() => setSubmitConfirmOpen(true)}
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
          onAccion={requestAction}
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
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction
            ? modificacionConfirmTitle(pendingAction.tipo)
            : "Confirmar acción"
        }
        description={
          pendingAction
            ? modificacionConfirmDescription(
                pendingAction.tipo,
                pendingModificacion?.numero || "modificación seleccionada",
              )
            : undefined
        }
        confirmText={
          pendingAction
            ? modificacionConfirmText(pendingAction.tipo)
            : "Confirmar"
        }
        cancelText="Cancelar"
        tone={pendingAction?.tipo === "aplicar" ? "warning" : "info"}
        loading={page.accionLoading}
        onConfirm={confirmarAccion}
        onClose={() => {
          if (!page.accionLoading) setPendingAction(null);
        }}
      />
      <ConfirmDialog
        open={submitConfirmOpen}
        title="Solicitar modificación"
        description="Está por registrar una nueva modificación POA. Revise actividad origen, motivo, cambios propuestos y fuente antes de continuar."
        confirmText="Solicitar modificación"
        cancelText="Cancelar"
        tone="info"
        loading={page.loading}
        onConfirm={async () => {
          await page.enviar();
          setSubmitConfirmOpen(false);
        }}
        onClose={() => {
          if (!page.loading) setSubmitConfirmOpen(false);
        }}
      />
    </div>
  );
}

function modificacionConfirmTitle(tipo: ModificacionAccion) {
  const labels: Partial<Record<ModificacionAccion, string>> = {
    suscribir: "Confirmar suscripción",
    aprobar: "Confirmar aprobación",
    aplicar: "Confirmar aplicación",
  };
  return labels[tipo] || "Confirmar acción";
}

function modificacionConfirmText(tipo: ModificacionAccion) {
  const labels: Partial<Record<ModificacionAccion, string>> = {
    suscribir: "Suscribir",
    aprobar: "Aprobar",
    aplicar: "Aplicar",
  };
  return labels[tipo] || "Confirmar";
}

function modificacionConfirmDescription(
  tipo: ModificacionAccion,
  numero: string,
) {
  const copy: Partial<Record<ModificacionAccion, string>> = {
    suscribir: "suscribir esta modificación POA",
    aprobar: "aprobar esta modificación POA",
    aplicar:
      "aplicar esta modificación y crear la versión correspondiente del POA",
  };
  return `Está por ${copy[tipo] || "ejecutar esta acción"}: ${numero}. Revise que la modificación y el estado sean correctos antes de continuar.`;
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
