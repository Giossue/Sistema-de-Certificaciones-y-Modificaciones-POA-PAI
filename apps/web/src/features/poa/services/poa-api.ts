import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type {
  ActividadPoa,
  CatalogosPoa,
  Filtro,
  FilterOption,
  PeriodoFiscal,
  PoaImportResult,
  PoaInfo,
  SortDirection,
  SortKey,
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

export async function cargarPeriodosPoa() {
  try {
    return await api.get<PeriodoFiscal[]>("/api/v1/periodos-fiscales");
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as { error?: string } | undefined;
      throw new Error(
        data?.error || "No se pudieron cargar los periodos fiscales",
        { cause: error },
      );
    }
    throw error;
  }
}

export async function consultarPoaResumen(
  periodoFiscalId: string,
): Promise<PoaInfo | null> {
  const [resumenRes, versionRes] = await Promise.all([
    compatRequest<ApiData<any>>(
      api.get(`/api/v1/saldos/${periodoFiscalId}/resumen`),
    ),
    compatRequest<ApiData<any>>(api.get(`/api/v1/poa/vigente/${periodoFiscalId}`)),
  ]);

  if (!resumenRes.ok || !resumenRes.data.data) {
    return null;
  }

  const resumen = resumenRes.data.data;
  const version = versionRes.ok ? versionRes.data.data : null;
  return {
    id: version?.id || periodoFiscalId,
    numeroVersion: Number(version?.numeroVersion || 1),
    totalActividades: Number(resumen.totalActividades || 0),
    montoTotal: Number(resumen.montoPlanificado || 0),
    actividadesConSaldo: Number(resumen.actividadesConSaldo || 0),
  };
}

export async function listarCatalogosPoa(
  periodoFiscalId: string,
  currentFiltro: Filtro,
): Promise<CatalogosPoa> {
  const actividadParams = new URLSearchParams();
  const itemParams = new URLSearchParams();
  const fuenteParams = new URLSearchParams();

  if (currentFiltro.programa)
    actividadParams.set("programa", currentFiltro.programa);
  if (currentFiltro.programa) itemParams.set("programa", currentFiltro.programa);
  if (currentFiltro.actividad)
    itemParams.set("actividad", currentFiltro.actividad);
  if (currentFiltro.item) fuenteParams.set("item", currentFiltro.item);

  const [programasRes, actividadesRes, itemsRes, fuentesRes] =
    await Promise.all([
      api.get<ApiData<FilterOption[]>>(
        `/api/v1/poa/${periodoFiscalId}/programas`,
      ),
      currentFiltro.programa
        ? api.get<ApiData<FilterOption[]>>(
            `/api/v1/poa/${periodoFiscalId}/actividades?${actividadParams.toString()}`,
          )
        : Promise.resolve(null),
      currentFiltro.actividad
        ? api.get<ApiData<FilterOption[]>>(
            `/api/v1/poa/${periodoFiscalId}/items?${itemParams.toString()}`,
          )
        : Promise.resolve(null),
      currentFiltro.item
        ? api.get<ApiData<FilterOption[]>>(
            `/api/v1/poa/${periodoFiscalId}/fuentes?${fuenteParams.toString()}`,
          )
        : Promise.resolve(null),
    ]);

  return {
    programas: programasRes.data || [],
    actividades: actividadesRes?.data || [],
    items: itemsRes?.data || [],
    fuentes: fuentesRes?.data || [],
  };
}

export async function listarActividadesPoa(params: {
  periodoFiscalId: string;
  currentPage: number;
  pageSize: number;
  sortKey: SortKey;
  sortDirection: SortDirection;
  debouncedTexto: string;
  filtro: Filtro;
  signal?: AbortSignal;
}): Promise<{ actividades: ActividadPoa[]; totalItems: number }> {
  const searchParams = queryParams({
    page: String(params.currentPage),
    pageSize: String(params.pageSize),
    sortKey: params.sortKey,
    sortDirection: params.sortDirection,
  });
  if (params.debouncedTexto.trim())
    searchParams.set("texto", params.debouncedTexto.trim());
  if (params.filtro.programa) searchParams.set("programa", params.filtro.programa);
  if (params.filtro.actividad)
    searchParams.set("actividad", params.filtro.actividad);
  if (params.filtro.item) searchParams.set("item", params.filtro.item);
  if (params.filtro.fuente) searchParams.set("fuente", params.filtro.fuente);
  if (params.filtro.verSoloConSaldo) searchParams.set("soloConSaldo", "true");

  const saldosRes = await compatRequest<ApiData<any>>(
    api.get(
      `/api/v1/saldos/${params.periodoFiscalId}/actividades?${searchParams.toString()}`,
      { signal: params.signal },
    ),
  );

  if (!saldosRes.ok) {
    return { actividades: [], totalItems: 0 };
  }

  const payload = saldosRes.data.data || {};
  const rows = Array.isArray(payload) ? payload : payload.items || [];
  return {
    actividades: rows.map((item: any) => ({
      id: item.actividadId,
      programaCodigo: item.programaCodigo,
      programaNombre: item.programaNombre,
      actividadCodigo: item.actividadCodigo,
      actividadNombre: item.actividadNombre,
      itemCodigo: item.itemCodigo,
      itemNombre: item.itemNombre,
      fuenteCodigo: item.fuenteCodigo,
      fuenteNombre: item.fuenteNombre,
      montoPlanificado: Number(item.montoPlanificado),
      saldoDisponible: Number(item.saldoDisponible),
      certificadoVigente: Number(item.certificadoVigente),
      bloqueadoSolicitudes: Number(item.bloqueadoSolicitudes),
      porcentajeDisponible: Number(item.porcentajeDisponible),
      estado: item.estado,
    })),
    totalItems: Array.isArray(payload)
      ? payload.length
      : Number(payload.totalItems || 0),
  };
}

export async function importarPoaBase(
  archivo: File,
  periodoFiscalId: string,
): Promise<PoaImportResult> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("periodoFiscalId", periodoFiscalId);

  try {
    const data = await api.form<ApiData<PoaImportResult>>(
      "/api/v1/poa/importar-poa-base",
      formData,
    );
    return data.data as PoaImportResult;
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as { error?: string } | undefined;
      throw new Error(data?.error || "Error al importar", { cause: error });
    }
    throw error;
  }
}

export async function consultarSaldoPoa(params: {
  periodoFiscalId: string;
  programa: string;
  actividad: string;
  item: string;
  fuente: string;
}) {
  const searchParams = queryParams({
    programa: params.programa,
    actividad: params.actividad,
    item: params.item,
    fuente: params.fuente,
  });
  return compatRequest(
    api.get(
      `/api/v1/poa/${params.periodoFiscalId}/saldo?${searchParams.toString()}`,
    ),
  );
}
