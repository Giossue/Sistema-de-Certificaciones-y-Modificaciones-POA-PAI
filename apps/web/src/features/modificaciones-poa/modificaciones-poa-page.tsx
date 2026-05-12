import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { CheckCircle, FileText, GitBranch, Loader } from "lucide-react";

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

interface ActividadSaldo {
  actividadId: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoPlanificado: string;
  saldoDisponible: string;
}

interface Modificacion {
  id: string;
  numero: string;
  estado: string;
  motivo: string;
  anterior: {
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
    montoPlanificado: number;
  };
  nuevo: {
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
    montoPlanificado: number;
  };
}

const estados: Record<string, string> = {
  solicitada: "Solicitada",
  observada: "Observada",
  suscrita: "Suscrita",
  aplicada: "Aplicada",
  rechazada: "Rechazada",
};

const money = (value: string | number) =>
  Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ModificacionesPoaPage() {
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [actividades, setActividades] = useState<ActividadSaldo[]>([]);
  const [modificaciones, setModificaciones] = useState<Modificacion[]>([]);
  const [motivos, setMotivos] = useState<string[]>([]);
  const [actividadId, setActividadId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [programaCodigo, setProgramaCodigo] = useState("");
  const [actividadCodigo, setActividadCodigo] = useState("");
  const [itemCodigo, setItemCodigo] = useState("");
  const [montoPlanificadoNuevo, setMontoPlanificadoNuevo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("poa_token");
  const actividad = useMemo(
    () => actividades.find((item) => item.actividadId === actividadId) || null,
    [actividades, actividadId]
  );

  useEffect(() => {
    const cargarBase = async () => {
      if (!token) return;
      const [periodosRes, motivosRes, modsRes] = await Promise.all([
        fetch("/api/v1/periodos-fiscales", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/modificaciones-poa/motivos", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/modificaciones-poa", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const periodosData = await periodosRes.json();
      const lista: PeriodoFiscal[] = periodosData || [];
      setPeriodos(lista);
      setPeriodoFiscalId((lista.find((p) => p.activo) || lista[0])?.id || "");
      if (motivosRes.ok) setMotivos((await motivosRes.json()).data || []);
      if (modsRes.ok) setModificaciones((await modsRes.json()).data || []);
    };
    cargarBase();
  }, [token]);

  useEffect(() => {
    const cargarActividades = async () => {
      if (!token || !periodoFiscalId) return;
      const res = await fetch(`/api/v1/saldos/${periodoFiscalId}/actividades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setActividades(data.data || []);
    };
    cargarActividades();
  }, [periodoFiscalId, token]);

  useEffect(() => {
    if (!actividad) return;
    setProgramaCodigo(actividad.programaCodigo);
    setActividadCodigo(actividad.actividadCodigo);
    setItemCodigo(actividad.itemCodigo);
    setMontoPlanificadoNuevo(Number(actividad.montoPlanificado).toFixed(2));
  }, [actividad]);

  const recargarModificaciones = async () => {
    if (!token) return;
    const res = await fetch("/api/v1/modificaciones-poa", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setModificaciones(data.data || []);
  };

  const enviar = async () => {
    if (!token || !actividad) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/modificaciones-poa", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          actividadId,
          motivo,
          programaCodigo,
          actividadCodigo,
          itemCodigo,
          fuenteCodigo: actividad.fuenteCodigo,
          montoPlanificadoNuevo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo solicitar la modificacion");
      setMessage({ type: "ok", text: "Modificacion solicitada" });
      await recargarModificaciones();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const accion = async (id: string, tipo: "suscribir" | "aprobar" | "observar") => {
    if (!token) return;
    const body = tipo === "observar" ? JSON.stringify({ observaciones: window.prompt("Observacion") || "" }) : undefined;
    if (tipo === "observar" && body === JSON.stringify({ observaciones: "" })) return;
    const res = await fetch(`/api/v1/modificaciones-poa/${id}/${tipo}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    if (!res.ok) setMessage({ type: "error", text: data.error || "No se pudo ejecutar la accion" });
    else {
      setMessage({ type: "ok", text: tipo === "aprobar" ? "Modificacion aplicada y POA versionado" : "Estado actualizado" });
      await recargarModificaciones();
    }
  };

  const descargarInforme = async (id: string, numero: string) => {
    if (!token) return;
    const res = await fetch(`/api/v1/modificaciones-poa/${id}/informe`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `informe-${numero}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Modificaciones POA</h1>
        <p className="text-sm text-slate-500 mt-1">Solicitud, revision y versionamiento controlado del POA</p>
      </div>

      {message && (
        <div className={`mb-4 p-3 text-sm ${message.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="bg-white shadow-sm p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Nueva solicitud</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-slate-500">Periodo</span>
              <select value={periodoFiscalId} onChange={(e) => setPeriodoFiscalId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 text-sm">
                {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.anio})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Actividad origen</span>
              <select value={actividadId} onChange={(e) => setActividadId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 text-sm">
                <option value="">Seleccione actividad</option>
                {actividades.map((a) => (
                  <option key={a.actividadId} value={a.actividadId}>
                    {a.programaCodigo}/{a.actividadCodigo}/{a.itemCodigo}/{a.fuenteCodigo} - ${money(a.saldoDisponible)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Motivo</span>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 text-sm">
                <option value="">Seleccione motivo</option>
                {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input value={programaCodigo} onChange={(e) => setProgramaCodigo(e.target.value)} placeholder="Programa" className="px-3 py-2 border border-slate-300 text-sm" />
              <input value={actividadCodigo} onChange={(e) => setActividadCodigo(e.target.value)} placeholder="Actividad" className="px-3 py-2 border border-slate-300 text-sm" />
              <input value={itemCodigo} onChange={(e) => setItemCodigo(e.target.value)} placeholder="Item" className="px-3 py-2 border border-slate-300 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={actividad?.fuenteCodigo || ""} disabled className="px-3 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-500" />
              <input value={montoPlanificadoNuevo} onChange={(e) => setMontoPlanificadoNuevo(e.target.value)} placeholder="Monto nuevo" className="px-3 py-2 border border-slate-300 text-sm" />
            </div>
            {actividad && (
              <div className="bg-slate-50 p-3 text-xs text-slate-600">
                <p>Fuente bloqueada: {actividad.fuenteCodigo} - {actividad.fuenteNombre}</p>
                <p>Planificado actual: ${money(actividad.montoPlanificado)}</p>
              </div>
            )}
            <Button onPress={enviar} isDisabled={!actividad || !motivo || loading} className="w-full bg-primary text-white">
              {loading ? <Loader size={16} className="animate-spin" /> : <GitBranch size={16} />}
              Solicitar modificacion
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">Bandeja</h2>
          </div>
          {modificaciones.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Sin modificaciones registradas</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {modificaciones.map((mod) => (
                <div key={mod.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{mod.numero}</p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5">{estados[mod.estado] || mod.estado}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{mod.motivo}</p>
                    <p className="text-sm text-slate-700 mt-2">
                      {mod.anterior.programaCodigo}/{mod.anterior.actividadCodigo}/{mod.anterior.itemCodigo} {"->"} {mod.nuevo.programaCodigo}/{mod.nuevo.actividadCodigo}/{mod.nuevo.itemCodigo}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Monto: ${money(mod.anterior.montoPlanificado)} {"->"} ${money(mod.nuevo.montoPlanificado)}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onPress={() => descargarInforme(mod.id, mod.numero)}>
                      <FileText size={14} /> Informe
                    </Button>
                    {["solicitada", "observada"].includes(mod.estado) && (
                      <Button size="sm" className="bg-primary text-white" onPress={() => accion(mod.id, "suscribir")}>Suscribir</Button>
                    )}
                    {mod.estado === "suscrita" && (
                      <Button size="sm" className="bg-green-700 text-white" onPress={() => accion(mod.id, "aprobar")}>
                        <CheckCircle size={14} /> Aprobar
                      </Button>
                    )}
                    {mod.estado === "solicitada" && (
                      <Button size="sm" variant="outline" onPress={() => accion(mod.id, "observar")}>Observar</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
