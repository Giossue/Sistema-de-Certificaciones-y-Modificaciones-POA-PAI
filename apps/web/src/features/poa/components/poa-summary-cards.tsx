import type { PoaInfo } from "../types";

export function PoaSummaryCards({ poaInfo }: { poaInfo: PoaInfo | null }) {
  if (!poaInfo) return null;

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="app-metric-card">
        <p className="">Versión</p>
        <p className="">{poaInfo.numeroVersion}</p>
      </div>
      <div className="app-metric-card">
        <p className="">Actividades</p>
        <p className="">{poaInfo.totalActividades.toLocaleString()}</p>
      </div>
      <div className="app-metric-card">
        <p className="">Monto Total</p>
        <p className="">
          $
          {poaInfo.montoTotal.toLocaleString("es-EC", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="app-metric-card">
        <p className="">Con Saldo</p>
        <p className="">
          {poaInfo.actividadesConSaldo.toLocaleString("es-EC")}
        </p>
      </div>
    </div>
  );
}
