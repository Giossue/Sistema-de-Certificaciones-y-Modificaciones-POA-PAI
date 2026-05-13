import { AppTable } from "@/components/app-ui";
import type { DiffEntrada } from "../types";

const diffColumns = [
  { key: "clave", label: "Clave", width: "220px" },
  { key: "detalle", label: "Detalle" },
];

export function DiffList({
  title,
  total,
  tone,
  entries,
  valueKey,
}: {
  title: string;
  total: number;
  tone: "success" | "warning" | "danger";
  entries: DiffEntrada[];
  valueKey: "datosNuevos" | "datosAnteriores";
}) {
  if (total === 0) {
    return (
      <div>
        <AppTable columns={diffColumns} minWidth={620} clientPagination>
          <tr>
            <td colSpan={2} className="text-center">
              Sin registros
            </td>
          </tr>
        </AppTable>
      </div>
    );
  }

  const visible = entries.slice(0, 20);
  const countTone = tone === "success" ? "" : tone === "warning" ? "" : "";

  return (
    <div>
      <div className="flex items-center justify-between px-4 pb-2">
        <p className="">{title}</p>
        <span className={` tabular-nums ${countTone}`}>
          {Math.min(20, total).toLocaleString("es-EC")} de
          {total.toLocaleString("es-EC")}
        </span>
      </div>
      <AppTable columns={diffColumns} minWidth={620} clientPagination>
        {visible.map((entry, index) => {
          const data = entry[valueKey];
          return (
            <tr key={`${entry.clave}-${index}`}>
              <td>
                <p className="app-table-primary font-mono" title={entry.clave}>
                  {entry.clave}
                </p>
              </td>
              <td>
                <p
                  className="app-table-secondary"
                  title={[
                    data?.programaNombre,
                    data?.actividadNombre,
                    data?.itemNombre,
                  ]
                    .filter(Boolean)
                    .join(" /")}
                >
                  {[
                    data?.programaNombre,
                    data?.actividadNombre,
                    data?.itemNombre,
                  ]
                    .filter(Boolean)
                    .join(" /") || "-"}
                </p>
              </td>
            </tr>
          );
        })}
      </AppTable>
    </div>
  );
}
