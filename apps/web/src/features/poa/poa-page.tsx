import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { Search, CheckCircle, Upload, Layers, Loader, Download } from "lucide-react";

interface ActividadPoa {
  id: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoPlanificado: number;
  saldoDisponible: number;
  certificadoVigente?: number;
  bloqueadoSolicitudes?: number;
  porcentajeDisponible?: number;
  estado?: "ok" | "bajo" | "critico" | "agotado";
}

interface PoaInfo {
  id: string;
  numeroVersion: number;
  totalActividades: number;
  montoTotal: number;
}

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

type Filtro = {
  texto: string;
  programa: string;
  actividad: string;
  item: string;
  fuente: string;
  verSoloConSaldo: boolean;
};

export function PoaPage() {
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodosError, setPeriodosError] = useState("");
  const [poaInfo, setPoaInfo] = useState<PoaInfo | null>(null);
  const [actividades, setActividades] = useState<ActividadPoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");

  const [filtro, setFiltro] = useState<Filtro>({
    texto: "",
    programa: "",
    actividad: "",
    item: "",
    fuente: "",
    verSoloConSaldo: false,
  });

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

        const saved = localStorage.getItem("ultimo_periodo_fiscal_id");
        const savedIsValid = saved && lista.some((periodo) => periodo.id === saved);
        const activo = lista.find((periodo) => periodo.activo) || lista[0];
        if (savedIsValid) setPeriodoFiscalId(saved);
        else if (activo) setPeriodoFiscalId(activo.id);
      } catch (err: any) {
        setPeriodosError(err.message || "No se pudieron cargar los periodos fiscales");
      }
    };

    cargarPeriodos();
  }, []);

  const cargarPoa = useCallback(async (pfi: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("poa_token");
      const res = await fetch(`/api/v1/poa/vigente/${pfi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setActividades([]); setPoaInfo(null); setLoading(false); return; }
      const data = await res.json();
      if (!data.data) { setActividades([]); setPoaInfo(null); setLoading(false); return; }

      const poa = data.data;
      let acts: ActividadPoa[] = poa.actividades || [];
      const saldosRes = await fetch(`/api/v1/saldos/${pfi}/actividades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (saldosRes.ok) {
        const saldosData = await saldosRes.json();
        acts = (saldosData.data || []).map((item: any) => ({
          id: item.actividadId,
          programaCodigo: item.programaCodigo,
          programaNombre: item.programaNombre,
          actividadCodigo: item.actividadCodigo,
          actividadNombre: item.actividadNombre,
          itemCodigo: item.itemCodigo,
          itemNombre: item.itemNombre,
          fuenteCodigo: item.fuenteCodigo,
          fuenteNombre: item.fuenteNombre,
          montoPlanificado: Number(item.montoPlanificado),
          saldoDisponible: Number(item.saldoDisponible),
          certificadoVigente: Number(item.certificadoVigente),
          bloqueadoSolicitudes: Number(item.bloqueadoSolicitudes),
          porcentajeDisponible: Number(item.porcentajeDisponible),
          estado: item.estado,
        }));
      }
      setActividades(acts);
      setPoaInfo({
        id: poa.id,
        numeroVersion: poa.numeroVersion,
        totalActividades: acts.length,
        montoTotal: acts.reduce((s: number, a: ActividadPoa) => s + Number(a.montoPlanificado), 0),
      });
    } catch {
      setActividades([]);
      setPoaInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (periodoFiscalId) {
      localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
      cargarPoa(periodoFiscalId);
    }
  }, [periodoFiscalId, cargarPoa]);

  const handleImport = async () => {
    if (!selectedFile || !periodoFiscalId) return;
    const token = localStorage.getItem("poa_token");
    if (!token) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("archivo", selectedFile);
      formData.append("periodoFiscalId", periodoFiscalId);
      const res = await fetch("/api/v1/poa/importar-poa-base", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");
      setImportResult(data.data);
      cargarPoa(periodoFiscalId);
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar actividades
  const filtradas = actividades.filter((a) => {
    if (filtro.programa && a.programaCodigo !== filtro.programa) return false;
    if (filtro.actividad && a.actividadCodigo !== filtro.actividad) return false;
    if (filtro.item && a.itemCodigo !== filtro.item) return false;
    if (filtro.fuente && a.fuenteCodigo !== filtro.fuente) return false;
    if (filtro.verSoloConSaldo && Number(a.saldoDisponible) <= 0) return false;
    if (filtro.texto) {
      const t = filtro.texto.toLowerCase();
      const match = [
        a.programaCodigo, a.programaNombre,
        a.actividadCodigo, a.actividadNombre,
        a.itemCodigo, a.itemNombre,
        a.fuenteCodigo, a.fuenteNombre,
      ].some((v) => v?.toLowerCase().includes(t));
      if (!match) return false;
    }
    return true;
  });

  // Programas únicos para dropdowns
  const programas = [...new Map(actividades.map((a) => [a.programaCodigo, { codigo: a.programaCodigo, nombre: a.programaNombre }])).values()];
  const actividadesUnicas = [...new Map(actividades.map((a) => [a.actividadCodigo, { codigo: a.actividadCodigo, nombre: a.actividadNombre }])).values()];
  const itemsUnicos = [...new Map(actividades.map((a) => [a.itemCodigo, { codigo: a.itemCodigo, nombre: a.itemNombre }])).values()];
  const fuentesUnicas = [...new Map(actividades.map((a) => [a.fuenteCodigo, { codigo: a.fuenteCodigo, nombre: a.fuenteNombre }])).values()];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">POA — Plan Operativo Anual</h1>
        <p className="text-sm text-slate-500 mt-1">
          Busque actividades, consulte saldos y solicite certificaciones
        </p>
      </div>

      <div className="bg-white shadow-sm p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Periodo fiscal</label>
        <select
          value={periodoFiscalId}
          onChange={(e) => {
            setPeriodoFiscalId(e.target.value);
            setImportError("");
            setImportResult(null);
          }}
          className="w-full md:max-w-sm px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
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

      {/* Stats bar */}
      {poaInfo && (
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Versión</p>
            <p className="text-xl font-bold text-primary">{poaInfo.numeroVersion}</p>
          </div>
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Actividades</p>
            <p className="text-xl font-bold text-primary">{poaInfo.totalActividades.toLocaleString()}</p>
          </div>
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Monto Total</p>
            <p className="text-xl font-bold text-primary">${poaInfo.montoTotal.toLocaleString("es-EC", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Con Saldo</p>
            <p className="text-xl font-bold text-green-600">
              {actividades.filter((a) => Number(a.saldoDisponible) > 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Buscar</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <input
              type="text"
              value={filtro.texto}
              onChange={(e) => setFiltro((f) => ({ ...f, texto: e.target.value }))}
              placeholder="Buscar en todo..."
              className="w-full px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={filtro.programa}
            onChange={(e) => setFiltro((f) => ({ ...f, programa: e.target.value, actividad: "", item: "", fuente: "" }))}
            className="px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos los programas</option>
            {programas.map((p) => <option key={p.codigo} value={p.codigo}>{p.codigo} — {p.nombre}</option>)}
          </select>
          <select
            value={filtro.actividad}
            onChange={(e) => setFiltro((f) => ({ ...f, actividad: e.target.value, item: "", fuente: "" }))}
            className="px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
          >
            <option value="">Todas las actividades</option>
            {actividadesUnicas.map((a) => <option key={a.codigo} value={a.codigo}>{a.codigo} — {a.nombre}</option>)}
          </select>
          <select
            value={filtro.item}
            onChange={(e) => setFiltro((f) => ({ ...f, item: e.target.value, fuente: "" }))}
            className="px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos los ítems</option>
            {itemsUnicos.map((i) => <option key={i.codigo} value={i.codigo}>{i.codigo} — {i.nombre}</option>)}
          </select>
          <select
            value={filtro.fuente}
            onChange={(e) => setFiltro((f) => ({ ...f, fuente: e.target.value }))}
            className="px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
          >
            <option value="">Todas las fuentes</option>
            {fuentesUnicas.map((f) => <option key={f.codigo} value={f.codigo}>{f.codigo} — {f.nombre}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filtro.verSoloConSaldo}
              onChange={(e) => setFiltro((f) => ({ ...f, verSoloConSaldo: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            Solo con saldo disponible
          </label>
          {(filtro.texto || filtro.programa || filtro.actividad || filtro.item || filtro.fuente || filtro.verSoloConSaldo) && (
            <button
              onClick={() => setFiltro({ texto: "", programa: "", actividad: "", item: "", fuente: "", verSoloConSaldo: false })}
              className="text-xs text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
          <span className="text-xs text-slate-500 ml-auto">
            {filtradas.length} de {actividades.length} actividades
          </span>
        </div>
      </div>

      {/* Tabla de actividades */}
      <div className="bg-white shadow-sm">
        {!periodoFiscalId ? (
          <div className="p-12 text-center text-slate-400">
            <Layers size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Seleccione un periodo fiscal para comenzar</p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader size={20} className="animate-spin" />
            <span>Cargando actividades...</span>
          </div>
        ) : !poaInfo ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <Layers size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 font-medium">Sin POA vigente</p>
              <p className="text-xs text-slate-400 mt-1">Importe el archivo Excel POA DEFINITIVO para comenzar</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded p-6 max-w-sm w-full">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="poa-file"
                />
                <label htmlFor="poa-file" className="cursor-pointer flex flex-col items-center">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 text-center">
                    {selectedFile ? selectedFile.name : "Seleccione el archivo POA DEFINITIVO.xlsx"}
                  </p>
                </label>
              </div>
              <div className="flex justify-end w-full max-w-sm">
                <a
                  href="/api/v1/poa/plantilla"
                  target="_blank"
                  rel="noreferrer"
                  download="plantilla-poa-definitivo.xlsx"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  Descargar plantilla
                </a>
              </div>
              {selectedFile && (
                <Button onPress={handleImport} className="bg-primary text-white">
                  Importar
                </Button>
              )}
            </div>
            {importError && <p className="text-red-600 text-sm text-center mt-3">{importError}</p>}
            {importResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                <CheckCircle size={16} className="inline mr-1" />
                POA importado con {importResult.totalActividades} actividades
              </div>
            )}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No hay actividades que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Prog.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actividad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ítem</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fuente</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Planificado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Certificado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Bloqueado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Saldo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((a, idx) => {
                  const saldo = Number(a.saldoDisponible);
                  const pct = a.porcentajeDisponible ?? (Number(a.montoPlanificado) > 0 ? (saldo / Number(a.montoPlanificado)) * 100 : 0);
                  let color = "text-green-600";
                  if (a.estado === "agotado" || a.estado === "critico" || pct < 10) color = "text-red-600";
                  else if (a.estado === "bajo" || pct < 30) color = "text-yellow-600";
                  return (
                    <tr key={a.id} className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-xs">{a.programaCodigo}</span>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">{a.programaNombre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{a.actividadCodigo}</span>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{a.actividadNombre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{a.itemCodigo}</span>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{a.itemNombre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{a.fuenteCodigo}</span>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">{a.fuenteNombre}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        ${Number(a.montoPlanificado).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        ${Number(a.certificadoVigente || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-700">
                        ${Number(a.bloqueadoSolicitudes || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${color}`}>
                        ${saldo.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {saldo > 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {a.estado === "ok" || pct > 30 ? "OK" : a.estado === "bajo" || pct > 10 ? "Bajo" : "Crítico"}
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Agotado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          className="bg-primary text-white text-xs"
                          isDisabled={saldo <= 0}
                          onPress={() => {
                            localStorage.setItem("certificacion_prefill", JSON.stringify({
                              periodoFiscalId,
                              programaCodigo: a.programaCodigo,
                              actividadCodigo: a.actividadCodigo,
                              itemCodigo: a.itemCodigo,
                              fuenteCodigo: a.fuenteCodigo,
                              saldoDisponible: saldo,
                            }));
                            window.location.href = "/certificaciones";
                          }}
                        >
                          Certificar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
