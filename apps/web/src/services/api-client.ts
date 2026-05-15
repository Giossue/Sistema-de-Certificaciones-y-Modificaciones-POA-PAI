const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const API_PREFIX = "/api/v1";
const TOKEN_KEY = "poa_token";

export type JsonValue = unknown;

export type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
}

function emitAuthExpired() {
  clearAuthSession();
  window.dispatchEvent(new CustomEvent("auth:expired"));
}

function buildUrl(path: string) {
  const apiBase = API_BASE.replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith(apiBase)) return path;
  if (path.startsWith(API_PREFIX)) return `${apiBase}${path.slice(API_PREFIX.length)}`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase}${normalizedPath}`;
}

function withAuthHeaders(options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);
  const token = getAuthToken();

  if (options.auth !== false && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseResponseBody<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.status === 205) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return undefined as T;

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  return text as T;
}

function errorMessage(status: number, data: unknown) {
  if (data && typeof data === "object") {
    const payload = data as { error?: unknown; message?: unknown };
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.message === "string") return payload.message;
  }
  if (typeof data === "string" && data.trim()) return data;
  return `HTTP ${status}`;
}

export async function raw(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const { auth: _auth, ...fetchOptions } = options;
  const res = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers: withAuthHeaders(options),
  });

  if (res.status === 401) emitAuthExpired();
  return res;
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const res = await raw(path, options);
  const data = await parseResponseBody<T>(res);

  if (!res.ok) {
    throw new ApiError(res.status, errorMessage(res.status, data), data);
  }

  return data;
}

function jsonRequest<T>(
  path: string,
  method: string,
  body?: JsonValue,
  options: ApiRequestOptions = {},
) {
  const headers = new Headers(options.headers);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return request<T>(path, {
    ...options,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function download(path: string, filename?: string, options: ApiRequestOptions = {}) {
  const res = await raw(path, options);
  if (!res.ok) {
    const data = await parseResponseBody(res);
    throw new ApiError(res.status, errorMessage(res.status, data), data);
  }

  const blob = await res.blob();
  if (filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  return blob;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: JsonValue, options?: ApiRequestOptions) =>
    jsonRequest<T>(path, "POST", body, options),
  patch: <T>(path: string, body?: JsonValue, options?: ApiRequestOptions) =>
    jsonRequest<T>(path, "PATCH", body, options),
  put: <T>(path: string, body?: JsonValue, options?: ApiRequestOptions) =>
    jsonRequest<T>(path, "PUT", body, options),
  del: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  form: <T>(path: string, formData: FormData, options?: ApiRequestOptions) =>
    request<T>(path, {
      ...options,
      method: options?.method || "POST",
      body: formData,
    }),
  download,
  raw,
};
