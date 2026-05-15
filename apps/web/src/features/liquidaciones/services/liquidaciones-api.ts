import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type {
  Certificacion,
  CrearLiquidacionPayload,
  Liquidacion,
} from "../types";

type ApiData<T> = { data?: T };
type ApiActionResponse<T = any> = {
  res: Response;
  data: T;
  ok: boolean;
  status: number;
};

async function compatAction(request: Promise<unknown>): Promise<ApiActionResponse> {
  try {
    const data = await request;
    const res = new Response(null, { status: 200 });
    return { res, data, ok: true, status: res.status };
  } catch (error) {
    if (error instanceof ApiError) {
      const res = new Response(null, { status: error.status });
      return {
        res,
        data: error.data,
        ok: false,
        status: error.status,
      };
    }
    throw error;
  }
}

async function listarCertificacionesPorEstado(estado: string) {
  const searchParams = queryParams({ estado, page: 1, pageSize: 200 });
  try {
    const data = await api.get<ApiData<{ items?: Certificacion[] }>>(
      `/api/v1/certificaciones?${searchParams.toString()}`,
    );
    return data.data?.items || [];
  } catch (error) {
    if (error instanceof ApiError) return [];
    throw error;
  }
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
  let data: ApiData<{ items?: Liquidacion[]; totalItems?: number }>;
  try {
    data = await api.get(`/api/v1/liquidaciones?${searchParams.toString()}`);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
  const payload = data.data || {};
  return {
    items: payload.items || [],
    totalItems: Number(payload.totalItems || 0),
  };
}

export async function crearLiquidacion(payload: CrearLiquidacionPayload) {
  return compatAction(api.post("/api/v1/liquidaciones", payload));
}

export async function aprobarLiquidacion(id: string) {
  return compatAction(api.post(`/api/v1/liquidaciones/${id}/aprobar`));
}

export async function rechazarLiquidacion(
  id: string,
  motivoRechazo: string,
) {
  return compatAction(
    api.post(`/api/v1/liquidaciones/${id}/rechazar`, { motivoRechazo }),
  );
}
