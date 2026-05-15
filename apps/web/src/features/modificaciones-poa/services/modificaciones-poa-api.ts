import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type {
  ActividadSaldo,
  CrearModificacionPayload,
  EditarModificacionObservadaPayload,
  Modificacion,
  ModificacionAccion,
  PeriodoFiscal,
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

export async function cargarPeriodosModificaciones() {
  return api.get<PeriodoFiscal[]>("/api/v1/periodos-fiscales");
}

export async function listarMotivosModificaciones() {
  try {
    const data = await api.get<ApiData<string[]>>(
      "/api/v1/modificaciones-poa/motivos",
    );
    return data.data || [];
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export async function listarModificacionesPoa(params: {
  page: number;
  pageSize: number;
}) {
  const searchParams = queryParams({
    page: params.page,
    pageSize: params.pageSize,
  });
  let data: ApiData<{ items?: Modificacion[]; totalItems?: number }>;
  try {
    data = await api.get(
      `/api/v1/modificaciones-poa?${searchParams.toString()}`,
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
  return {
    items: data.data?.items || [],
    totalItems: Number(data.data?.totalItems || 0),
  };
}

export async function listarActividadesSaldo(params: {
  periodoFiscalId: string;
  texto: string;
}) {
  const searchParams = queryParams({ page: "1", pageSize: "200" });
  if (params.texto.trim()) searchParams.set("texto", params.texto.trim());

  try {
    const data = await api.get<ApiData<{ items?: ActividadSaldo[] }>>(
      `/api/v1/saldos/${params.periodoFiscalId}/actividades?${searchParams.toString()}`,
    );
    return data.data?.items || [];
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export async function crearModificacionPoa(payload: CrearModificacionPayload) {
  return compatAction(api.post("/api/v1/modificaciones-poa", payload));
}

export async function editarModificacionObservada(
  id: string,
  payload: EditarModificacionObservadaPayload,
) {
  return compatAction(api.patch(`/api/v1/modificaciones-poa/${id}`, payload));
}

export async function ejecutarAccionModificacionPoa(params: {
  id: string;
  tipo: ModificacionAccion;
  observaciones?: string;
}) {
  const endpointByAction: Record<ModificacionAccion, string> = {
    observar: `/api/v1/modificaciones-poa/${params.id}/observar`,
    reenviar: `/api/v1/modificaciones-poa/${params.id}/reenviar`,
    suscribir: `/api/v1/modificaciones-poa/${params.id}/suscribir`,
    aprobar: `/api/v1/modificaciones-poa/${params.id}/aprobar`,
    aplicar: `/api/v1/modificaciones-poa/${params.id}/aplicar`,
  };

  if (params.tipo === "observar" || params.tipo === "reenviar") {
    return compatAction(
      api.post(endpointByAction[params.tipo], {
        observaciones: params.observaciones || "",
      }),
    );
  }

  if (params.tipo === "suscribir") {
    return compatAction(api.post(endpointByAction.suscribir));
  }

  if (params.tipo === "aprobar") {
    return compatAction(api.post(endpointByAction.aprobar));
  }

  return compatAction(api.post(endpointByAction.aplicar));
}

export async function descargarInformeModificacionPoa(id: string) {
  return api.raw(`/api/v1/modificaciones-poa/${id}/informe`);
}
