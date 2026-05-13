import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type { Certificacion, PeriodoFiscal, SaldosResumen } from "../types";

export async function cargarPeriodosDashboard() {
  const { data } = await requestJson("/api/v1/periodos-fiscales", {
    headers: authHeaders(),
  });
  return (data || []) as PeriodoFiscal[];
}

export async function cargarResumenSaldosDashboard(periodoId: string) {
  const { res, data } = await requestJson(
    `/api/v1/saldos/${periodoId}/resumen`,
    { headers: authHeaders() },
  );
  return res.ok ? ((data.data || null) as SaldosResumen | null) : null;
}

export async function listarCertificacionesDashboard() {
  const searchParams = queryParams({ page: 1, pageSize: 200 });
  const { res, data } = await requestJson(
    `/api/v1/certificaciones?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  return res.ok ? ((data.data?.items || []) as Certificacion[]) : [];
}

export async function cargarDatosPeriodoDashboard(periodoId: string) {
  const [resumen, certificaciones] = await Promise.all([
    cargarResumenSaldosDashboard(periodoId),
    listarCertificacionesDashboard(),
  ]);
  return { resumen, certificaciones };
}
