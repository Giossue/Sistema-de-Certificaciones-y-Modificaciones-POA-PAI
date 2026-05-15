import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/use-auth";
import { downloadResponseBlob } from "@/services/download";
import {
  cargarPeriodosModificaciones,
  crearModificacionPoa,
  descargarInformeModificacionPoa,
  editarModificacionObservada,
  ejecutarAccionModificacionPoa,
  listarActividadesSaldo,
  listarModificacionesPoa,
  listarMotivosModificaciones,
} from "./services/modificaciones-poa-api";
import type {
  ActividadSaldo,
  EditarModificacionObservadaPayload,
  Modificacion,
  ModificacionAccion,
  PeriodoFiscal,
} from "./types";

const emptyEditForm: EditarModificacionObservadaPayload = {
  motivo: "",
  programaCodigo: "",
  actividadCodigo: "",
  itemCodigo: "",
  fuenteCodigo: "",
  responsableNuevoNombre: "",
  observacionBienes: "",
  tipoDiscrepancia: "",
  montoPlanificadoNuevo: "",
  justificacion: "",
};

export function useModificacionesPoaPage() {
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
  const [observacionDialog, setObservacionDialog] = useState<{
    id: string;
    tipo: ModificacionAccion;
  } | null>(null);
  const [observacionTexto, setObservacionTexto] = useState("");
  const [edicionDialog, setEdicionDialog] = useState<Modificacion | null>(
    null,
  );
  const [edicionForm, setEdicionForm] =
    useState<EditarModificacionObservadaPayload>(emptyEditForm);
  const [edicionLoading, setEdicionLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionEnCursoId, setAccionEnCursoId] = useState<string | null>(null);
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

  const ejecutarAccion = async (
    id: string,
    tipo: ModificacionAccion,
    observaciones?: string,
  ) => {
    if (!token || accionLoading) return false;
    setAccionLoading(true);
    setAccionEnCursoId(id);
    try {
      const { res, data } = await ejecutarAccionModificacionPoa({
        id,
        tipo,
        observaciones,
      });
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "No se pudo ejecutar la accion",
        });
        return false;
      }
      setMessage({
        type: "ok",
        text:
          tipo === "aplicar"
            ? "Modificación aplicada y POA versionado"
            : tipo === "reenviar"
              ? "Modificación reenviada"
            : "Estado actualizado",
      });
      await recargarModificaciones();
      return true;
    } finally {
      setAccionLoading(false);
      setAccionEnCursoId(null);
    }
  };

  const accion = async (id: string, tipo: ModificacionAccion) => {
    if (!token) return false;
    if (tipo === "observar" || tipo === "reenviar") {
      setObservacionTexto("");
      setObservacionDialog({ id, tipo });
      return false;
    }
    return ejecutarAccion(id, tipo);
  };

  const confirmarObservacion = async () => {
    if (!observacionDialog) return;
    const ok = await ejecutarAccion(
      observacionDialog.id,
      observacionDialog.tipo,
      observacionTexto,
    );
    if (ok) setObservacionDialog(null);
  };

  const cerrarObservacion = () => {
    if (!accionLoading) setObservacionDialog(null);
  };

  const abrirEdicion = (modificacion: Modificacion) => {
    setEdicionDialog(modificacion);
    setEdicionForm({
      motivo: modificacion.motivo || "",
      programaCodigo: modificacion.nuevo.programaCodigo || "",
      actividadCodigo: modificacion.nuevo.actividadCodigo || "",
      itemCodigo: modificacion.nuevo.itemCodigo || "",
      fuenteCodigo: modificacion.nuevo.fuenteCodigo || "",
      responsableNuevoNombre: modificacion.nuevo.responsableNombre || "",
      observacionBienes: modificacion.observacionBienes || "",
      tipoDiscrepancia: modificacion.tipoDiscrepancia || "",
      montoPlanificadoNuevo: Number(
        modificacion.nuevo.montoPlanificado || 0,
      ).toFixed(2),
      justificacion: "",
    });
  };

  const actualizarEdicionForm = (
    field: keyof EditarModificacionObservadaPayload,
    value: string,
  ) => {
    setEdicionForm((current) => ({ ...current, [field]: value }));
  };

  const cerrarEdicion = () => {
    if (!edicionLoading) setEdicionDialog(null);
  };

  const guardarEdicion = async () => {
    if (!token || !edicionDialog || edicionLoading) return false;
    setEdicionLoading(true);
    setAccionEnCursoId(edicionDialog.id);
    try {
      const { res, data } = await editarModificacionObservada(
        edicionDialog.id,
        edicionForm,
      );
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "No se pudo editar la modificación observada",
        });
        return false;
      }
      setMessage({
        type: "ok",
        text: "Modificación observada actualizada",
      });
      await recargarModificaciones();
      setEdicionDialog(null);
      return true;
    } finally {
      setEdicionLoading(false);
      setAccionEnCursoId(null);
    }
  };

  const descargarInforme = async (id: string, numero: string) => {
    if (!token) return;
    const res = await descargarInformeModificacionPoa(id);
    if (!res.ok) return;
    await downloadResponseBlob(res, `informe-${numero}.pdf`);
  };

  return {
    accion,
    accionEnCursoId,
    accionLoading,
    actividad,
    actividadId,
    actividadSearch,
    actividades,
    actividadCodigo,
    canApprove,
    canCreate,
    canObserve,
    canSubscribe,
    cerrarObservacion,
    cerrarEdicion,
    confirmarObservacion,
    currentPage,
    descargarInforme,
    abrirEdicion,
    actualizarEdicionForm,
    edicionDialog,
    edicionForm,
    edicionLoading,
    enviar,
    guardarEdicion,
    itemCodigo,
    loading,
    message,
    modificaciones,
    montoPlanificadoNuevo,
    motivo,
    motivos,
    observacionBienes,
    observacionDialog,
    observacionTexto,
    pageSize,
    periodoFiscalId,
    periodos,
    programaCodigo,
    responsableNuevoNombre,
    setActividadCodigo,
    setActividadId,
    setActividadSearch,
    setCurrentPage,
    setItemCodigo,
    setMontoPlanificadoNuevo,
    setMotivo,
    setObservacionBienes,
    setObservacionTexto,
    setPageSize,
    setPeriodoFiscalId,
    setProgramaCodigo,
    setResponsableNuevoNombre,
    setTipoDiscrepancia,
    tipoDiscrepancia,
    totalModificaciones,
    totalPages,
  };
}
