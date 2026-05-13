import { Button } from "@heroui/react";
import { GitBranch, Loader } from "lucide-react";
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
      <div className="max-w-6xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(280px,1fr)_260px] gap-3">
          <label className="block min-w-0">
            <span className="">Periodo</span>
            <select
              value={periodoFiscalId}
              onChange={(e) => setPeriodoFiscalId(e.target.value)}
              className="app-field-input mt-1"
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.anio})
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="">Actividad origen</span>
            <input
              value={actividadSearch}
              onChange={(e) => setActividadSearch(e.target.value)}
              placeholder="Buscar actividad origen..."
              className="app-field-input mt-1"
            />
            <select
              value={actividadId}
              onChange={(e) => setActividadId(e.target.value)}
              className="app-field-input mt-1"
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
          <label className="block min-w-0">
            <span className="">Motivo</span>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="app-field-input mt-1"
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[110px_110px_110px_130px_170px]">
          <label className="block">
            <span className="mb-1 block">Programa</span>
            <input
              value={programaCodigo}
              onChange={(e) => setProgramaCodigo(e.target.value)}
              placeholder="Programa"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Actividad</span>
            <input
              value={actividadCodigo}
              onChange={(e) => setActividadCodigo(e.target.value)}
              placeholder="Actividad"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Item</span>
            <input
              value={itemCodigo}
              onChange={(e) => setItemCodigo(e.target.value)}
              placeholder="Item"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Fuente</span>
            <input
              value={actividad?.fuenteCodigo || ""}
              disabled
              className="app-field-input app-panel-muted"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Monto nuevo</span>
            <input
              value={montoPlanificadoNuevo}
              onChange={(e) => setMontoPlanificadoNuevo(e.target.value)}
              placeholder="0.00"
              className="app-field-input"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block">Responsable nuevo</span>
            <input
              value={responsableNuevoNombre}
              onChange={(e) => setResponsableNuevoNombre(e.target.value)}
              placeholder="Nombre responsable"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Tipo discrepancia bienes</span>
            <input
              value={tipoDiscrepancia}
              onChange={(e) => setTipoDiscrepancia(e.target.value)}
              placeholder="Valor, ítem, fuente, otro"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block">Observación bienes</span>
            <input
              value={observacionBienes}
              onChange={(e) => setObservacionBienes(e.target.value)}
              placeholder="Referencia o motivo"
              className="app-field-input"
            />
          </label>
        </div>
        <div className="app-form-actions">
          <Button
            onPress={onEnviar}
            isDisabled={!actividad || !motivo || loading}
            className="app-button app-button-primary w-full whitespace-nowrap lg:w-auto"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <GitBranch size={16} />
            )}
            Solicitar modificacion
          </Button>
        </div>
        {actividad && (
          <div className="app-panel-muted p-3">
            <p>
              Fuente bloqueada: {actividad.fuenteCodigo} -
              {actividad.fuenteNombre}
            </p>
            <p>Planificado actual: ${money(actividad.montoPlanificado)}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
