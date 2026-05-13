import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type { Anulacion, Certificacion, CrearAnulacionPayload } from "../types";

async function listarCertificacionesPorEstado(estado: string) {
  const searchParams = queryParams({ estado, page: 1, pageSize: 200 });
  const { res, data } = await requestJson(
    `/api/v1/certificaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  return res.ok ? ((data.data?.items || []) as Certificacion[]) : [];
}

export async function cargarCertificacionesAnulacion() {
  const [generadas, suscritas] = await Promise.all([
    listarCertificacionesPorEstado("generada"),
    listarCertificacionesPorEstado("suscrita"),
  ]);
  return [...generadas, ...suscritas];
}

export async function listarAnulaciones(params: {
  page: number;
  pageSize: number;
}) {
  const searchParams = queryParams({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { res, data } = await requestJson(
    `/api/v1/anulaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  const payload = data.data || {};
  return {
    items: (payload.items || []) as Anulacion[],
    totalItems: Number(payload.totalItems || 0),
  };
}

export async function crearAnulacion(payload: CrearAnulacionPayload) {
  return requestJson("/api/v1/anulaciones", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function aprobarAnulacion(id: string) {
  return requestJson(`/api/v1/anulaciones/${id}/aprobar`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function rechazarAnulacion(id: string, motivoRechazo: string) {
  return requestJson(`/api/v1/anulaciones/${id}/rechazar`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ motivoRechazo }),
  });
}
