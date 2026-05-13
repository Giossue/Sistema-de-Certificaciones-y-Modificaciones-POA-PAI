import { Button } from "@heroui/react";
import { DollarSign, Loader } from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import { formatMoney } from "@/services/money";
import type { Certificacion } from "../types";

export function LiquidacionForm({
  certificaciones,
  certificacionId,
  setCertificacionId,
  tipo,
  setTipo,
  modo,
  setModo,
  monto,
  setMonto,
  motivo,
  setMotivo,
  loading,
  onEnviar,
}: {
  certificaciones: Certificacion[];
  certificacionId: string;
  setCertificacionId: (value: string) => void;
  tipo: string;
  setTipo: (value: string) => void;
  modo: string;
  setModo: (value: string) => void;
  monto: string;
  setMonto: (value: string) => void;
  motivo: string;
  setMotivo: (value: string) => void;
  loading: boolean;
  onEnviar: () => void;
}) {
  return (
    <SectionCard title="Nueva solicitud de liquidación">
      <div className="max-w-5xl space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.4fr)_140px_140px]">
          <label className="block md:col-span-2 xl:col-span-1">
            <span className="mb-1.5 block">Certificacion</span>
            <select
              value={certificacionId}
              onChange={(e) => setCertificacionId(e.target.value)}
              className="app-field-input"
            >
              <option value="">Seleccione certificacion</option>
              {certificaciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero} - ${formatMoney(c.monto)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block">Tipo</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="app-field-input"
            >
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block">Modo</span>
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value)}
              className="app-field-input"
            >
              <option value="A">Modo A</option>
              <option value="B">Modo B</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(260px,1fr)]">
          <label className="block">
            <span className="mb-1.5 block">Monto parcial</span>
            <input
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              disabled={tipo === "total"}
              placeholder="0.00"
              className="app-field-input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block">Motivo</span>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo de liquidacion"
              className="app-field-input"
            />
          </label>
        </div>
        <div className="app-form-actions">
          <Button
            onPress={onEnviar}
            isDisabled={!certificacionId || loading}
            className="app-button app-button-primary w-full sm:w-auto"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <DollarSign size={16} />
            )}
            Solicitar liquidación
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
