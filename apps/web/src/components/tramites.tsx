import type { ReactNode } from "react";
import { Button } from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  X,
} from "lucide-react";
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
const toneByState: Record<string, string> = {
  solicitada: "app-badge-info",
  observada: "app-badge-warning",
  devuelta_financiero: "app-badge-warning",
  generada: "app-badge-info",
  suscrita: "app-badge-success",
  aprobada: "app-badge-success",
  aplicada: "app-badge-neutral",
  en_uso: "app-badge-neutral",
  liquidada_a: "app-badge-neutral",
  liquidada_b: "app-badge-neutral",
  anulada: "app-badge-danger",
  rechazada: "app-badge-danger",
  pendiente: "app-badge-warning",
  reenviada: "app-badge-info",
};
const labelByState: Record<string, string> = {
  solicitada: "Solicitada",
  observada: "Observada",
  devuelta_financiero: "Devuelta financiero",
  generada: "Generada",
  suscrita: "Suscrita",
  aprobada: "Aprobada",
  aplicada: "Aplicada",
  en_uso: "En uso",
  liquidada_a: "Liquidada A",
  liquidada_b: "Liquidada B",
  anulada: "Anulada",
  rechazada: "Rechazada",
  pendiente: "Pendiente",
  reenviada: "Reenviada",
};
export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={cx(
        "app-badge transition-colors duration-150",
        toneByState[estado] || "app-badge-neutral",
      )}
    >
      {labelByState[estado] || estado}
    </span>
  );
}
export interface TimelineStep {
  key: string;
  label: string;
  done?: boolean;
  current?: boolean;
}
export function TramiteTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step) => {
        const Icon = step.done ? CheckCircle2 : step.current ? Clock3 : Circle;
        return (
          <div
            key={step.key}
            className={cx(
              "flex items-center gap-2",
              step.done ? "" : step.current ? "" : "",
            )}
          >
            <Icon size={14} /> <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
export function BandejaTable({
  children,
  columns,
  sortKey,
  sortDirection,
  onSort,
}: {
  children: ReactNode;
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
}) {
  const columnClass = (label: string) => {
    if (label === "Monto") return "w-32 text-center";
    if (label === "Estado") return "w-36 text-center";
    if (label === "Acciones") return "w-32 text-center";
    if (label === "Trámite") return "w-56 text-left";
    if (label === "Unidad") return "w-64 text-left";
    if (label === "Fecha") return "w-32 text-left";
    return "text-left";
  };
  const justifyClass = (label: string) =>
    ["Monto", "Estado", "Acciones"].includes(label)
      ? "justify-center"
      : "justify-start";
  return (
    <div className="app-table-frame">
      <table className="app-table" style={{ minWidth: "1080px" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cx("px-4 py-3", columnClass(column.label))}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort?.(column.key)}
                    className={cx(
                      "table-sort-button inline-flex h-auto min-h-0 items-center gap-1",
                      justifyClass(column.label),
                    )}
                    aria-sort={
                      sortKey === column.key
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <span>{column.label}</span>
                    {sortKey === column.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-55" />
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function DetalleTramitePanel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="app-panel-detail motion-panel">
      <div className="app-panel-detail-header">
        <div className="min-w-0">
          <h2 className="">{title}</h2>
          {subtitle && <p className="mt-1">{subtitle}</p>}
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onClose}
          aria-label="Cerrar detalle"
        >
          <X size={16} />
        </Button>
      </div>
      <div className="app-panel-detail-body">{children}</div>
    </aside>
  );
}
export function ActionBarPorRol({
  children,
  align = "end",
}: {
  children: ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap gap-2",
        align === "end"
          ? "justify-end"
          : align === "center"
            ? "justify-center"
            : "justify-start",
      )}
    >
      {children}
    </div>
  );
}
export function DocumentoList({
  documentos,
  onDownload,
}: {
  documentos: Array<{
    id: string;
    tipo?: string;
    nombreOriginal?: string;
    plantilla?: string | null;
    versionPlantilla?: string | null;
    hashDocumento?: string | null;
  }>;
  onDownload?: (id: string, nombre: string) => void;
}) {
  if (documentos.length === 0)
    return <p className="">Sin documentos adjuntos.</p>;
  return (
    <div className="app-list-frame">
      {documentos.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() =>
            onDownload?.(doc.id, doc.nombreOriginal || "documento")
          }
          className="app-list-item"
        >
          <FileText size={16} className="mt-0.5" />
          <span className="min-w-0">
            <span className="block truncate">
              {doc.nombreOriginal || doc.tipo || "Documento"}
            </span>
            <span className="block">
              {[
                doc.tipo,
                doc.plantilla,
                doc.versionPlantilla,
                doc.hashDocumento?.slice(0, 12),
              ]
                .filter(Boolean)
                .join(" ·")}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
export function ComparacionAntesDespues({
  before,
  after,
}: {
  before: Array<{ label: string; value: ReactNode }>;
  after: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <ComparisonColumn title="Antes" rows={before} />
      <ComparisonColumn title="Después" rows={after} />
    </div>
  );
}
function ComparisonColumn({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="app-detail-box p-3">
      <p className="mb-2">{title}</p>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="">{row.label}</dt>
            <dd className="">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
