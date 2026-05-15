import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type { Certificacion, PeriodoFiscal, SaldosResumen } from "../types";

type ApiData<T> = { data?: T };

export async function cargarPeriodosDashboard() {
  return api.get<PeriodoFiscal[]>("/api/v1/periodos-fiscales");
}

export async function cargarResumenSaldosDashboard(periodoId: string) {
  try {
    const data = await api.get<ApiData<SaldosResumen>>(
      `/api/v1/saldos/${periodoId}/resumen`,
    );
    return data.data || null;
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export async function listarCertificacionesDashboard() {
  const searchParams = queryParams({ page: 1, pageSize: 200 });
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

export async function cargarDatosPeriodoDashboard(periodoId: string) {
  const [resumen, certificaciones] = await Promise.all([
    cargarResumenSaldosDashboard(periodoId),
    listarCertificacionesDashboard(),
  ]);
  return { resumen, certificaciones };
}
