import { ProgressBar } from "@heroui/react";
import type { ChangeEvent, DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Hash,
  Upload,
} from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import type { ImportResult, PeriodoFiscal, VersionCedula } from "../types";

export function CedulaImportPanel({
  selectedPeriodo,
  periodoFiscalId,
  periodos,
  periodosError,
  selectedFile,
  loading,
  progress,
  error,
  result,
  vigenteVersion,
  onPeriodoChange,
  onFileSelect,
  onDragOver,
  onDrop,
  onUpload,
  onClearFile,
  formatearFecha,
}: {
  selectedPeriodo?: PeriodoFiscal;
  periodoFiscalId: string;
  periodos: PeriodoFiscal[];
  periodosError: string;
  selectedFile: File | null;
  loading: boolean;
  progress: number;
  error: string;
  result: ImportResult | null;
  vigenteVersion?: VersionCedula;
  onPeriodoChange: (id: string) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onUpload: () => void;
  onClearFile: () => void;
  formatearFecha: (fecha: string) => string;
}) {
  return (
    <SectionCard
      title="Carga de cédula MEF"
      description={
        selectedPeriodo
          ? `Periodo activo: ${selectedPeriodo.nombre}`
          : "Seleccione periodo para cargar o consultar la cédula"
      }
      contentClassName="p-0"
    >
      <div className="space-y-4 p-4">
        <div className="max-w-3xl space-y-4">
          <label className="block max-w-md">
            <span className="mb-1.5 block">Periodo</span>
            <select
              value={periodoFiscalId}
              onChange={(e) => onPeriodoChange(e.target.value)}
              className="app-field-input"
            >
              <option value="">Seleccione un periodo</option>
              {periodos.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} ({periodo.anio})
                </option>
              ))}
            </select>
          </label>
          {periodosError && <p className="">{periodosError}</p>}
          <div className="app-info-panel">
            <div className="flex items-center justify-between gap-3">
              <p className="app-table-primary">Versión vigente</p>
              {vigenteVersion?.vigente && (
                <span className="app-badge app-badge-success">Vigente</span>
              )}
            </div>
            {vigenteVersion ? (
              <div className="mt-3 space-y-2">
                <InfoRow label="Archivo" value={vigenteVersion.archivoNombre} />
                <InfoRow
                  label="Entradas"
                  value={vigenteVersion.totalEntradas.toLocaleString("es-EC")}
                />
                <InfoRow
                  label="Última carga"
                  value={formatearFecha(vigenteVersion.createdAt)}
                />
                <InfoRow
                  label="Hash"
                  value={`${vigenteVersion.archivoHash.slice(0, 12)}...`}
                  mono
                />
              </div>
            ) : (
              <p className="app-table-secondary mt-6 text-center">
                Sin versión vigente para el periodo seleccionado
              </p>
            )}
          </div>
          <div
            className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-100 ${selectedFile ? "border-slate-400 bg-slate-100" : ""}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <>
                <FileSpreadsheet size={24} className="mb-2 text-slate-600" />
                <p className="app-table-primary max-w-full truncate">
                  {selectedFile.name}
                </p>
                <p className="app-table-secondary mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearFile();
                  }}
                  className="app-button app-button-secondary app-button-sm mt-3"
                >
                  Quitar archivo
                </button>
              </>
            ) : (
              <>
                <Upload size={24} className="mb-2 text-slate-600" />
                <p className="app-table-primary">Seleccionar archivo ESIGEF</p>
                <p className="app-table-secondary mt-1">
                  Arrastre o seleccione un archivo .xlsx o .xls
                </p>
                <a
                  href="/plantilla-cedula-mef.csv"
                  download="plantilla-cedula-mef.csv"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Descargar plantilla CSV
                </a>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onUpload}
            disabled={!selectedFile || !periodoFiscalId || loading}
            className="app-button app-button-primary w-full sm:w-auto"
          >
            {loading ? "Importando..." : "Importar cédula"}
          </button>
        </div>
        <p className="app-table-secondary max-w-3xl">
          La cédula vigente será obligatoria para certificar o modificar. Use
          una nueva carga solo cuando exista corte MEF actualizado.
        </p>
      </div>
      <div className="app-form-footer">
        {loading && (
          <div className="space-y-1">
            <ProgressBar value={progress} color="default" className="h-2" />
            <p className="text-center">Importando...</p>
          </div>
        )}
        {error && (
          <div className="app-status-message app-status-message-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {result && (
          <div className="space-y-2">
            <div className="app-status-message app-status-message-success">
              <CheckCircle size={16} />
              <span>
                Importación exitosa -
                {result.filasValidas.toLocaleString("es-EC")} filas válidas
              </span>
            </div>
            <div className="app-panel-muted space-y-1 p-3">
              <p className="flex items-center gap-1">
                <Hash size={12} /> Hash: {result.hashArchivo.slice(0, 16)}
                ...
              </p>
              <p className="">Version ID: {result.versionId.slice(0, 8)}...</p>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="app-info-row">
      <span className="app-info-label">{label}</span>
      <span className={`truncate ${mono ? "font-mono" : ""}`} title={value}>
        {value}
      </span>
    </div>
  );
}
