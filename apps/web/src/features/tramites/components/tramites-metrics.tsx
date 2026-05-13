import type { Tramite } from "../types";
import { money } from "../utils/tramites-helpers";

export function TramitesMetrics({ tramites }: { tramites: Tramite[] }) {
  const pendientes = tramites.filter((item) =>
    [
      "solicitada",
      "observada",
      "devuelta_financiero",
      "suscrita",
      "aprobada",
    ].includes(item.estado),
  ).length;
  const montoActivo = tramites.reduce(
    (acc, item) =>
      acc +
      (["certificacion", "liquidacion", "anulacion"].includes(item.kind)
        ? Number(item.monto || 0)
        : 0),
    0,
  );

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
      <Metric label="Pendientes accionables" value={pendientes} />
      <Metric label="Trámites cargados" value={tramites.length} />
      <Metric label="Monto relacionado" value={money(montoActivo)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="app-metric-card">
      <p className="">{label}</p> <p className="mt-2">{value}</p>
    </div>
  );
}
