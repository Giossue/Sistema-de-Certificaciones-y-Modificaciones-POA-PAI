import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/use-auth";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { downloadResponseBlob } from "@/services/download";
import { ModificacionForm } from "./components/modificacion-form";
import { ModificacionesBandeja } from "./components/modificaciones-bandeja";
import {
  cargarPeriodosModificaciones,
  crearModificacionPoa,
  descargarInformeModificacionPoa,
  ejecutarAccionModificacionPoa,
  listarActividadesSaldo,
  listarModificacionesPoa,
  listarMotivosModificaciones,
} from "./services/modificaciones-poa-api";
import type {
  ActividadSaldo,
  Modificacion,
  ModificacionAccion,
  PeriodoFiscal,
} from "./types";

export function ModificacionesPoaPage() {
  const { user } = useAuth();
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
  const [responsableNuevoNombre, setResponsableNuevoNombre] = useState("");
  const [observacionBienes, setObservacionBienes] = useState("");
  const [tipoDiscrepancia, setTipoDiscrepancia] = useState("");
  const [montoPlanificadoNuevo, setMontoPlanificadoNuevo] = useState("");
  const [actividadSearch, setActividadSearch] = useState("");
  const [debouncedActividadSearch, setDebouncedActividadSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalModificaciones, setTotalModificaciones] = useState(0);
  const token = localStorage.getItem("poa_token");

  const actividad = useMemo(
    () => actividades.find((item) => item.actividadId === actividadId) || null,
    [actividades, actividadId],
  );

  const recargarModificaciones = useCallback(async () => {
    if (!token) return;
    const payload = await listarModificacionesPoa({
      page: currentPage,
      pageSize,
    });
    if (payload) {
      setModificaciones(payload.items);
      setTotalModificaciones(payload.totalItems);
    }
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    const cargarBase = async () => {
      if (!token) return;
      const [periodosData, motivosData] = await Promise.all([
        cargarPeriodosModificaciones(),
        listarMotivosModificaciones(),
      ]);
      const lista = periodosData || [];
      setPeriodos(lista);
      setPeriodoFiscalId((lista.find((p) => p.activo) || lista[0])?.id || "");
      if (motivosData) setMotivos(motivosData);
    };
    cargarBase();
  }, [token]);

  useEffect(() => {
    recargarModificaciones();
  }, [recargarModificaciones]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedActividadSearch(actividadSearch),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [actividadSearch]);

  useEffect(() => {
    const cargarActividades = async () => {
      if (!token || !periodoFiscalId) return;
      const data = await listarActividadesSaldo({
        periodoFiscalId,
        texto: debouncedActividadSearch,
      });
      if (data) setActividades(data);
    };
    cargarActividades();
  }, [debouncedActividadSearch, periodoFiscalId, token]);

  useEffect(() => {
    if (!actividad) return;
    setProgramaCodigo(actividad.programaCodigo);
    setActividadCodigo(actividad.actividadCodigo);
    setItemCodigo(actividad.itemCodigo);
    setMontoPlanificadoNuevo(Number(actividad.montoPlanificado).toFixed(2));
  }, [actividad]);

  const totalPages = Math.max(1, Math.ceil(totalModificaciones / pageSize));
  const userRole = user?.rol || "";
  const canCreate = ["admin", "unidad", "bienes"].includes(userRole);
  const canObserve = ["admin", "director", "analista"].includes(userRole);
  const canSubscribe = ["admin", "director"].includes(userRole);
  const canApprove = ["admin", "director", "analista"].includes(userRole);

  const enviar = async () => {
    if (!token || !actividad) return;
    setLoading(true);
    setMessage(null);
    try {
      const { res, data } = await crearModificacionPoa({
        actividadId,
        motivo,
        programaCodigo,
        actividadCodigo,
        itemCodigo,
        fuenteCodigo: actividad.fuenteCodigo,
        responsableNuevoNombre,
        observacionBienes,
        tipoDiscrepancia,
        montoPlanificadoNuevo,
      });
      if (!res.ok)
        throw new Error(data.error || "No se pudo solicitar la modificacion");
      setMessage({ type: "ok", text: "Modificación solicitada" });
      await recargarModificaciones();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const accion = async (id: string, tipo: ModificacionAccion) => {
    if (!token) return;
    const observaciones =
      tipo === "observar" ? window.prompt("Observacion") || "" : undefined;
    if (tipo === "observar" && !observaciones) return;
    const { res, data } = await ejecutarAccionModificacionPoa({
      id,
      tipo,
      observaciones,
    });
    if (!res.ok)
      setMessage({
        type: "error",
        text: data.error || "No se pudo ejecutar la accion",
      });
    else {
      setMessage({
        type: "ok",
        text:
          tipo === "aplicar"
            ? "Modificación aplicada y POA versionado"
            : "Estado actualizado",
      });
      await recargarModificaciones();
    }
  };

  const descargarInforme = async (id: string, numero: string) => {
    if (!token) return;
    const res = await descargarInformeModificacionPoa(id);
    if (!res.ok) return;
    await downloadResponseBlob(res, `informe-${numero}.pdf`);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Modificaciones POA"
        description="Solicitud, revision y versionamiento controlado del POA"
      />
      {message && (
        <InlineMessage tone={message.type === "ok" ? "success" : "danger"}>
          {message.text}
        </InlineMessage>
      )}
      <div className="space-y-6">
        {canCreate && (
          <ModificacionForm
            periodos={periodos}
            periodoFiscalId={periodoFiscalId}
            setPeriodoFiscalId={setPeriodoFiscalId}
            actividadSearch={actividadSearch}
            setActividadSearch={setActividadSearch}
            actividadId={actividadId}
            setActividadId={setActividadId}
            actividades={actividades}
            motivos={motivos}
            motivo={motivo}
            setMotivo={setMotivo}
            programaCodigo={programaCodigo}
            setProgramaCodigo={setProgramaCodigo}
            actividadCodigo={actividadCodigo}
            setActividadCodigo={setActividadCodigo}
            itemCodigo={itemCodigo}
            setItemCodigo={setItemCodigo}
            actividad={actividad}
            montoPlanificadoNuevo={montoPlanificadoNuevo}
            setMontoPlanificadoNuevo={setMontoPlanificadoNuevo}
            responsableNuevoNombre={responsableNuevoNombre}
            setResponsableNuevoNombre={setResponsableNuevoNombre}
            tipoDiscrepancia={tipoDiscrepancia}
            setTipoDiscrepancia={setTipoDiscrepancia}
            observacionBienes={observacionBienes}
            setObservacionBienes={setObservacionBienes}
            loading={loading}
            onEnviar={enviar}
          />
        )}
        <ModificacionesBandeja
          modificaciones={modificaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          totalModificaciones={totalModificaciones}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setPageSize}
          onDescargarInforme={descargarInforme}
          onAccion={accion}
          canSubscribe={canSubscribe}
          canApprove={canApprove}
          canObserve={canObserve}
        />
      </div>
    </div>
  );
}
