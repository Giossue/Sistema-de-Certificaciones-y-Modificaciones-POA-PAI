import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type {
  ActividadSaldo,
  CrearModificacionPayload,
  Modificacion,
  ModificacionAccion,
  PeriodoFiscal,
} from "../types";

export async function cargarPeriodosModificaciones() {
  const { data } = await requestJson("/api/v1/periodos-fiscales", {
    headers: authHeaders(),
  });
  return (data || []) as PeriodoFiscal[];
}

export async function listarMotivosModificaciones() {
  const { res, data } = await requestJson("/api/v1/modificaciones-poa/motivos", {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return (data.data || []) as string[];
}

export async function listarModificacionesPoa(params: {
  page: number;
  pageSize: number;
}) {
  const searchParams = queryParams({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { res, data } = await requestJson(
    `/api/v1/modificaciones-poa?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  return {
    items: (data.data?.items || []) as Modificacion[],
    totalItems: Number(data.data?.totalItems || 0),
  };
}

export async function listarActividadesSaldo(params: {
  periodoFiscalId: string;
  texto: string;
}) {
  const searchParams = queryParams({ page: "1", pageSize: "200" });
  if (params.texto.trim()) searchParams.set("texto", params.texto.trim());

  const { res, data } = await requestJson(
    `/api/v1/saldos/${params.periodoFiscalId}/actividades?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  return (data.data?.items || []) as ActividadSaldo[];
}

export async function crearModificacionPoa(payload: CrearModificacionPayload) {
  return requestJson("/api/v1/modificaciones-poa", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function ejecutarAccionModificacionPoa(params: {
  id: string;
  tipo: ModificacionAccion;
  observaciones?: string;
}) {
  const body =
    params.tipo === "observar"
      ? JSON.stringify({ observaciones: params.observaciones || "" })
      : undefined;

  return requestJson(`/api/v1/modificaciones-poa/${params.id}/${params.tipo}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function descargarInformeModificacionPoa(id: string) {
  return fetch(`/api/v1/modificaciones-poa/${id}/informe`, {
    headers: authHeaders(),
  });
}
