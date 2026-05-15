import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AppCard, AppSectionHeader, AppTable, EmptyState } from "@/components/app-ui";
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
  const pendientesVisibles = pendientes.slice(0, 3);

  return (
    <AppCard padded={false}>
      <AppSectionHeader
        title="Trabajo pendiente"
        description={pendingCopyFor(userRole)}
        actions={
        <Link to="/tramites" className="flex shrink-0 items-center gap-1">
          Bandeja <ArrowRight size={15} />
        </Link>
        }
      />
      {pendientes.length === 0 ? (
        <EmptyState
          title={
            <span className="font-normal">
              Sin trámites pendientes para este rol
            </span>
          }
        />
      ) : (
        <AppTable columns={pendientesColumns} minWidth={660}>
          {pendientesVisibles.map((cert) => (
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
              <td>
                <span className="app-table-primary">
                  {cert.solicitante?.nombre || "-"}
                </span>
              </td>
              <td className="text-right">
                <span className="app-table-primary">${money(cert.monto)}</span>
              </td>
              <td>
                <EstadoBadge estado={cert.estado} />
              </td>
            </tr>
          ))}
        </AppTable>
      )}
    </AppCard>
  );
}
