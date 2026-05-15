import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type {
  Actividad,
  Certificacion,
  CertificacionAccion,
  FuentePoa,
  ItemPoa,
  PeriodoFiscal,
  Programa,
  SaldoInfo,
  TipoCertificacion,
} from "../types";

type ApiData<T> = { data?: T; error?: string };
type ApiActionResponse<T = any> = {
  res: Response;
  data: T;
  ok: boolean;
  status: number;
};

async function compatRequest<T>(
  request: Promise<T>,
): Promise<ApiActionResponse<T>> {
  try {
    const data = await request;
    const res = new Response(null, { status: 200 });
    return { res, data, ok: true, status: res.status };
  } catch (error) {
    if (error instanceof ApiError) {
      const res = new Response(null, { status: error.status });
      return {
        res,
        data: error.data as T,
        ok: false,
        status: error.status,
      };
    }
    throw error;
  }
}

export async function cargarPeriodosCertificacion() {
  const response = await compatRequest<PeriodoFiscal[]>(
    api.get("/api/v1/periodos-fiscales"),
  );
  return { ok: response.ok, data: (response.data || []) as PeriodoFiscal[] };
}

export async function cargarProgramasPoa(periodoFiscalId: string) {
  const data = await api.get<ApiData<Programa[]>>(
    `/api/v1/poa/${periodoFiscalId}/programas`,
  );
  return data.data || [];
}

export async function cargarActividadesPoa(
  periodoFiscalId: string,
  programaCodigo: string,
) {
  const data = await api.get<ApiData<Actividad[]>>(
    `/api/v1/poa/${periodoFiscalId}/actividades?programa=${encodeURIComponent(programaCodigo)}`,
  );
  return data.data || [];
}

export async function cargarItemsPoa(
  periodoFiscalId: string,
  programaCodigo: string,
  actividadCodigo: string,
) {
  const data = await api.get<ApiData<ItemPoa[]>>(
    `/api/v1/poa/${periodoFiscalId}/items?programa=${encodeURIComponent(programaCodigo)}&actividad=${encodeURIComponent(actividadCodigo)}`,
  );
  return data.data || [];
}

export async function cargarFuentesPoa(
  periodoFiscalId: string,
  itemCodigo: string,
) {
  const data = await api.get<ApiData<FuentePoa[]>>(
    `/api/v1/poa/${periodoFiscalId}/fuentes?item=${encodeURIComponent(itemCodigo)}`,
  );
  return data.data || [];
}

export async function consultarSaldoPoa(params: {
  periodoFiscalId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
}): Promise<SaldoInfo> {
  const data = await api.get<ApiData<SaldoInfo>>(
    `/api/v1/poa/${params.periodoFiscalId}/saldo?programa=${encodeURIComponent(params.programaCodigo)}&actividad=${encodeURIComponent(params.actividadCodigo)}&item=${encodeURIComponent(params.itemCodigo)}&fuente=${encodeURIComponent(params.fuenteCodigo)}`,
  );
  return {
    saldoDisponible: Number(data.data?.saldoDisponible || 0),
    montoPlanificado: Number(data.data?.montoPlanificado || 0),
  };
}

export async function listarCertificaciones(params: {
  page: number;
  pageSize: number;
}) {
  const searchParams = queryParams({
    page: params.page,
    pageSize: params.pageSize,
  });
  let data: ApiData<{ items?: Certificacion[]; totalItems?: number }>;
  try {
    data = await api.get(
      `/api/v1/certificaciones?${searchParams.toString()}`,
    );
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

export async function crearCertificacion(params: {
  periodoFiscalId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
  tipo: TipoCertificacion;
  monto: string;
  conIva: boolean;
  documentos: File[];
}) {
  const formData = new FormData();
  formData.append("periodoFiscalId", params.periodoFiscalId);
  formData.append("programaCodigo", params.programaCodigo);
  formData.append("actividadCodigo", params.actividadCodigo);
  formData.append("itemCodigo", params.itemCodigo);
  formData.append("fuenteCodigo", params.fuenteCodigo);
  formData.append("tipo", params.tipo);
  formData.append("monto", Number(params.monto).toFixed(2));
  formData.append("conIva", String(params.conIva));
  params.documentos.forEach((documento) =>
    formData.append("documentos", documento),
  );

  return compatRequest<ApiData<unknown>>(
    api.form("/api/v1/certificaciones", formData),
  );
}

export async function ejecutarAccionCertificacion(params: {
  id: string;
  tipo: CertificacionAccion;
  observaciones?: string;
}) {
  const body =
    params.tipo === "observar"
      ? { observaciones: params.observaciones }
      : undefined;

  return compatRequest(
    api.post<ApiData<unknown>>(
      `/api/v1/certificaciones/${params.id}/${params.tipo}`,
      body,
    ),
  );
}

export async function descargarDocumentoCertificacion(
  certificacionId: string,
  documentoId: string,
) {
  return api.raw(
    `/api/v1/certificaciones/${certificacionId}/documentos/${documentoId}/download`,
  );
}
