import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Ban, Loader } from "lucide-react";

interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
}

const money = (value: string | number) => Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AnulacionesPage() {
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [anulaciones, setAnulaciones] = useState<any[]>([]);
  const [certificacionId, setCertificacionId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("poa_token");

  const cargar = async () => {
    if (!token) return;
    const [certsRes, anulRes] = await Promise.all([
      fetch("/api/v1/certificaciones", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/v1/anulaciones", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (certsRes.ok) setCertificaciones(((await certsRes.json()).data || []).filter((c: Certificacion) => ["generada", "suscrita"].includes(c.estado)));
    if (anulRes.ok) setAnulaciones((await anulRes.json()).data || []);
  };

  useEffect(() => { cargar(); }, []);

  const enviar = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/v1/anulaciones", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ certificacionId, motivo }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setMessage(data.error || "No se pudo anular");
    else {
      setMessage("Certificacion anulada");
      setMotivo("");
      await cargar();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Anulaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Cancelacion de certificaciones sin uso</p>
      </div>
      {message && <div className="mb-4 bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">{message}</div>}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="bg-white shadow-sm p-4 space-y-3">
          <h2 className="text-base font-semibold text-slate-700">Nueva anulacion</h2>
          <select value={certificacionId} onChange={(e) => setCertificacionId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm">
            <option value="">Seleccione certificacion</option>
            {certificaciones.map((c) => <option key={c.id} value={c.id}>{c.numero} - ${money(c.monto)}</option>)}
          </select>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo obligatorio" className="w-full px-3 py-2 border border-slate-300 text-sm min-h-24" />
          <Button onPress={enviar} isDisabled={!certificacionId || !motivo || loading} className="w-full bg-primary text-white">
            {loading ? <Loader size={16} className="animate-spin" /> : <Ban size={16} />}
            Anular certificacion
          </Button>
        </div>
        <div className="bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100"><h2 className="text-base font-semibold text-slate-700">Historial</h2></div>
          <div className="divide-y divide-slate-100">
            {anulaciones.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.certificacion?.numero}</p>
                  <p className="text-xs text-slate-500">{a.motivo}</p>
                </div>
                <p className="font-semibold text-slate-800">${money(a.montoLiberado)}</p>
              </div>
            ))}
            {anulaciones.length === 0 && <div className="p-10 text-center text-slate-400">Sin anulaciones</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
