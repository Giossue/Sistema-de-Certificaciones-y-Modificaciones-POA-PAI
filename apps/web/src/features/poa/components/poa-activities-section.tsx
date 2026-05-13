import { Button } from "@heroui/react";
import { CheckCircle, Download, Layers, Upload } from "lucide-react";
import { AppBadge, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard, TableSkeleton } from "@/components/saas-layout";
import type {
  ActividadPoa,
  PoaImportResult,
  PoaInfo,
  SortDirection,
  SortKey,
} from "../types";

const poaColumns = [
  { key: "programa", label: "Prog.", sortable: true, width: "160px" },
  { key: "actividad", label: "Actividad", sortable: true, width: "220px" },
  { key: "item", label: "Ítem", sortable: true, width: "180px" },
  { key: "fuente", label: "Fuente", sortable: true, width: "190px" },
  {
    key: "planificado",
    label: "Planificado",
    sortable: true,
    align: "center" as const,
    width: "130px",
  },
  {
    key: "certificado",
    label: "Certificado",
    sortable: true,
    align: "center" as const,
    width: "120px",
  },
  {
    key: "bloqueado",
    label: "Bloq.",
    sortable: true,
    align: "center" as const,
    width: "110px",
  },
  {
    key: "saldo",
    label: "Saldo",
    sortable: true,
    align: "center" as const,
    width: "130px",
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    align: "center" as const,
    width: "100px",
  },
  { key: "accion", label: "Acción", align: "center" as const, width: "96px" },
];

export function PoaActivitiesSection({
  periodoFiscalId,
  loading,
  pageSize,
  poaInfo,
  selectedFile,
  importError,
  importResult,
  totalItems,
  actividadesPaginadas,
  sortKey,
  sortDirection,
  currentPage,
  totalPages,
  onFileChange,
  onImport,
  onSort,
  onPageSizeChange,
  onPageChange,
  onCertificar,
}: {
  periodoFiscalId: string;
  loading: boolean;
  pageSize: number;
  poaInfo: PoaInfo | null;
  selectedFile: File | null;
  importError: string;
  importResult: PoaImportResult | null;
  totalItems: number;
  actividadesPaginadas: ActividadPoa[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  currentPage: number;
  totalPages: number;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
  onSort: (key: SortKey) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
  onCertificar: (actividad: ActividadPoa, saldo: number) => void;
}) {
  return (
    <SectionCard
      title="Actividades POA"
      contentClassName="p-0"
      className="min-w-0"
    >
      {!periodoFiscalId ? (
        <EmptyState title="Seleccione un periodo fiscal para comenzar" />
      ) : loading ? (
        <TableSkeleton rows={Math.min(pageSize, 12)} columns={10} />
      ) : !poaInfo || poaInfo.totalActividades === 0 ? (
        <div className="p-8">
          <div className="text-center mb-6">
            <Layers size={40} className="mx-auto mb-3" />
            <p className="">Sin POA vigente</p>
            <p className="mt-1">
              Importe el archivo Excel POA DEFINITIVO para comenzar
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="app-dashed-upload">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="hidden"
                id="poa-file"
              />
              <label
                htmlFor="poa-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={24} className="mb-2" />
                <p className="text-center">
                  {selectedFile
                    ? selectedFile.name
                    : "Seleccione el archivo POA DEFINITIVO.xlsx"}
                </p>
              </label>
            </div>
            <div className="flex justify-end w-full max-w-sm">
              <a
                href="/api/v1/poa/plantilla"
                target="_blank"
                rel="noreferrer"
                download="plantilla-poa-definitivo.xlsx"
                className="hover:underline flex items-center gap-1"
              >
                <Download size={12} /> Descargar plantilla
              </a>
            </div>
            {selectedFile && (
              <Button onPress={onImport} className="app-button app-button-primary">
                Importar
              </Button>
            )}
          </div>
          {importError && <p className="text-center mt-3">{importError}</p>}
          {importResult && (
            <div className="app-status-message app-status-message-success justify-center">
              <CheckCircle size={16} className="inline mr-1" /> POA importado
              con {importResult.totalActividades} actividades
            </div>
          )}
        </div>
      ) : totalItems === 0 ? (
        <EmptyState title="No hay actividades que coincidan con los filtros" />
      ) : (
        <AppTable
          columns={poaColumns}
          minWidth={1436}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={(key) => onSort(key as SortKey)}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: pageSize,
            onItemsPerPageChange: onPageSizeChange,
            onPageChange,
          }}
        >
          {actividadesPaginadas.map((a) => {
            const saldo = Number(a.saldoDisponible);
            const pct =
              a.porcentajeDisponible ??
              (Number(a.montoPlanificado) > 0
                ? (saldo / Number(a.montoPlanificado)) * 100
                : 0);
            const isCritical =
              a.estado === "agotado" || a.estado === "critico" || pct < 10;
            const isLow = a.estado === "bajo" || pct < 30;
            const saldoClass = isCritical ? "" : isLow ? "" : "";
            const estadoLabel =
              saldo <= 0
                ? "Agotado"
                : a.estado === "ok" || pct > 30
                  ? "OK"
                  : isLow && !isCritical
                    ? "Bajo"
                    : "Crítico";
            const estadoTone =
              saldo <= 0
                ? "neutral"
                : isCritical
                  ? "danger"
                  : isLow
                    ? "warning"
                    : "success";
            return (
              <tr key={a.id}>
                <td>
                  <span className="app-table-primary">{a.programaCodigo}</span>
                  <p className="poa-text app-table-secondary">
                    {a.programaNombre}
                  </p>
                </td>
                <td>
                  <span className="app-table-primary">
                    {a.actividadCodigo}
                  </span>
                  <p className="poa-text app-table-secondary">
                    {a.actividadNombre}
                  </p>
                </td>
                <td>
                  <span className="app-table-primary">{a.itemCodigo}</span>
                  <p className="poa-text app-table-secondary">{a.itemNombre}</p>
                </td>
                <td>
                  <span className="app-table-primary">{a.fuenteCodigo}</span>
                  <p className="poa-text app-table-secondary">
                    {a.fuenteNombre}
                  </p>
                </td>
                <td className="poa-money text-center">
                  $
                  {Number(a.montoPlanificado).toLocaleString("es-EC", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="poa-money text-center">
                  $
                  {Number(a.certificadoVigente || 0).toLocaleString("es-EC", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="poa-money text-center">
                  $
                  {Number(a.bloqueadoSolicitudes || 0).toLocaleString(
                    "es-EC",
                    { minimumFractionDigits: 2 },
                  )}
                </td>
                <td className={`poa-money text-center ${saldoClass}`}>
                  $
                  {saldo.toLocaleString("es-EC", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="text-center">
                  <AppBadge tone={estadoTone}>{estadoLabel}</AppBadge>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="compact-control app-control-primary px-3"
                    disabled={saldo <= 0}
                    onClick={() => onCertificar(a, saldo)}
                  >
                    Cert.
                  </button>
                </td>
              </tr>
            );
          })}
        </AppTable>
      )}
    </SectionCard>
  );
}
