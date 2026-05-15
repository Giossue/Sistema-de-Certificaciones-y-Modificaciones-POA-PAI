import { ApiError, api } from "@/services/api-client";
import { queryParams } from "@/services/query-params";
import type { SortDirection, SortKey, Tramite } from "../types";
import { actionUrl } from "../utils/tramites-helpers";

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

export async function listarTramites(params: {
  page: number;
  pageSize: number;
  sortKey: SortKey;
  sortDirection: SortDirection;
  estado: string;
  query: string;
}) {
  const searchParams = queryParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortKey: params.sortKey,
    sortDirection: params.sortDirection,
  });
  if (params.estado !== "todos") searchParams.set("estado", params.estado);
  if (params.query.trim()) searchParams.set("q", params.query.trim());

  let data: ApiData<{
    items?: Tramite[];
    totalItems?: number;
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  }>;
  try {
    data = await api.get(`/api/v1/tramites?${searchParams.toString()}`);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
  return {
    items: data.data?.items || [],
    totalItems: Number(data.data?.totalItems ?? data.data?.total ?? 0),
    page: data.data?.page,
    pageSize: data.data?.pageSize,
    totalPages: data.data?.totalPages,
  };
}

export async function ejecutarAccionTramite(
  item: Tramite,
  action: string,
  body?: Record<string, unknown>,
) {
  const url = actionUrl(item, action);
  if (!url) return null;
  return compatAction(api.post(url, body));
}
