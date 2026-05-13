import { ProgressBar } from "@heroui/react";
import type { ChangeEvent, DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle,
  Download,
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
      title="Panel MEF"
      description={
        selectedPeriodo
          ? `Periodo activo: ${selectedPeriodo.nombre}`
          : "Seleccione periodo para cargar o consultar la cédula"
      }
      actions={
        <a
          href="/plantilla-cedula-mef.csv"
          download="plantilla-cedula-mef.csv"
          className="app-button app-button-secondary"
        >
          <Download size={12} /> Plantilla CSV
        </a>
      }
      contentClassName="p-0"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
        <div className="space-y-3 p-4">
          <div className="grid gap-3 xl:grid-cols-[260px_minmax(360px,1fr)_auto] xl:items-end">
            <label className="flex flex-col gap-1.5">
              Periodo
              <select
                value={periodoFiscalId}
                onChange={(e) => onPeriodoChange(e.target.value)}
                className="h-8 w-full px-2"
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
            <div
              className={`app-upload-target ${selectedFile ? "is-active" : ""}`}
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
              <div className="flex h-10 items-center gap-3 px-3">
                {selectedFile ? (
                  <>
                    <FileSpreadsheet size={18} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="app-upload-title truncate">
                        {selectedFile.name}
                      </p>
                      <p className="">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearFile();
                      }}
                      className="filter-clear-button app-filter-clear"
                    >
                      Quitar
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="app-upload-title truncate">
                        Seleccionar archivo ESIGEF
                      </p>
                      <p className="">
                        Arrastre o seleccione un archivo .xlsx o .xls
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onUpload}
              disabled={!selectedFile || !periodoFiscalId || loading}
              className="app-button app-button-primary w-full xl:w-auto"
            >
              {loading ? "Importando..." : "Importar cédula"}
            </button>
          </div>
          <p className="">
            La cédula vigente será obligatoria para certificar o modificar. Use
            una nueva carga solo cuando exista corte MEF actualizado.
          </p>
        </div>
        <div className="app-info-panel lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <p className="">Versión vigente</p>
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
            <p className="mt-6 text-center">
              Sin versión vigente para el periodo seleccionado
            </p>
          )}
        </div>
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
