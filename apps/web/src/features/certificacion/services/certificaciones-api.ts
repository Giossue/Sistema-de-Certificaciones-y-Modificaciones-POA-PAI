import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
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

export async function cargarPeriodosCertificacion() {
  const { res, data } = await requestJson("/api/v1/periodos-fiscales", {
    headers: authHeaders(),
  });
  return { ok: res.ok, data: (data || []) as PeriodoFiscal[] };
}

export async function cargarProgramasPoa(periodoFiscalId: string) {
  const { data } = await requestJson(`/api/v1/poa/${periodoFiscalId}/programas`, {
    headers: authHeaders(),
  });
  return (data.data || []) as Programa[];
}

export async function cargarActividadesPoa(
  periodoFiscalId: string,
  programaCodigo: string,
) {
  const { data } = await requestJson(
    `/api/v1/poa/${periodoFiscalId}/actividades?programa=${encodeURIComponent(programaCodigo)}`,
    { headers: authHeaders() },
  );
  return (data.data || []) as Actividad[];
}

export async function cargarItemsPoa(
  periodoFiscalId: string,
  programaCodigo: string,
  actividadCodigo: string,
) {
  const { data } = await requestJson(
    `/api/v1/poa/${periodoFiscalId}/items?programa=${encodeURIComponent(programaCodigo)}&actividad=${encodeURIComponent(actividadCodigo)}`,
    { headers: authHeaders() },
  );
  return (data.data || []) as ItemPoa[];
}

export async function cargarFuentesPoa(
  periodoFiscalId: string,
  itemCodigo: string,
) {
  const { data } = await requestJson(
    `/api/v1/poa/${periodoFiscalId}/fuentes?item=${encodeURIComponent(itemCodigo)}`,
    { headers: authHeaders() },
  );
  return (data.data || []) as FuentePoa[];
}

export async function consultarSaldoPoa(params: {
  periodoFiscalId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
}): Promise<SaldoInfo> {
  const { data } = await requestJson(
    `/api/v1/poa/${params.periodoFiscalId}/saldo?programa=${encodeURIComponent(params.programaCodigo)}&actividad=${encodeURIComponent(params.actividadCodigo)}&item=${encodeURIComponent(params.itemCodigo)}&fuente=${encodeURIComponent(params.fuenteCodigo)}`,
    { headers: authHeaders() },
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
  const { res, data } = await requestJson(
    `/api/v1/certificaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  const payload = data.data || {};
  return {
    items: (payload.items || []) as Certificacion[],
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

  return requestJson("/api/v1/certificaciones", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
}

export async function ejecutarAccionCertificacion(params: {
  id: string;
  tipo: CertificacionAccion;
  observaciones?: string;
}) {
  let body: BodyInit | undefined;
  const headers: Record<string, string> = authHeaders();
  if (params.tipo === "observar") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ observaciones: params.observaciones });
  }

  return requestJson(`/api/v1/certificaciones/${params.id}/${params.tipo}`, {
    method: "POST",
    headers,
    body,
  });
}

export async function descargarDocumentoCertificacion(
  certificacionId: string,
  documentoId: string,
) {
  return fetch(
    `/api/v1/certificaciones/${certificacionId}/documentos/${documentoId}/download`,
    { headers: authHeaders() },
  );
}
