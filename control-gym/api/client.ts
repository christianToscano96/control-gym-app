import { API_BASE_URL } from "@/constants/api";
import { useUserStore } from "@/stores/store";
import { router } from "expo-router";

// ─── Custom Error Class ───────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Types ────────────────────────────────────────────────────────
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, any> | FormData;
  /** Set to true for endpoints that do NOT require auth (login, register) */
  skipAuth?: boolean;
}

// ─── Core Function ────────────────────────────────────────────────
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...fetchOptions } =
    options;

  // Build headers
  const headers: Record<string, string> = {};

  // 1. Attach token (unless explicitly skipped)
  if (!skipAuth) {
    const token = useUserStore.getState().user?.token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // 2. Set Content-Type for JSON bodies (NOT for FormData)
  let processedBody: BodyInit | undefined;
  if (body instanceof FormData) {
    processedBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    processedBody = JSON.stringify(body);
  }

  // 3. Merge custom headers
  if (customHeaders) {
    const entries =
      customHeaders instanceof Headers
        ? Array.from(customHeaders.entries())
        : Array.isArray(customHeaders)
          ? customHeaders
          : Object.entries(customHeaders);
    for (const [key, value] of entries) {
      headers[key] = value;
    }
  }

  // Build full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // ─── Execute Fetch ──────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      body: processedBody,
    });
  } catch {
    throw new ApiError(
      "Error de conexión. Verifica tu internet e intenta nuevamente.",
      0,
    );
  }

  // ─── Handle 401 Unauthorized ────────────────────────────────
  if (res.status === 401 && !skipAuth) {
    await useUserStore.getState().logout();
    setTimeout(() => {
      router.replace("/login");
    }, 0);
    throw new ApiError("Sesión expirada. Inicia sesión nuevamente.", 401);
  }

  // ─── Parse Response ─────────────────────────────────────────
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) {
      throw new ApiError(`Error del servidor (${res.status})`, res.status);
    }
    return res as unknown as T;
  }

  const data = await res.json();

  // ─── Handle Non-OK Responses ────────────────────────────────
  if (!res.ok) {
    const message =
      data?.message || data?.error || `Error del servidor (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
