import { Button } from "@heroui/react";
import { Loader } from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import { formatMoney } from "@/services/money";
import type { Certificacion } from "../types";

export function AnulacionForm({
  certificaciones,
  certificacionId,
  setCertificacionId,
  motivo,
  setMotivo,
  loading,
  onEnviar,
}: {
  certificaciones: Certificacion[];
  certificacionId: string;
  setCertificacionId: (value: string) => void;
  motivo: string;
  setMotivo: (value: string) => void;
  loading: boolean;
  onEnviar: () => void;
}) {
  return (
    <SectionCard title="Nueva solicitud de anulación">
      <div className="max-w-4xl space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <label className="block">
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
            <span className="mb-1.5 block">Motivo</span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalle el motivo de anulacion"
              className="app-field-input min-h-20 resize-y"
            />
          </label>
        </div>
        <div className="flex justify-start">
          <Button
            onPress={onEnviar}
            isDisabled={!certificacionId || !motivo || loading}
            className="app-button app-button-primary w-full sm:w-auto"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            Solicitar anulación
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
