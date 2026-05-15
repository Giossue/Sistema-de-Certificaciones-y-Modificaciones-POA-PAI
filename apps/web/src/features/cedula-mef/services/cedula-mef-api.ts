import { ApiError, api, getAuthToken } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type {
  CatalogoFiltro,
  CatalogosCedula,
  Actividad,
  DiffResult,
  Fuente,
  ImportResult,
  Item,
  PeriodoFiscal,
  Programa,
} from "../types";

interface VersionesPayload {
  items?: unknown[];
  totalItems?: number;
}

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

export async function cargarPeriodosFiscales() {
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

export async function listarVersionesCedula(
  periodoFiscalId: string,
  page: number,
  pageSize: number,
) {
  return compatRequest<ApiData<VersionesPayload>>(
    api.get(
      `/api/v1/cedula-mef/versiones/${periodoFiscalId}?page=${page}&pageSize=${pageSize}`,
    ),
  );
}

export async function obtenerCedulaVigente(periodoFiscalId: string) {
  return compatRequest<ApiData<unknown>>(
    api.get(`/api/v1/cedula-mef/vigente/${periodoFiscalId}`),
  );
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
    api.get<ApiData<Programa[]>>(
      `/api/v1/cedula-mef/${periodoFiscalId}/programas`,
    ),
    filtro.programa
      ? api.get<ApiData<Actividad[]>>(
          `/api/v1/cedula-mef/${periodoFiscalId}/actividades?${actividadParams.toString()}`,
        )
      : Promise.resolve(null),
    filtro.actividad
      ? api.get<ApiData<Item[]>>(
          `/api/v1/cedula-mef/${periodoFiscalId}/items?${itemParams.toString()}`,
        )
      : Promise.resolve(null),
    filtro.item
      ? api.get<ApiData<Fuente[]>>(
          `/api/v1/cedula-mef/${periodoFiscalId}/fuentes?${fuenteParams.toString()}`,
        )
      : Promise.resolve(null),
  ]);

  return {
    programas: progRes.data || [],
    actividades: actRes?.data || [],
    items: itemRes?.data || [],
    fuentes: fteRes?.data || [],
  };
}

export async function compararVersionCedula(versionId: string) {
  return compatRequest<ApiData<DiffResult>>(
    api.get(`/api/v1/cedula-mef/diff/${versionId}`),
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

  try {
    const data = await api.form<ApiData<ImportResult>>(
      "/api/v1/cedula-mef/importar",
      formData,
    );
    onResponse?.();
    return data.data as ImportResult;
  } catch (error) {
    onResponse?.();
    if (error instanceof ApiError) {
      const data = error.data as { error?: string } | undefined;
      throw new Error(data?.error || "Error al importar", { cause: error });
    }
    throw error;
  }
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

  return compatRequest(
    api.get(
      `/api/v1/cedula-mef/entradas/${versionId}?${searchParams.toString()}`,
    ),
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

  return compatRequest(
    api.get(`/api/v1/cedula-mef/validar?${searchParams.toString()}`),
  );
}
