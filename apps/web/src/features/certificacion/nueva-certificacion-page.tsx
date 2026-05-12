import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { CheckCircle, AlertCircle, Search, DollarSign, Loader, FileText, Download, Send, PenLine, Eye } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
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

interface ItemPoa {
  codigo: string;
  nombre: string;
  programaCodigo: string;
  actividadCodigo: string;
}

interface FuentePoa {
  codigo: string;
  nombre: string;
  itemCodigo: string;
}

interface SaldoInfo {
  saldoDisponible: number;
  montoPlanificado: number;
}

interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
  conIva: boolean;
  observaciones: string | null;
  createdAt: string;
  actividad: {
    programaCodigo: string;
    programaNombre: string;
    actividadCodigo: string;
    actividadNombre: string;
    itemCodigo: string;
    itemNombre: string;
    fuenteCodigo: string;
    fuenteNombre: string;
    saldoDisponible: number;
  } | null;
  solicitante: { nombre: string; email: string };
  documentos: Array<{ id: string; tipo: string; nombreOriginal: string; mimeType: string }>;
}

const estadoLabels: Record<string, string> = {
  solicitada: "Solicitada",
  observada: "Observada",
  generada: "Generada",
  suscrita: "Suscrita",
  en_uso: "En uso",
  anulada: "Anulada",
};

const estadoClass: Record<string, string> = {
  solicitada: "bg-blue-50 text-blue-700 border-blue-200",
  observada: "bg-amber-50 text-amber-700 border-amber-200",
  generada: "bg-indigo-50 text-indigo-700 border-indigo-200",
  suscrita: "bg-green-50 text-green-700 border-green-200",
  en_uso: "bg-slate-50 text-slate-700 border-slate-200",
  anulada: "bg-red-50 text-red-700 border-red-200",
};

