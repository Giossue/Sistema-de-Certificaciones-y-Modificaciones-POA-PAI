import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { DollarSign, Loader } from "lucide-react";

interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
  actividad?: { itemCodigo: string; itemNombre: string } | null;
}

const money = (value: string | number) => Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function LiquidacionesPage() {
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<any[]>([]);
  const [certificacionId, setCertificacionId] = useState("");
  const [tipo, setTipo] = useState("total");
  const [modo, setModo] = useState("A");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("poa_token");

  const cargar = async () => {
    if (!token) return;
    const [certsRes, liqsRes] = await Promise.all([
      fetch("/api/v1/certificaciones", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/v1/liquidaciones", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (certsRes.ok) setCertificaciones(((await certsRes.json()).data || []).filter((c: Certificacion) => ["suscrita", "en_uso"].includes(c.estado)));
    if (liqsRes.ok) setLiquidaciones((await liqsRes.json()).data || []);
  };

  useEffect(() => { cargar(); }, []);

  const enviar = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/v1/liquidaciones", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ certificacionId, tipo, modo, monto, motivo }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setMessage(data.error || "No se pudo liquidar");
    else {
      setMessage("Liquidacion registrada");
      setMonto("");
      setMotivo("");
      await cargar();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Liquidaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Liberacion total o parcial de certificaciones</p>
      </div>
      {message && <div className="mb-4 bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">{message}</div>}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="bg-white shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-slate-700">Nueva liquidacion</h2>
          <select value={certificacionId} onChange={(e) => setCertificacionId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm">
            <option value="">Seleccione certificacion</option>
            {certificaciones.map((c) => <option key={c.id} value={c.id}>{c.numero} - ${money(c.monto)}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 border border-slate-300 text-sm">
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
            </select>
            <select value={modo} onChange={(e) => setModo(e.target.value)} className="px-3 py-2 border border-slate-300 text-sm">
              <option value="A">Modo A</option>
              <option value="B">Modo B</option>
            </select>
          </div>
          <input value={monto} onChange={(e) => setMonto(e.target.value)} disabled={tipo === "total"} placeholder="Monto parcial" className="w-full px-3 py-2 border border-slate-300 text-sm disabled:bg-slate-50" />
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo" className="w-full px-3 py-2 border border-slate-300 text-sm" />
          <Button onPress={enviar} isDisabled={!certificacionId || loading} className="w-full bg-primary text-white">
            {loading ? <Loader size={16} className="animate-spin" /> : <DollarSign size={16} />}
            Registrar liquidacion
          </Button>
        </div>
        <div className="bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100"><h2 className="text-base font-semibold text-slate-700">Historial</h2></div>
          <div className="divide-y divide-slate-100">
            {liquidaciones.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.certificacion?.numero}</p>
                  <p className="text-xs text-slate-500">{l.tipo} · modo {l.modo}</p>
                </div>
                <p className="font-semibold text-slate-800">${money(l.monto)}</p>
              </div>
            ))}
            {liquidaciones.length === 0 && <div className="p-10 text-center text-slate-400">Sin liquidaciones</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
