import { Button } from "@heroui/react";
import { Loader, Send } from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import type {
  Actividad,
  FuentePoa,
  ItemPoa,
  PeriodoFiscal,
  Programa,
  SaldoInfo,
  TipoCertificacion,
} from "../types";
import { CheckLine } from "./check-line";
import { SelectField } from "./select-field";

export function NuevaCertificacionForm({
  tipoCertificacion,
  setTipoCertificacion,
  periodoFiscalId,
  setPeriodoFiscalId,
  periodos,
  selectedPrograma,
  setSelectedPrograma,
  selectedActividad,
  setSelectedActividad,
  selectedItem,
  setSelectedItem,
  selectedFuente,
  setSelectedFuente,
  loadingCatalogos,
  programas,
  filteredActividades,
  filteredItems,
  filteredFuentes,
  monto,
  setMonto,
  conIva,
  setConIva,
  documentos,
  setDocumentos,
  submitting,
  puedeEnviar,
  onSubmit,
  loadingSaldo,
  saldo,
  montoNum,
}: {
  tipoCertificacion: TipoCertificacion;
  setTipoCertificacion: (tipo: TipoCertificacion) => void;
  periodoFiscalId: string;
  setPeriodoFiscalId: (id: string) => void;
  periodos: PeriodoFiscal[];
  selectedPrograma: string;
  setSelectedPrograma: (codigo: string) => void;
  selectedActividad: string;
  setSelectedActividad: (codigo: string) => void;
  selectedItem: string;
  setSelectedItem: (codigo: string) => void;
  selectedFuente: string;
  setSelectedFuente: (codigo: string) => void;
  loadingCatalogos: boolean;
  programas: Programa[];
  filteredActividades: Actividad[];
  filteredItems: ItemPoa[];
  filteredFuentes: FuentePoa[];
  monto: string;
  setMonto: (monto: string) => void;
  conIva: boolean;
  setConIva: (conIva: boolean) => void;
  documentos: File[];
  setDocumentos: (documentos: File[]) => void;
  submitting: boolean;
  puedeEnviar: unknown;
  onSubmit: () => void;
  loadingSaldo: boolean;
  saldo: SaldoInfo | null;
  montoNum: number;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
      <SectionCard title="Nueva solicitud">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5">Tipo de certificación</label>
            <select
              value={tipoCertificacion}
              onChange={(e) =>
                setTipoCertificacion(e.target.value as TipoCertificacion)
              }
              className="app-field-input"
            >
              <option value="POA">POA</option>
              <option value="PAI">PAI</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5">Periodo fiscal</label>
            <select
              value={periodoFiscalId}
              onChange={(e) => setPeriodoFiscalId(e.target.value)}
              className="app-field-input"
            >
              <option value="">Seleccione periodo</option>
              {periodos.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} ({periodo.anio})
                </option>
              ))}
            </select>
          </div>
          <SelectField
            label="Programa"
            value={selectedPrograma}
            disabled={loadingCatalogos || programas.length === 0}
            onChange={setSelectedPrograma}
            items={programas}
          />
          <SelectField
            label="Actividad"
            value={selectedActividad}
            disabled={
              loadingCatalogos ||
              !selectedPrograma ||
              filteredActividades.length === 0
            }
            onChange={setSelectedActividad}
            items={filteredActividades}
          />
          <SelectField
            label="Ítem presupuestario"
            value={selectedItem}
            disabled={
              loadingCatalogos || !selectedActividad || filteredItems.length === 0
            }
            onChange={setSelectedItem}
            items={filteredItems}
          />
          <SelectField
            label="Fuente de financiamiento"
            value={selectedFuente}
            disabled={
              loadingCatalogos || !selectedItem || filteredFuentes.length === 0
            }
            onChange={setSelectedFuente}
            items={filteredFuentes}
          />
          <div>
            <label className="block mb-1.5">Monto a certificar</label>
            <input
              type="text"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value.replace(",", "."))}
              placeholder="0.00"
              className="app-field-input"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={conIva}
              onChange={(e) => setConIva(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            El monto incluye IVA
          </label>
          <div>
            <label className="block mb-1.5">Documentos habilitantes</label>
            <input
              type="file"
              multiple
              onChange={(e) => setDocumentos(Array.from(e.target.files || []))}
              className="w-full"
            />
            <p className="mt-1">{documentos.length} archivo(s) seleccionado(s)</p>
          </div>
        </div>
        <div className="mt-5">
          <Button
            onPress={onSubmit}
            isDisabled={!puedeEnviar || submitting}
            className="app-button app-button-primary"
          >
            <Send size={16} />
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </div>
      </SectionCard>
      <SectionCard title="Validacion previa">
        {loadingSaldo ? (
          <p className="flex items-center gap-2">
            <Loader size={14} className="animate-spin" /> Consultando saldo...
          </p>
        ) : saldo ? (
          <div
            className={`p-4 border ${montoNum > saldo.saldoDisponible ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <p className="">Saldo disponible</p>
            <p className={` ${montoNum > saldo.saldoDisponible ? "" : ""}`}>
              $
              {saldo.saldoDisponible.toLocaleString("es-EC", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="mt-3">
              Planificado: $
              {saldo.montoPlanificado.toLocaleString("es-EC", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        ) : (
          <p className="">Seleccione programa, actividad, ítem y fuente.</p>
        )}
        <div className="mt-4 space-y-2">
          <CheckLine
            ok={Boolean(selectedFuente)}
            text="Estructura POA seleccionada"
          />
          <CheckLine ok={Boolean(saldo)} text="Saldo consultado" />
          <CheckLine
            ok={montoNum > 0 && (!saldo || montoNum <= saldo.saldoDisponible)}
            text="Monto dentro del saldo"
          />
          <CheckLine ok={documentos.length > 0} text="Adjuntos habilitantes" />
        </div>
      </SectionCard>
    </div>
  );
}
