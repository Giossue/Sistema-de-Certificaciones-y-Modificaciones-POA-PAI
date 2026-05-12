import { useState, useEffect } from "react";
import { Button, ProgressBar } from "@heroui/react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, Hash, User, ArrowUpRight, ArrowDownRight, Minus, Download } from "lucide-react";

interface ImportResult {
  versionId: string;
  totalFilas: number;
  filasValidas: number;
  filasIgnoradas: number;
  montoTotal: number;
  hashArchivo: string;
}

interface VersionCedula {
  id: string;
  archivoNombre: string;
  archivoHash: string;
  corteFecha: string;
  vigente: boolean;
  importadoPor: string;
  createdAt: string;
  totalEntradas: number;
}

interface DiffResult {
  versionAnteriorId: string | null;
  versionNuevaId: string;
  agregadas: DiffEntrada[];
  modificadas: DiffEntrada[];
  retiradas: DiffEntrada[];
  totalAgregadas: number;
  totalModificadas: number;
  totalRetiradas: number;
}

interface DiffEntrada {
  tipo: "agregada" | "modificada" | "retirada";
  clave: string;
  datosAnteriores?: Record<string, string>;
  datosNuevos?: Record<string, string>;
}

interface Programa {
  codigo: string;
  nombre: string;
}

interface Actividad {
  codigo: string;
  nombre: string;
  programaCodigo: string;
}

interface Item {
  codigo: string;
  nombre: string;
  programaCodigo: string;
  actividadCodigo: string;
}

interface Fuente {
  codigo: string;
  nombre: string;
  itemCodigo: string;
}

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