export function NuevaCertificacionPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"nueva" | "bandeja">("nueva");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedFuente, setSelectedFuente] = useState("");
  const [monto, setMonto] = useState("");
  const [conIva, setConIva] = useState(false);
  const [documentos, setDocumentos] = useState<File[]>([]);

  const [programas, setProgramas] = useState<Programa[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [items, setItems] = useState<ItemPoa[]>([]);
  const [fuentes, setFuentes] = useState<FuentePoa[]>([]);
  const [saldo, setSaldo] = useState<SaldoInfo | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);

  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("poa_token");

  useEffect(() => {
    const cargarPeriodos = async () => {
      const res = await fetch("/api/v1/periodos-fiscales", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return;
      const lista: PeriodoFiscal[] = data || [];
      setPeriodos(lista);
      const saved = localStorage.getItem("ultimo_periodo_fiscal_id");
      const activo = lista.find((periodo) => periodo.id === saved) || lista.find((periodo) => periodo.activo) || lista[0];
      if (activo) setPeriodoFiscalId(activo.id);
    };
    cargarPeriodos();
  }, [token]);

  useEffect(() => {
    const pref = localStorage.getItem("certificacion_prefill");
    if (!pref) return;
    try {
      const data = JSON.parse(pref);
      setPeriodoFiscalId(data.periodoFiscalId || "");
      setSelectedPrograma(data.programaCodigo || "");
      setSelectedActividad(data.actividadCodigo || "");
      setSelectedItem(data.itemCodigo || "");
      setSelectedFuente(data.fuenteCodigo || "");
      setSaldo({ saldoDisponible: data.saldoDisponible || 0, montoPlanificado: 0 });
      localStorage.removeItem("certificacion_prefill");
    } catch {
      localStorage.removeItem("certificacion_prefill");
    }
  }, []);

  const cargarCertificaciones = useCallback(async () => {
    setLoadingCerts(true);
    try {
      const res = await fetch("/api/v1/certificaciones", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCertificaciones(data.data || []);
    } finally {
      setLoadingCerts(false);
    }
  }, [token]);

  useEffect(() => {
    cargarCertificaciones();
  }, [cargarCertificaciones]);

  useEffect(() => {
    if (!periodoFiscalId) return;
    localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
    setLoadingCatalogos(true);
    fetch(`/api/v1/poa/${periodoFiscalId}/programas`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setProgramas(d.data || []))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, token]);

  useEffect(() => {
    setSelectedActividad("");
    setItems([]);
    setSelectedItem("");
    setFuentes([]);
    setSelectedFuente("");
    setSaldo(null);
    if (!periodoFiscalId || !selectedPrograma) return;
    setLoadingCatalogos(true);
    fetch(`/api/v1/poa/${periodoFiscalId}/actividades?programa=${encodeURIComponent(selectedPrograma)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setActividades(d.data || []))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedPrograma, token]);

  useEffect(() => {
    setSelectedItem("");
    setFuentes([]);
    setSelectedFuente("");
    setSaldo(null);
    if (!periodoFiscalId || !selectedPrograma || !selectedActividad) return;
    setLoadingCatalogos(true);
    fetch(`/api/v1/poa/${periodoFiscalId}/items?programa=${encodeURIComponent(selectedPrograma)}&actividad=${encodeURIComponent(selectedActividad)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setItems(d.data || []))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedPrograma, selectedActividad, token]);

  useEffect(() => {
    setSelectedFuente("");
    setSaldo(null);
    if (!periodoFiscalId || !selectedItem) return;
    setLoadingCatalogos(true);
    fetch(`/api/v1/poa/${periodoFiscalId}/fuentes?item=${encodeURIComponent(selectedItem)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setFuentes(d.data || []))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedItem, token]);

  const loadSaldo = useCallback(() => {
    if (!periodoFiscalId || !selectedPrograma || !selectedActividad || !selectedItem || !selectedFuente) return;
    setLoadingSaldo(true);
    fetch(
      `/api/v1/poa/${periodoFiscalId}/saldo?programa=${encodeURIComponent(selectedPrograma)}&actividad=${encodeURIComponent(selectedActividad)}&item=${encodeURIComponent(selectedItem)}&fuente=${encodeURIComponent(selectedFuente)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => r.json())
      .then((d) => setSaldo({
        saldoDisponible: Number(d.data?.saldoDisponible || 0),
        montoPlanificado: Number(d.data?.montoPlanificado || 0),
      }))
      .finally(() => setLoadingSaldo(false));
  }, [periodoFiscalId, selectedPrograma, selectedActividad, selectedItem, selectedFuente, token]);

  useEffect(() => {
    loadSaldo();
  }, [loadSaldo]);

  const montoNum = Number(monto);
  const puedeEnviar =
    periodoFiscalId &&
    selectedPrograma &&
    selectedActividad &&
    selectedItem &&
    selectedFuente &&
    documentos.length > 0 &&
    montoNum > 0 &&
    saldo &&
    montoNum <= saldo.saldoDisponible;

  const handleSubmit = async () => {
    if (!puedeEnviar) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("periodoFiscalId", periodoFiscalId);
      formData.append("programaCodigo", selectedPrograma);
      formData.append("actividadCodigo", selectedActividad);
      formData.append("itemCodigo", selectedItem);
      formData.append("fuenteCodigo", selectedFuente);
      formData.append("monto", Number(monto).toFixed(2));
      formData.append("conIva", String(conIva));
      documentos.forEach((documento) => formData.append("documentos", documento));

      const res = await fetch("/api/v1/certificaciones", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al solicitar certificación");
      setMessage({ type: "ok", text: "Certificación enviada al analista" });
      setSelectedPrograma("");
      setSelectedActividad("");
      setSelectedItem("");
      setSelectedFuente("");
      setMonto("");
      setConIva(false);
      setDocumentos([]);
      setSaldo(null);
      await cargarCertificaciones();
      setTab("bandeja");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const accion = async (id: string, tipo: "aprobar" | "suscribir" | "observar") => {
    let body: BodyInit | undefined;
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (tipo === "observar") {
      const observaciones = window.prompt("Motivo de la observación");
      if (!observaciones) return;
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ observaciones });
    }
    const res = await fetch(`/api/v1/certificaciones/${id}/${tipo}`, { method: "POST", headers, body });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "No se pudo ejecutar la acción" });
      return;
    }
    setMessage({ type: "ok", text: "Acción ejecutada correctamente" });
    await cargarCertificaciones();
  };

  const descargar = async (certificacionId: string, documentoId: string, nombre: string) => {
    const res = await fetch(`/api/v1/certificaciones/${certificacionId}/documentos/${documentoId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setMessage({ type: "error", text: "No se pudo descargar el documento" });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredActividades = selectedPrograma ? actividades.filter((a) => a.programaCodigo === selectedPrograma) : actividades;
  const filteredItems = selectedActividad ? items.filter((i) => i.actividadCodigo === selectedActividad) : items;
  const filteredFuentes = selectedItem ? fuentes.filter((f) => f.itemCodigo === selectedItem) : fuentes;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificaciones POA/PAI</h1>
          <p className="text-sm text-slate-500 mt-1">Solicitud, revisión, suscripción y documentos emitidos</p>
        </div>
        <div className="flex bg-white shadow-sm">
          <button onClick={() => setTab("nueva")} className={`px-4 py-2 text-sm ${tab === "nueva" ? "bg-primary text-white" : "text-slate-600"}`}>
            Nueva
          </button>
          <button onClick={() => setTab("bandeja")} className={`px-4 py-2 text-sm ${tab === "bandeja" ? "bg-primary text-white" : "text-slate-600"}`}>
            Bandeja
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 flex items-center gap-2 text-sm ${message.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {tab === "nueva" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
          <div className="bg-white shadow-sm p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Periodo fiscal</label>
                <select value={periodoFiscalId} onChange={(e) => setPeriodoFiscalId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary">
                  <option value="">Seleccione periodo</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>{periodo.nombre} ({periodo.anio})</option>
                  ))}
                </select>
              </div>

              <SelectField label="Programa" value={selectedPrograma} disabled={loadingCatalogos || programas.length === 0} onChange={setSelectedPrograma} items={programas} />
              <SelectField label="Actividad" value={selectedActividad} disabled={loadingCatalogos || !selectedPrograma || filteredActividades.length === 0} onChange={setSelectedActividad} items={filteredActividades} />
              <SelectField label="Ítem presupuestario" value={selectedItem} disabled={loadingCatalogos || !selectedActividad || filteredItems.length === 0} onChange={setSelectedItem} items={filteredItems} />
              <SelectField label="Fuente de financiamiento" value={selectedFuente} disabled={loadingCatalogos || !selectedItem || filteredFuentes.length === 0} onChange={setSelectedFuente} items={filteredFuentes} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto a certificar</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={conIva} onChange={(e) => setConIva(e.target.checked)} className="w-4 h-4 accent-primary" />
                El monto incluye IVA
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Documentos habilitantes</label>
                <input type="file" multiple onChange={(e) => setDocumentos(Array.from(e.target.files || []))} className="w-full text-sm" />
                <p className="text-xs text-slate-400 mt-1">{documentos.length} archivo(s) seleccionado(s)</p>
              </div>
            </div>

            <div className="mt-5">
              <Button onPress={handleSubmit} isDisabled={!puedeEnviar || submitting} className="bg-primary text-white">
                <Send size={16} />
                {submitting ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </div>

          <div className="bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Validación previa</h2>
            {loadingSaldo ? (
              <p className="text-sm text-slate-500 flex items-center gap-2"><Loader size={14} className="animate-spin" /> Consultando saldo...</p>
            ) : saldo ? (
              <div className={`p-4 border ${montoNum > saldo.saldoDisponible ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                <p className="text-xs text-slate-500 uppercase">Saldo disponible</p>
                <p className={`text-2xl font-bold ${montoNum > saldo.saldoDisponible ? "text-red-600" : "text-green-600"}`}>
                  ${saldo.saldoDisponible.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-500 mt-3">Planificado: ${saldo.montoPlanificado.toLocaleString("es-EC", { minimumFractionDigits: 2 })}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Seleccione programa, actividad, ítem y fuente.</p>
            )}
            <div className="mt-4 text-sm space-y-2">
              <CheckLine ok={Boolean(selectedFuente)} text="Estructura POA seleccionada" />
              <CheckLine ok={Boolean(saldo)} text="Saldo consultado" />
              <CheckLine ok={montoNum > 0 && (!saldo || montoNum <= saldo.saldoDisponible)} text="Monto dentro del saldo" />
              <CheckLine ok={documentos.length > 0} text="Adjuntos habilitantes" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm">
          {loadingCerts ? (
            <div className="p-12 text-center text-slate-400">Cargando certificaciones...</div>
          ) : certificaciones.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No hay certificaciones registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Número</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actividad</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Solicitante</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {certificaciones.map((cert) => (
                    <tr key={cert.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{cert.numero || "Pendiente"}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{cert.actividad?.actividadCodigo} - {cert.actividad?.actividadNombre}</p>
                        <p className="text-xs text-slate-500">{cert.actividad?.itemCodigo} / Fuente {cert.actividad?.fuenteCodigo}</p>
                        {cert.observaciones && <p className="text-xs text-amber-700 mt-1">Obs: {cert.observaciones}</p>}
                      </td>
                      <td className="px-4 py-3">{cert.solicitante?.nombre}</td>
                      <td className="px-4 py-3 text-right font-semibold">${cert.monto.toLocaleString("es-EC", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 border text-xs ${estadoClass[cert.estado] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                          {estadoLabels[cert.estado] || cert.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {["solicitada", "observada"].includes(cert.estado) && user?.rol !== "unidad" && (
                            <Button size="sm" className="bg-primary text-white" onPress={() => accion(cert.id, "aprobar")}>
                              <CheckCircle size={14} /> Aprobar
                            </Button>
                          )}
                          {cert.estado === "generada" && ["director", "admin"].includes(user?.rol || "") && (
                            <Button size="sm" className="bg-primary text-white" onPress={() => accion(cert.id, "suscribir")}>
                              <PenLine size={14} /> Suscribir
                            </Button>
                          )}
                          {["solicitada", "generada"].includes(cert.estado) && user?.rol !== "unidad" && (
                            <Button size="sm" variant="outline" onPress={() => accion(cert.id, "observar")}>
                              <Eye size={14} /> Observar
                            </Button>
                          )}
                          {cert.documentos.filter((doc) => doc.tipo !== "habilitante").map((doc) => (
                            <Button key={doc.id} size="sm" variant="outline" onPress={() => descargar(cert.id, doc.id, doc.nombreOriginal)}>
                              <Download size={14} /> PDF
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  disabled,
  onChange,
  items,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  items: Array<{ codigo: string; nombre: string }>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 text-sm outline-none focus:border-primary appearance-none bg-white pr-8 disabled:bg-slate-50"
        >
          <option value="">Seleccione...</option>
          {items.map((item) => (
            <option key={item.codigo} value={item.codigo}>{item.codigo} - {item.nombre}</option>
          ))}
        </select>
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function CheckLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-slate-400"}`}>
      {ok ? <CheckCircle size={14} /> : <FileText size={14} />}
      {text}
    </p>
  );
}
