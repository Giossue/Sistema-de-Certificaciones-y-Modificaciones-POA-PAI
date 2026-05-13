import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { downloadResponseBlob } from "@/services/download";
import { CertificacionesBandeja } from "./components/certificaciones-bandeja";
import { NuevaCertificacionForm } from "./components/nueva-certificacion-form";
import {
  cargarActividadesPoa,
  cargarFuentesPoa,
  cargarItemsPoa,
  cargarPeriodosCertificacion,
  cargarProgramasPoa,
  consultarSaldoPoa,
  crearCertificacion,
  descargarDocumentoCertificacion,
  ejecutarAccionCertificacion,
  listarCertificaciones,
} from "./services/certificaciones-api";
import type {
  Actividad,
  Certificacion,
  CertificacionAccion,
  CertificacionTab,
  FuentePoa,
  ItemPoa,
  PeriodoFiscal,
  Programa,
  SaldoInfo,
  TipoCertificacion,
} from "./types";

export function NuevaCertificacionPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<CertificacionTab>("nueva");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedFuente, setSelectedFuente] = useState("");
  const [tipoCertificacion, setTipoCertificacion] =
    useState<TipoCertificacion>("POA");
  const [monto, setMonto] = useState("");
  const [conIva, setConIva] = useState(false);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [items, setItems] = useState<ItemPoa[]>([]);
  const [fuentes, setFuentes] = useState<FuentePoa[]>([]);
  const [saldo, setSaldo] = useState<SaldoInfo | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [totalCertificaciones, setTotalCertificaciones] = useState(0);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const token = localStorage.getItem("poa_token");

  useEffect(() => {
    const cargarPeriodos = async () => {
      const response = await cargarPeriodosCertificacion();
      if (!response.ok) return;
      const lista = response.data;
      setPeriodos(lista);
      const saved = localStorage.getItem("ultimo_periodo_fiscal_id");
      const activo =
        lista.find((periodo) => periodo.id === saved) ||
        lista.find((periodo) => periodo.activo) ||
        lista[0];
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
      setSaldo({
        saldoDisponible: data.saldoDisponible || 0,
        montoPlanificado: 0,
      });
      localStorage.removeItem("certificacion_prefill");
    } catch {
      localStorage.removeItem("certificacion_prefill");
    }
  }, []);

  const cargarCertificacionesPaginadas = useCallback(async () => {
    setLoadingCerts(true);
    try {
      const payload = await listarCertificaciones({
        page: currentPage,
        pageSize,
      });
      if (payload) {
        setCertificaciones(payload.items);
        setTotalCertificaciones(payload.totalItems);
      }
    } finally {
      setLoadingCerts(false);
    }
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    cargarCertificacionesPaginadas();
  }, [cargarCertificacionesPaginadas]);

  useEffect(() => {
    if (!periodoFiscalId) return;
    localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
    setLoadingCatalogos(true);
    cargarProgramasPoa(periodoFiscalId)
      .then((items) => setProgramas(items))
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
    cargarActividadesPoa(periodoFiscalId, selectedPrograma)
      .then((items) => setActividades(items))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedPrograma, token]);

  useEffect(() => {
    setSelectedItem("");
    setFuentes([]);
    setSelectedFuente("");
    setSaldo(null);
    if (!periodoFiscalId || !selectedPrograma || !selectedActividad) return;
    setLoadingCatalogos(true);
    cargarItemsPoa(periodoFiscalId, selectedPrograma, selectedActividad)
      .then((items) => setItems(items))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedPrograma, selectedActividad, token]);

  useEffect(() => {
    setSelectedFuente("");
    setSaldo(null);
    if (!periodoFiscalId || !selectedItem) return;
    setLoadingCatalogos(true);
    cargarFuentesPoa(periodoFiscalId, selectedItem)
      .then((items) => setFuentes(items))
      .finally(() => setLoadingCatalogos(false));
  }, [periodoFiscalId, selectedItem, token]);

  const loadSaldo = useCallback(() => {
    if (
      !periodoFiscalId ||
      !selectedPrograma ||
      !selectedActividad ||
      !selectedItem ||
      !selectedFuente
    )
      return;
    setLoadingSaldo(true);
    consultarSaldoPoa({
      periodoFiscalId,
      programaCodigo: selectedPrograma,
      actividadCodigo: selectedActividad,
      itemCodigo: selectedItem,
      fuenteCodigo: selectedFuente,
    })
      .then((data) => setSaldo(data))
      .finally(() => setLoadingSaldo(false));
  }, [
    periodoFiscalId,
    selectedPrograma,
    selectedActividad,
    selectedItem,
    selectedFuente,
    token,
  ]);

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
      const { res, data } = await crearCertificacion({
        periodoFiscalId,
        programaCodigo: selectedPrograma,
        actividadCodigo: selectedActividad,
        itemCodigo: selectedItem,
        fuenteCodigo: selectedFuente,
        tipo: tipoCertificacion,
        monto,
        conIva,
        documentos,
      });
      if (!res.ok)
        throw new Error(data.error || "Error al solicitar certificación");
      setMessage({ type: "ok", text: "Certificación enviada al analista" });
      setSelectedPrograma("");
      setSelectedActividad("");
      setSelectedItem("");
      setSelectedFuente("");
      setMonto("");
      setConIva(false);
      setDocumentos([]);
      setSaldo(null);
      await cargarCertificacionesPaginadas();
      setTab("bandeja");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const accion = async (id: string, tipo: CertificacionAccion) => {
    let observaciones: string | undefined;
    if (tipo === "observar") {
      observaciones = window.prompt("Motivo de la observación") || undefined;
      if (!observaciones) return;
    }
    const { res, data } = await ejecutarAccionCertificacion({
      id,
      tipo,
      observaciones,
    });
    if (!res.ok) {
      setMessage({
        type: "error",
        text: data.error || "No se pudo ejecutar la acción",
      });
      return;
    }
    setMessage({ type: "ok", text: "Acción ejecutada correctamente" });
    await cargarCertificacionesPaginadas();
  };

  const descargar = async (
    certificacionId: string,
    documentoId: string,
    nombre: string,
  ) => {
    const res = await descargarDocumentoCertificacion(
      certificacionId,
      documentoId,
    );
    if (!res.ok) {
      setMessage({ type: "error", text: "No se pudo descargar el documento" });
      return;
    }
    await downloadResponseBlob(res, nombre);
  };

  const filteredActividades = selectedPrograma
    ? actividades.filter((a) => a.programaCodigo === selectedPrograma)
    : actividades;
  const filteredItems = selectedActividad
    ? items.filter((i) => i.actividadCodigo === selectedActividad)
    : items;
  const filteredFuentes = selectedItem
    ? fuentes.filter((f) => f.itemCodigo === selectedItem)
    : fuentes;
  const userRole = user?.rol || "";
  const canCreate = ["admin", "unidad"].includes(userRole);
  const canApprove = ["admin", "analista"].includes(userRole);
  const canObserve = ["admin", "director", "analista"].includes(userRole);
  const canSubscribe = ["admin", "director"].includes(userRole);
  const canUse = ["admin", "financiero"].includes(userRole);
  const activeTab = canCreate ? tab : "bandeja";
  const totalPages = Math.max(1, Math.ceil(totalCertificaciones / pageSize));

  return (
    <div className="p-6">
      <PageHeader
        title="Certificaciones POA/PAI"
        description="Solicitud, revisión, suscripción y documentos emitidos"
        actions={
          <div className="section-card flex">
            {canCreate && (
              <button
                onClick={() => setTab("nueva")}
                className={`px-4 py-2 ${activeTab === "nueva" ? "bg-primary" : ""}`}
              >
                Nueva
              </button>
            )}
            <button
              onClick={() => setTab("bandeja")}
              className={`px-4 py-2 ${activeTab === "bandeja" ? "bg-primary" : ""}`}
            >
              Bandeja
            </button>
          </div>
        }
      />
      {message && (
        <InlineMessage tone={message.type === "ok" ? "success" : "danger"}>
          <div className="flex items-center gap-2">
            {message.type === "ok" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </div>
        </InlineMessage>
      )}
      {activeTab === "nueva" ? (
        <NuevaCertificacionForm
          tipoCertificacion={tipoCertificacion}
          setTipoCertificacion={setTipoCertificacion}
          periodoFiscalId={periodoFiscalId}
          setPeriodoFiscalId={setPeriodoFiscalId}
          periodos={periodos}
          selectedPrograma={selectedPrograma}
          setSelectedPrograma={setSelectedPrograma}
          selectedActividad={selectedActividad}
          setSelectedActividad={setSelectedActividad}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          selectedFuente={selectedFuente}
          setSelectedFuente={setSelectedFuente}
          loadingCatalogos={loadingCatalogos}
          programas={programas}
          filteredActividades={filteredActividades}
          filteredItems={filteredItems}
          filteredFuentes={filteredFuentes}
          monto={monto}
          setMonto={setMonto}
          conIva={conIva}
          setConIva={setConIva}
          documentos={documentos}
          setDocumentos={setDocumentos}
          submitting={submitting}
          puedeEnviar={puedeEnviar}
          onSubmit={handleSubmit}
          loadingSaldo={loadingSaldo}
          saldo={saldo}
          montoNum={montoNum}
        />
      ) : (
        <CertificacionesBandeja
          loadingCerts={loadingCerts}
          certificaciones={certificaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCertificaciones={totalCertificaciones}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setPageSize}
          onAccion={accion}
          onDescargar={descargar}
          canApprove={canApprove}
          canObserve={canObserve}
          canSubscribe={canSubscribe}
          canUse={canUse}
          canCreate={canCreate}
        />
      )}
    </div>
  );
}
