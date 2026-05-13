import { authHeaders, getAuthToken } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type {
  CatalogoFiltro,
  CatalogosCedula,
  DiffResult,
  ImportResult,
  PeriodoFiscal,
} from "../types";

interface VersionesPayload {
  items?: unknown[];
  totalItems?: number;
}

export async function cargarPeriodosFiscales() {
  const response = await requestJson<PeriodoFiscal[] | { error?: string }>(
    "/api/v1/periodos-fiscales",
    { headers: authHeaders() },
  );
  if (!response.ok) {
    const data = response.data as { error?: string };
    throw new Error(data.error || "No se pudieron cargar los periodos fiscales");
  }
  return (response.data || []) as PeriodoFiscal[];
}

export async function listarVersionesCedula(
  periodoFiscalId: string,
  page: number,
  pageSize: number,
) {
  return requestJson<{ data?: VersionesPayload }>(
    `/api/v1/cedula-mef/versiones/${periodoFiscalId}?page=${page}&pageSize=${pageSize}`,
    { headers: authHeaders() },
  );
}

export async function obtenerCedulaVigente(periodoFiscalId: string) {
  return requestJson(`/api/v1/cedula-mef/vigente/${periodoFiscalId}`, {
    headers: authHeaders(),
  });
}

export async function listarCatalogosCedula(
  periodoFiscalId: string,
  filtro: CatalogoFiltro,
): Promise<CatalogosCedula> {
  const actividadParams = new URLSearchParams();
  const itemParams = new URLSearchParams();
  const fuenteParams = new URLSearchParams();

  if (filtro.programa) {
    actividadParams.set("programa", filtro.programa);
    itemParams.set("programa", filtro.programa);
  }
  if (filtro.actividad) itemParams.set("actividad", filtro.actividad);
  if (filtro.item) fuenteParams.set("item", filtro.item);

  const [progRes, actRes, itemRes, fteRes] = await Promise.all([
    fetch(`/api/v1/cedula-mef/${periodoFiscalId}/programas`, {
      headers: authHeaders(),
    }),
    filtro.programa
      ? fetch(
          `/api/v1/cedula-mef/${periodoFiscalId}/actividades?${actividadParams.toString()}`,
          { headers: authHeaders() },
        )
      : Promise.resolve(null),
    filtro.actividad
      ? fetch(
          `/api/v1/cedula-mef/${periodoFiscalId}/items?${itemParams.toString()}`,
          { headers: authHeaders() },
        )
      : Promise.resolve(null),
    filtro.item
      ? fetch(
          `/api/v1/cedula-mef/${periodoFiscalId}/fuentes?${fuenteParams.toString()}`,
          { headers: authHeaders() },
        )
      : Promise.resolve(null),
  ]);

  const [progData, actData, itemData, fteData] = await Promise.all([
    progRes.json(),
    actRes ? actRes.json() : Promise.resolve({ data: [] }),
    itemRes ? itemRes.json() : Promise.resolve({ data: [] }),
    fteRes ? fteRes.json() : Promise.resolve({ data: [] }),
  ]);

  return {
    programas: progData.data || [],
    actividades: actData.data || [],
    items: itemData.data || [],
    fuentes: fteData.data || [],
  };
}

export async function compararVersionCedula(versionId: string) {
  return requestJson<{ data?: DiffResult }>(
    `/api/v1/cedula-mef/diff/${versionId}`,
    { headers: authHeaders() },
  );
}

export async function importarCedulaMef(
  archivo: File,
  periodoFiscalId: string,
  onResponse?: () => void,
): Promise<ImportResult> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No autenticado. Cierre sesión y vuelva a ingresar.");
  }

  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("periodoFiscalId", periodoFiscalId);

  const res = await fetch("/api/v1/cedula-mef/importar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  onResponse?.();
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Error al importar");
  }
  return data.data;
}

export async function listarEntradasCedula(
  versionId: string,
  page: number,
  pageSize: number,
  filtro?: string,
) {
  const searchParams = queryParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (filtro) searchParams.set("filtro", filtro);

  return requestJson(
    `/api/v1/cedula-mef/entradas/${versionId}?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
}

export async function validarCombinacionCedula(params: {
  periodoFiscalId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
}) {
  const searchParams = queryParams({
    periodoFiscalId: params.periodoFiscalId,
    programaCodigo: params.programaCodigo,
    actividadCodigo: params.actividadCodigo,
    itemCodigo: params.itemCodigo,
    fuenteCodigo: params.fuenteCodigo,
  });

  return requestJson(`/api/v1/cedula-mef/validar?${searchParams.toString()}`, {
    headers: authHeaders(),
  });
}
