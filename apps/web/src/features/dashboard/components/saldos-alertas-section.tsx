import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  AppCard,
  AppSectionHeader,
  EmptyState,
  InlineAlert,
  AppTable,
} from "@/components/app-ui";
import type { SaldosResumen } from "../types";
import { money } from "../utils/dashboard-helpers";

const alertasColumns = [
  { key: "estructura", label: "Estructura", width: "220px" },
  { key: "item", label: "Ítem", width: "220px" },
  {
    key: "disponible",
    label: "Disponible",
    align: "right" as const,
    width: "120px",
  },
  { key: "porcentaje", label: "%", align: "right" as const, width: "80px" },
];

export function SaldosAlertasSection({
  resumen,
}: {
  resumen: SaldosResumen | null;
}) {
  const alertasVisibles = resumen?.alertas.slice(0, 5) || [];

  return (
    <AppCard padded={false}>
      <AppSectionHeader
        title="Alertas de saldo"
        description="Actividades con disponibilidad baja o agotada"
        actions={
        <Link to="/poa" className="flex items-center gap-1">
          Ver POA <ArrowRight size={15} />
        </Link>
        }
      />
      {!resumen || resumen.alertas.length === 0 ? (
        <EmptyState title={<span className="font-normal">Sin saldos bajos</span>} />
      ) : (
        <>
          <InlineAlert tone="warning" className="m-4">
            Revise estas estructuras antes de comprometer nuevas solicitudes.
          </InlineAlert>
          <AppTable columns={alertasColumns} minWidth={660}>
            {alertasVisibles.map((alerta) => (
              <tr key={alerta.actividadId}>
                <td>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={16}
                      className={alerta.estado === "bajo" ? "" : ""}
                    />
                    <span className="app-table-primary font-mono">
                      {alerta.programaCodigo}/{alerta.actividadCodigo}/
                      {alerta.fuenteCodigo}
                    </span>
                  </div>
                </td>
                <td>
                  <p className="app-table-primary">{alerta.itemCodigo}</p>
                  <p className="app-table-secondary">{alerta.itemNombre}</p>
                </td>
                <td className="text-right">
                  <span className="app-table-primary">
                    ${money(alerta.saldoDisponible)}
                  </span>
                </td>
                <td className="text-right">
                  <span className="app-table-primary">
                    {alerta.porcentajeDisponible.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </AppTable>
        </>
      )}
    </AppCard>
  );
}
