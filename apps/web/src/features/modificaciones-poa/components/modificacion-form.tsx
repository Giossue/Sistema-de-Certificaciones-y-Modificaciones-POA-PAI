import { Button } from "@heroui/react";
import { Loader } from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import type { ActividadSaldo, PeriodoFiscal } from "../types";
import { money } from "./money";

export function ModificacionForm({
  periodos,
  periodoFiscalId,
  setPeriodoFiscalId,
  actividadSearch,
  setActividadSearch,
  actividadId,
  setActividadId,
  actividades,
  motivos,
  motivo,
  setMotivo,
  programaCodigo,
  setProgramaCodigo,
  actividadCodigo,
  setActividadCodigo,
  itemCodigo,
  setItemCodigo,
  actividad,
  montoPlanificadoNuevo,
  setMontoPlanificadoNuevo,
  responsableNuevoNombre,
  setResponsableNuevoNombre,
  tipoDiscrepancia,
  setTipoDiscrepancia,
  observacionBienes,
  setObservacionBienes,
  loading,
  onEnviar,
}: {
  periodos: PeriodoFiscal[];
  periodoFiscalId: string;
  setPeriodoFiscalId: (id: string) => void;
  actividadSearch: string;
  setActividadSearch: (value: string) => void;
  actividadId: string;
  setActividadId: (id: string) => void;
  actividades: ActividadSaldo[];
  motivos: string[];
  motivo: string;
  setMotivo: (value: string) => void;
  programaCodigo: string;
  setProgramaCodigo: (value: string) => void;
  actividadCodigo: string;
  setActividadCodigo: (value: string) => void;
  itemCodigo: string;
  setItemCodigo: (value: string) => void;
  actividad: ActividadSaldo | null;
  montoPlanificadoNuevo: string;
  setMontoPlanificadoNuevo: (value: string) => void;
  responsableNuevoNombre: string;
  setResponsableNuevoNombre: (value: string) => void;
  tipoDiscrepancia: string;
  setTipoDiscrepancia: (value: string) => void;
  observacionBienes: string;
  setObservacionBienes: (value: string) => void;
  loading: boolean;
  onEnviar: () => void;
}) {
  return (
    <SectionCard title="Nueva solicitud">
      <div className="max-w-5xl space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(240px,1fr)]">
          <label className="block min-w-0">
            <span className="mb-1.5 block">Periodo</span>
            <select
              value={periodoFiscalId}
              onChange={(e) => setPeriodoFiscalId(e.target.value)}
              className="app-field-input"
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.anio})
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-1.5 block">Motivo</span>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="app-field-input"
            >
              <option value="">Seleccione motivo</option>
              {motivos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <p className="app-table-primary">Actividad origen</p>
          <label className="block min-w-0">
            <span className="mb-1.5 block">Buscar actividad</span>
            <input
              type="text"
              value={actividadSearch}
              onChange={(e) => setActividadSearch(e.target.value)}
              placeholder="Buscar actividad origen..."
              className="app-field-input"
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-1.5 block">Seleccionar actividad</span>
            <select
              value={actividadId}
              onChange={(e) => setActividadId(e.target.value)}
              className="app-field-input"
            >
              <option value="">Seleccione actividad</option>
              {actividades.map((a) => (
                <option key={a.actividadId} value={a.actividadId}>
                  {a.programaCodigo}/{a.actividadCodigo}/{a.itemCodigo}/
                  {a.fuenteCodigo} - ${money(a.saldoDisponible)}
                </option>
              ))}
            </select>
          </label>
          {actividad && (
            <div className="app-panel-muted rounded border border-slate-200 p-3">
              <p className="app-table-primary">
                Fuente bloqueada: {actividad.fuenteCodigo} -
                {actividad.fuenteNombre}
              </p>
              <p className="app-table-secondary">
                Planificado actual: ${money(actividad.montoPlanificado)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="app-table-primary">Cambios propuestos</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block">Programa</span>
              <input
                type="text"
                value={programaCodigo}
                onChange={(e) => setProgramaCodigo(e.target.value)}
                placeholder="Programa"
                className="app-field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block">Actividad</span>
              <input
                type="text"
                value={actividadCodigo}
                onChange={(e) => setActividadCodigo(e.target.value)}
                placeholder="Actividad"
                className="app-field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block">Ítem</span>
              <input
                type="text"
                value={itemCodigo}
                onChange={(e) => setItemCodigo(e.target.value)}
                placeholder="Ítem"
                className="app-field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block">Fuente</span>
              <input
                type="text"
                value={actividad?.fuenteCodigo || ""}
                disabled
                className="app-field-input"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(260px,1fr)]">
            <label className="block">
              <span className="mb-1.5 block">Monto nuevo</span>
              <input
                type="text"
                value={montoPlanificadoNuevo}
                onChange={(e) => setMontoPlanificadoNuevo(e.target.value)}
                placeholder="0.00"
                className="app-field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block">Responsable nuevo</span>
              <input
                type="text"
                value={responsableNuevoNombre}
                onChange={(e) => setResponsableNuevoNombre(e.target.value)}
                placeholder="Nombre responsable"
                className="app-field-input"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <p className="app-table-primary">Información de bienes</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block">Tipo discrepancia bienes</span>
              <input
                type="text"
                value={tipoDiscrepancia}
                onChange={(e) => setTipoDiscrepancia(e.target.value)}
                placeholder="Valor, ítem, fuente, otro"
                className="app-field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block">Observación bienes</span>
              <input
                type="text"
                value={observacionBienes}
                onChange={(e) => setObservacionBienes(e.target.value)}
                placeholder="Referencia o motivo"
                className="app-field-input"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            onPress={onEnviar}
            isDisabled={!actividad || !motivo || loading}
            className="app-button app-button-primary w-full whitespace-nowrap sm:w-auto"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            Solicitar modificacion
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
