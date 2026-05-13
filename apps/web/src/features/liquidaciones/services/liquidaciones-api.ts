import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type {
  Certificacion,
  CrearLiquidacionPayload,
  Liquidacion,
} from "../types";

async function listarCertificacionesPorEstado(estado: string) {
  const searchParams = queryParams({ estado, page: 1, pageSize: 200 });
  const { res, data } = await requestJson(
    `/api/v1/certificaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  return res.ok ? ((data.data?.items || []) as Certificacion[]) : [];
}

export async function cargarCertificacionesLiquidacion() {
  const [suscritas, enUso] = await Promise.all([
    listarCertificacionesPorEstado("suscrita"),
    listarCertificacionesPorEstado("en_uso"),
  ]);
  return [...suscritas, ...enUso];
}

export async function listarLiquidaciones(params: {
  page: number;
  pageSize: number;
}) {
  const searchParams = queryParams({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { res, data } = await requestJson(
    `/api/v1/liquidaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  const payload = data.data || {};
  return {
    items: (payload.items || []) as Liquidacion[],
    totalItems: Number(payload.totalItems || 0),
  };
}

export async function crearLiquidacion(payload: CrearLiquidacionPayload) {
  return requestJson("/api/v1/liquidaciones", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function aprobarLiquidacion(id: string) {
  return requestJson(`/api/v1/liquidaciones/${id}/aprobar`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function rechazarLiquidacion(
  id: string,
  motivoRechazo: string,
) {
  return requestJson(`/api/v1/liquidaciones/${id}/rechazar`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ motivoRechazo }),
  });
}
