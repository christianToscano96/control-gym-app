import { API_BASE_URL } from "@/constants/api";
import {
  useUserStore,
  getToken,
  getRefreshToken,
  saveRefreshToken,
} from "@/stores/store";
import { router } from "expo-router";

// Prevent multiple refresh calls at once
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    // Save new tokens via store (saveToken is called inside setUser for access token)
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    );
    // Save access token directly (store.setUser expects user data)
    let SecureStore: typeof import("expo-secure-store") | null = null;
    try {
      SecureStore = require("expo-secure-store");
    } catch {}
    if (SecureStore) {
      await SecureStore.setItemAsync("auth_token", data.token);
    } else {
      await AsyncStorage.setItem("auth_token", data.token);
    }
    await saveRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

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
    const token = await getToken();
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

  // ─── Handle 401 Unauthorized — try refresh ─────────────────
  if (res.status === 401 && !skipAuth) {
    // Deduplicate concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry original request with new token
      const newToken = await getToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
      }
      const retryRes = await fetch(url, {
        ...fetchOptions,
        headers,
        body: processedBody,
      });
      if (retryRes.ok) {
        const ct = retryRes.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          return (await retryRes.json()) as T;
        }
        return retryRes as unknown as T;
      }
    }

    // Refresh failed — logout
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
