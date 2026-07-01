import { API_URL } from "../config";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function del(path: string): Promise<void> {
  return request<void>(path, { method: "DELETE" });
}

export function uploadPhoto<T>(path: string, uri: string): Promise<T> {
  const name = uri.split("/").pop() ?? "photo.jpg";
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "heic" ? "image/heic" : "image/jpeg";
  const form = new FormData();
  // React Native's FormData accepts {uri, name, type} file descriptors
  form.append("file", { uri, name, type } as unknown as Blob);
  return request<T>(path, { method: "POST", body: form });
}

export function mediaUrl(path: string | null): string | null {
  return path ? `${API_URL}${path}` : null;
}
