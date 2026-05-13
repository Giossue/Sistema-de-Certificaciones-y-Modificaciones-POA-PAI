import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { AppTable } from "@/components/app-ui";
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
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="">Alertas de saldo</h2>
          <p className="mt-1">Actividades con disponibilidad baja o agotada</p>
        </div>
        <Link to="/poa" className="flex items-center gap-1">
          Ver POA <ArrowRight size={15} />
        </Link>
      </div>
      {!resumen || resumen.alertas.length === 0 ? (
        <div className="py-10 text-center">Sin saldos bajos.</div>
      ) : (
        <AppTable columns={alertasColumns} minWidth={660} clientPagination>
          {resumen.alertas.slice(0, 8).map((alerta) => (
            <tr key={alerta.actividadId}>
              <td>
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className={alerta.estado === "bajo" ? "" : ""}
                  />
                  <span className="font-mono">
                    {alerta.programaCodigo}/{alerta.actividadCodigo}/
                    {alerta.fuenteCodigo}
                  </span>
                </div>
              </td>
              <td>
                <p className="app-table-primary">{alerta.itemCodigo}</p>
                <p className="app-table-secondary">{alerta.itemNombre}</p>
              </td>
              <td className="text-right">${money(alerta.saldoDisponible)}</td>
              <td className="text-right">
                {alerta.porcentajeDisponible.toFixed(2)}%
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </section>
  );
}
