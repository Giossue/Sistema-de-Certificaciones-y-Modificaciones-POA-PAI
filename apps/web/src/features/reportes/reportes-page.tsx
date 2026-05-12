import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { BarChart2, Download, Loader } from "lucide-react";

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

const money = (value: string | number) => Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ReportesPage() {
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [reporte, setReporte] = useState<any>(null);
  const [causas, setCausas] = useState<string[]>([]);
  const [causa, setCausa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("poa_token");

  const cargarReporte = async (periodoId = periodoFiscalId) => {
    if (!token || !periodoId) return;
    setLoading(true);
    const res = await fetch(`/api/v1/reportes/direccion/${periodoId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setReporte(data.data);
    setLoading(false);
  };

  useEffect(() => {
    const cargar = async () => {
      if (!token) return;
      const [periodosRes, causasRes] = await Promise.all([
        fetch("/api/v1/periodos-fiscales", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/devoluciones-financiero/causas", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const lista: PeriodoFiscal[] = await periodosRes.json();
      setPeriodos(lista || []);
      const activo = (lista || []).find((p) => p.activo) || lista?.[0];
      if (activo) {
        setPeriodoFiscalId(activo.id);
        cargarReporte(activo.id);
      }
      if (causasRes.ok) setCausas((await causasRes.json()).data || []);
    };
    cargar();
  }, []);

  const registrarDevolucion = async () => {
    if (!token) return;
    const res = await fetch("/api/v1/devoluciones-financiero", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ causa, descripcion }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "No se pudo registrar");
    else {
      setMessage("Devolucion registrada");
      setDescripcion("");
      await cargarReporte();
    }
  };

  const exportar = () => {
    if (!periodoFiscalId) return;
    window.open(`/api/v1/reportes/direccion/${periodoFiscalId}/export.xlsx`, "_blank");
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes y panel de Direccion</h1>
          <p className="text-sm text-slate-500 mt-1">Indicadores operativos, devoluciones y saldos bajos</p>
        </div>
        <div className="flex gap-2">
          <select value={periodoFiscalId} onChange={(e) => { setPeriodoFiscalId(e.target.value); cargarReporte(e.target.value); }} className="px-3 py-2 border border-slate-300 text-sm">
            {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.anio})</option>)}
          </select>
          <Button onPress={exportar} variant="outline"><Download size={16} /> XLSX</Button>
        </div>
      </div>
      {message && <div className="mb-4 bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">{message}</div>}
      {loading ? (
        <div className="p-10 text-center text-slate-400"><Loader size={20} className="animate-spin mx-auto mb-2" /> Cargando reporte</div>
      ) : reporte && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm p-4"><p className="text-xs text-slate-500 uppercase">Saldo disponible</p><p className="text-xl font-bold text-primary">${money(reporte.saldos.saldoDisponible)}</p></div>
            <div className="bg-white shadow-sm p-4"><p className="text-xs text-slate-500 uppercase">Certificado</p><p className="text-xl font-bold text-green-700">${money(reporte.saldos.certificadoVigente)}</p></div>
            <div className="bg-white shadow-sm p-4"><p className="text-xs text-slate-500 uppercase">Saldos bajos</p><p className="text-xl font-bold text-red-700">{reporte.saldos.actividadesBajo30 + reporte.saldos.actividadesBajo10}</p></div>
            <div className="bg-white shadow-sm p-4"><p className="text-xs text-slate-500 uppercase">Devoluciones</p><p className="text-xl font-bold text-slate-800">{reporte.devoluciones.total}</p></div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <div className="bg-white shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2"><BarChart2 size={18} /><h2 className="font-semibold text-slate-700">Causas principales</h2></div>
              <div className="divide-y divide-slate-100">
                {reporte.devoluciones.causas.map((item: any) => (
                  <div key={item.causa} className="p-4 flex items-center justify-between"><p className="text-sm text-slate-700">{item.causa}</p><p className="font-semibold">{item.total}</p></div>
                ))}
                {reporte.devoluciones.causas.length === 0 && <div className="p-10 text-center text-slate-400">Sin devoluciones registradas</div>}
              </div>
            </div>
            <div className="bg-white shadow-sm p-4 space-y-3">
              <h2 className="font-semibold text-slate-700">Registrar devolucion</h2>
              <select value={causa} onChange={(e) => setCausa(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm">
                <option value="">Seleccione causa</option>
                {causas.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripcion" className="w-full px-3 py-2 border border-slate-300 text-sm min-h-28" />
              <Button onPress={registrarDevolucion} isDisabled={!causa || !descripcion} className="w-full bg-primary text-white">Registrar</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
