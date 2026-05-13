import { authHeaders } from "@/services/auth-headers";
import { requestJson } from "@/services/http";
import { queryParams } from "@/services/query-params";
import type { SortDirection, SortKey, Tramite } from "../types";
import { actionUrl } from "../utils/tramites-helpers";

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

  const { res, data } = await requestJson(
    `/api/v1/tramites?${searchParams.toString()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) return null;
  return {
    items: (data.data?.items || []) as Tramite[],
    totalItems: Number(data.data?.totalItems || 0),
  };
}

export async function ejecutarAccionTramite(
  item: Tramite,
  action: string,
  body?: Record<string, unknown>,
) {
  const url = actionUrl(item, action);
  if (!url) return null;
  return requestJson(url, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
