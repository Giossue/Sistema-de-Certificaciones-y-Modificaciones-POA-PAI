export interface JsonResponse<T = any> {
  res: Response;
  data: T;
  ok: boolean;
  status: number;
}

export async function requestJson<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<JsonResponse<T>> {
  const res = await fetch(path, options);
  const data = await res.json();
  return { res, data, ok: res.ok, status: res.status };
}
