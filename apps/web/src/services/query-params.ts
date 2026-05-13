type QueryParamValue = string | number | boolean | null | undefined;

export function queryParams(entries: Record<string, QueryParamValue>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params;
}
