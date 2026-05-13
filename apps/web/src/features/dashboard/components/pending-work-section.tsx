import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { AppTable } from "@/components/app-ui";
import { EstadoBadge } from "@/components/tramites";
import type { Certificacion } from "../types";
import { money, pendingCopyFor } from "../utils/dashboard-helpers";

const pendientesColumns = [
  { key: "tramite", label: "Trámite", width: "160px" },
  { key: "actividad", label: "Actividad", width: "220px" },
  { key: "solicitante", label: "Solicitante", width: "180px" },
  { key: "monto", label: "Monto", align: "right" as const, width: "110px" },
  { key: "estado", label: "Estado", width: "120px" },
];

export function PendingWorkSection({
  userRole,
  pendientes,
}: {
  userRole: string;
  pendientes: Certificacion[];
}) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="">Trabajo pendiente</h2>
          <p className="mt-1">{pendingCopyFor(userRole)}</p>
        </div>
        <Link to="/tramites" className="flex shrink-0 items-center gap-1">
          Bandeja <ArrowRight size={15} />
        </Link>
      </div>
      {pendientes.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <CheckCircle size={24} className="mb-2" />
          <p className="">Sin trámites pendientes para este rol</p>
          <p className="mt-1 max-w-md">
            La bandeja queda limpia. Use los accesos de trabajo para consultar
            saldos o crear nuevas solicitudes.
          </p>
        </div>
      ) : (
        <AppTable columns={pendientesColumns} minWidth={660} clientPagination>
          {pendientes.map((cert) => (
            <tr key={cert.id}>
              <td>
                <p className="app-table-primary font-mono">
                  {cert.numero || "Pendiente"}
                </p>
                <p className="app-table-secondary">{cert.tipo || "POA"}</p>
              </td>
              <td>
                <p className="app-table-primary">
                  {cert.actividad?.actividadNombre ||
                    cert.actividad?.itemNombre ||
                    "Actividad POA"}
                </p>
                <p className="app-table-secondary">
                  {cert.actividad?.itemCodigo || "-"} · Fuente
                  {cert.actividad?.fuenteCodigo || "-"}
                </p>
              </td>
              <td className="">{cert.solicitante?.nombre || "-"}</td>
              <td className="text-right">${money(cert.monto)}</td>
              <td>
                <EstadoBadge estado={cert.estado} />
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </section>
  );
}
