import { authHeaders, getAuthToken } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type {
  ActividadPoa,
  CatalogosPoa,
  Filtro,
  PeriodoFiscal,
  PoaImportResult,
  PoaInfo,
  SortDirection,
  SortKey,
} from "../types";

export async function cargarPeriodosPoa() {
  const { res, data } = await requestJson("/api/v1/periodos-fiscales", {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(data.error || "No se pudieron cargar los periodos fiscales");
  }
  return (data || []) as PeriodoFiscal[];
}

export async function consultarPoaResumen(periodoFiscalId: string): Promise<PoaInfo | null> {
  const [resumenRes, versionRes] = await Promise.all([
    fetch(`/api/v1/saldos/${periodoFiscalId}/resumen`, {
      headers: authHeaders(),
    }),
    fetch(`/api/v1/poa/vigente/${periodoFiscalId}`, {
      headers: authHeaders(),
    }),
  ]);
  const resumenData = await resumenRes.json();
  const versionData = await versionRes.json();

  if (!resumenRes.ok || !resumenData.data) {
    return null;
  }

  const resumen = resumenData.data;
  const version = versionRes.ok ? versionData.data : null;
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
      fetch(`/api/v1/poa/${periodoFiscalId}/programas`, {
        headers: authHeaders(),
      }),
      currentFiltro.programa
        ? fetch(
            `/api/v1/poa/${periodoFiscalId}/actividades?${actividadParams.toString()}`,
            { headers: authHeaders() },
          )
        : Promise.resolve(null),
      currentFiltro.actividad
        ? fetch(`/api/v1/poa/${periodoFiscalId}/items?${itemParams.toString()}`, {
            headers: authHeaders(),
          })
        : Promise.resolve(null),
      currentFiltro.item
        ? fetch(
            `/api/v1/poa/${periodoFiscalId}/fuentes?${fuenteParams.toString()}`,
            { headers: authHeaders() },
          )
        : Promise.resolve(null),
    ]);

  const [programas, actividadesUnicas, items, fuentes] = await Promise.all([
    programasRes.json(),
    actividadesRes ? actividadesRes.json() : Promise.resolve({ data: [] }),
    itemsRes ? itemsRes.json() : Promise.resolve({ data: [] }),
    fuentesRes ? fuentesRes.json() : Promise.resolve({ data: [] }),
  ]);

  return {
    programas: programas.data || [],
    actividades: actividadesUnicas.data || [],
    items: items.data || [],
    fuentes: fuentes.data || [],
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

  const saldosRes = await fetch(
    `/api/v1/saldos/${params.periodoFiscalId}/actividades?${searchParams.toString()}`,
    { headers: authHeaders(), signal: params.signal },
  );

  if (!saldosRes.ok) {
    return { actividades: [], totalItems: 0 };
  }

  const saldosData = await saldosRes.json();
  const payload = saldosData.data || {};
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
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("periodoFiscalId", periodoFiscalId);

  const res = await fetch("/api/v1/poa/importar-poa-base", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al importar");
  return data.data;
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
  return requestJson(`/api/v1/poa/${params.periodoFiscalId}/saldo?${searchParams.toString()}`, {
    headers: authHeaders(),
  });
}