export function CedulaMefPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodosError, setPeriodosError] = useState("");
  const [versiones, setVersiones] = useState<VersionCedula[]>([]);
  const [loadingVersiones, setLoadingVersiones] = useState(false);
  const [tab, setTab] = useState("importar");
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [catalogos, setCatalogos] = useState<{
    programas: Programa[];
    actividades: Actividad[];
    items: Item[];
    fuentes: Fuente[];
  }>({ programas: [], actividades: [], items: [], fuentes: [] });
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const token = localStorage.getItem("poa_token");
        const res = await fetch("/api/v1/periodos-fiscales", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar los periodos fiscales");
        const lista: PeriodoFiscal[] = data || [];
        setPeriodos(lista);

        const savedPfi = localStorage.getItem("ultimo_periodo_fiscal_id");
        const savedIsValid = savedPfi && lista.some((periodo) => periodo.id === savedPfi);
        const activo = lista.find((periodo) => periodo.activo) || lista[0];
        if (savedIsValid) setPeriodoFiscalId(savedPfi);
        else if (activo) setPeriodoFiscalId(activo.id);
      } catch (err: any) {
        setPeriodosError(err.message || "No se pudieron cargar los periodos fiscales");
      }
    };

    cargarPeriodos();
  }, []);

  const seleccionarPeriodo = (id: string) => {
    setPeriodoFiscalId(id);
    setResult(null);
    setError("");
    setDiff(null);
    if (!id) {
      setVersiones([]);
      setCatalogos({ programas: [], actividades: [], items: [], fuentes: [] });
    }
  };

  useEffect(() => {
    if (periodoFiscalId) {
      localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
      cargarVersiones(periodoFiscalId);
      cargarVigente(periodoFiscalId);
    }
  }, [periodoFiscalId, result]);

  const cargarVersiones = async (pfi: string) => {
    setLoadingVersiones(true);
    try {
      const token = localStorage.getItem("poa_token");
      const res = await fetch(`/api/v1/cedula-mef/versiones/${pfi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVersiones(data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingVersiones(false);
    }
  };

  const cargarVigente = async (pfi: string) => {
    try {
      const token = localStorage.getItem("poa_token");
      const res = await fetch(`/api/v1/cedula-mef/vigente/${pfi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        // versionVigente is available if needed
      }
    } catch {
      // silent
    }
  };

  const cargarCatalogos = async (pfi: string) => {
    setLoadingCatalogos(true);
    try {
      const token = localStorage.getItem("poa_token");
      const [progRes, actRes, itemRes, fteRes] = await Promise.all([
        fetch(`/api/v1/cedula-mef/${pfi}/programas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/v1/cedula-mef/${pfi}/actividades`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/v1/cedula-mef/${pfi}/items`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/v1/cedula-mef/${pfi}/fuentes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [progData, actData, itemData, fteData] = await Promise.all([
        progRes.json(), actRes.json(), itemRes.json(), fteRes.json()
      ]);
      setCatalogos({
        programas: progData.data || [],
        actividades: actData.data || [],
        items: itemData.data || [],
        fuentes: fteData.data || [],
      });
    } catch {
      // silent
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarDiff = async (versionId: string) => {
    setLoadingDiff(true);
    try {
      const token = localStorage.getItem("poa_token");
      const res = await fetch(`/api/v1/cedula-mef/diff/${versionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDiff(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Formato invalido. Solo se acepta Excel (.xlsx, .xls)");
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!periodoFiscalId) {
      setError("Ingrese el ID del periodo fiscal");
      return;
    }

    const token = localStorage.getItem("poa_token");
    if (!token) {
      setError("No autenticado. Cerrar sesion y volver a login.");
      return;
    }

    setLoading(true);
    setProgress(10);
    setError("");

    try {
      const formData = new FormData();
      formData.append("archivo", selectedFile);
      formData.append("periodoFiscalId", periodoFiscalId);

      setProgress(30);

      const res = await fetch("/api/v1/cedula-mef/importar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al importar");
      }

      setProgress(100);
      setResult(data.data);
      cargarVersiones(periodoFiscalId);
      cargarVigente(periodoFiscalId);
      if (data.data?.versionId) {
        cargarDiff(data.data.versionId);
        setTab("diff");
      }
    } catch (err: any) {
      setError(err.message || "Error al importar cedula");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Formato invalido. Solo se acepta Excel (.xlsx, .xls)");
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-EC", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const totalCambios = diff ? diff.totalAgregadas + diff.totalModificadas + diff.totalRetiradas : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cedula Presupuestaria MEF</h1>
        <p className="text-sm text-slate-500 mt-1">
          Importa y gestiona las versiones de la cedula MEF desde ESIGEF
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline" onPress={() => setTab("importar")}>
          Importar
        </Button>
        <Button size="sm" variant="outline" onPress={() => { setTab("catalogos"); if (periodoFiscalId && !catalogos.programas.length) cargarCatalogos(periodoFiscalId); }}>
          Catalogos
        </Button>
        <Button size="sm" variant="outline" onPress={() => setTab("diff")} isDisabled={!diff}>
          Diferencias {diff ? `(${totalCambios})` : ""}
        </Button>
      </div>

      {tab === "importar" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Card */}
          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-primary/10">
                <FileSpreadsheet size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Importar desde Excel</h2>
                <p className="text-xs text-slate-500">Archivo ESIGEF</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Periodo fiscal</label>
                <select
                  value={periodoFiscalId}
                  onChange={(e) => seleccionarPeriodo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary transition-colors"
                >
                  <option value="">Seleccione un periodo</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.nombre} ({periodo.anio})
                    </option>
                  ))}
                </select>
                {periodosError && <p className="text-xs text-red-500 mt-1">{periodosError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Descarga la plantilla para ver el formato esperado</p>
                <a
                  href="/plantilla-cedula-mef.csv"
                  download="plantilla-cedula-mef.csv"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  Descargar plantilla CSV
                </a>
              </div>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded cursor-pointer transition-colors ${selectedFile ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary"}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                <div className="flex flex-col items-center justify-center py-8">
                  {selectedFile ? (
                    <div className="text-center">
                      <FileSpreadsheet size={32} className="text-primary mx-auto mb-2" />
                      <p className="font-medium text-slate-800">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-sm text-slate-500 hover:text-slate-700 mt-2">Cambiar archivo</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Arrastra el archivo o <span className="text-primary font-medium">selecciona</span></p>
                      <p className="text-xs text-slate-400 mt-1">.xlsx, .xls</p>
                    </div>
                  )}
                </div>
              </div>

              {loading && (
                <div className="space-y-1">
                  <ProgressBar value={progress} color="default" className="h-2" />
                  <p className="text-xs text-slate-500 text-center">Importando...</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {result && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3">
                    <CheckCircle size={16} /> <span>Importacion exitosa - {result.filasValidas} filas</span>
                  </div>
                  <div className="bg-slate-50 p-3 space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Hash size={12} /> Hash: {result.hashArchivo.slice(0, 16)}...</p>
                    <p className="text-xs text-slate-500">Version ID: {result.versionId.slice(0, 8)}...</p>
                  </div>
                </div>
              )}

              <Button onPress={handleUpload} isDisabled={!selectedFile || !periodoFiscalId || loading} className="w-full bg-primary text-white">
                {loading ? "Importando..." : "Importar cedula"}
              </Button>
            </div>
          </div>

          {/* Historial Card */}
          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-primary/10">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Historial de importaciones</h2>
                <p className="text-xs text-slate-500">Versiones anteriores</p>
              </div>
            </div>

            {!periodoFiscalId ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <FileSpreadsheet size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Seleccione un periodo fiscal para ver el historial</p>
                </div>
              </div>
            ) : loadingVersiones ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <p className="text-sm">Cargando...</p>
              </div>
            ) : versiones.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <FileSpreadsheet size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sin versiones importadas</p>
                  <p className="text-xs mt-1">Importe un archivo para ver el historial</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {versiones.map((v) => (
                  <div key={v.id} className={`p-3 border rounded ${v.vigente ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{v.archivoNombre}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Hash size={10} /> {v.archivoHash.slice(0, 8)}...</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><User size={10} /> {v.importadoPor}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock size={10} /> {formatearFecha(v.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {v.vigente && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Vigente</span>}
                        <span className="text-xs text-slate-400">{v.totalEntradas} filas</span>
                        <button onClick={() => { setDiff(null); cargarDiff(v.id); setTab("diff"); }} className="text-xs text-primary hover:underline">Ver diff</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "diff" && (
        <div className="bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-primary/10">
              <FileSpreadsheet size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Diferencias vs version anterior</h2>
              <p className="text-xs text-slate-500">Cambios entre la version anterior y la actual</p>
            </div>
          </div>

          {!diff ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <p className="text-sm">Seleccione una version desde el historial para ver sus diferencias</p>
            </div>
          ) : loadingDiff ? (
            <p className="text-center text-slate-400 py-8">Cargando...</p>
          ) : totalCambios === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
              <p>No hay cambios entre versiones</p>
              <p className="text-xs text-slate-400 mt-1">La version actual es identica a la anterior</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUpRight size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">Agregadas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{diff.totalAgregadas}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Minus size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Modificadas</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{diff.totalModificadas}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowDownRight size={16} className="text-red-600" />
                    <span className="text-sm font-medium text-red-700">Retiradas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{diff.totalRetiradas}</p>
                </div>
              </div>

              {/* Detalle */}
              {diff.agregadas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <ArrowUpRight size={14} /> Agregadas ({diff.totalAgregadas})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {diff.agregadas.map((e, i) => (
                      <div key={i} className="bg-green-50 border border-green-200 p-3 text-xs">
                        <span className="font-mono font-medium">{e.clave}</span>
                        {e.datosNuevos && (
                          <div className="mt-1 text-slate-600">
                            {e.datosNuevos.programaNombre} / {e.datosNuevos.actividadNombre} / {e.datosNuevos.itemNombre}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.modificadas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                    <Minus size={14} /> Modificadas ({diff.totalModificadas})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {diff.modificadas.map((e, i) => (
                      <div key={i} className="bg-yellow-50 border border-yellow-200 p-3 text-xs">
                        <span className="font-mono font-medium">{e.clave}</span>
                        {e.datosAnteriores && e.datosNuevos && (
                          <div className="mt-1 text-slate-600">
                            Monto anterior: {e.datosAnteriores.montoCodificado} - Nuevo: {e.datosNuevos.montoCodificado}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.retiradas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <ArrowDownRight size={14} /> Retiradas ({diff.totalRetiradas})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {diff.retiradas.map((e, i) => (
                      <div key={i} className="bg-red-50 border border-red-200 p-3 text-xs">
                        <span className="font-mono font-medium">{e.clave}</span>
                        {e.datosAnteriores && (
                          <div className="mt-1 text-slate-600">
                            {e.datosAnteriores.programaNombre} / {e.datosAnteriores.actividadNombre} / {e.datosAnteriores.itemNombre}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "catalogos" && (
        <div className="bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-primary/10">
              <FileSpreadsheet size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Catalogos de la cedula vigente</h2>
              <p className="text-xs text-slate-500">Programas, actividades, items y fuentes</p>
            </div>
          </div>

          {!periodoFiscalId ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Ingrese un periodo fiscal ID para ver los catalogos</p>
            </div>
          ) : loadingCatalogos ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Cargando catalogos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Programas ({catalogos.programas.length})</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {catalogos.programas.map((p) => (
                    <div key={p.codigo} className="p-2 bg-slate-50 border border-slate-200 text-xs rounded">
                      <span className="font-mono font-medium">{p.codigo}</span>
                      <p className="text-slate-600 truncate">{p.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Actividades ({catalogos.actividades.length})</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {catalogos.actividades.map((a) => (
                    <div key={a.codigo} className="p-2 bg-slate-50 border border-slate-200 text-xs rounded">
                      <span className="font-mono font-medium">{a.codigo}</span>
                      <p className="text-slate-600 truncate">{a.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Items ({catalogos.items.length})</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {catalogos.items.map((i) => (
                    <div key={i.codigo} className="p-2 bg-slate-50 border border-slate-200 text-xs rounded">
                      <span className="font-mono font-medium">{i.codigo}</span>
                      <p className="text-slate-600 truncate">{i.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Fuentes ({catalogos.fuentes.length})</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {catalogos.fuentes.map((f) => (
                    <div key={f.codigo} className="p-2 bg-slate-50 border border-slate-200 text-xs rounded">
                      <span className="font-mono font-medium">{f.codigo}</span>
                      <p className="text-slate-600 truncate">{f.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
