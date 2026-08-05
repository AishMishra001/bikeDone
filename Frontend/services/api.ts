import { Platform } from "react-native";
import { SERVICE_URLS } from "../config/services";
import { tokenStorage } from "./tokenStorage";

// ─── Auth failure callback (global) ──────────────────────────────────────────
let onAuthFailureCallback: (() => void) | null = null;

export const registerAuthFailureCallback = (callback: () => void) => {
  onAuthFailureCallback = callback;
};

// ─── Token refresh state (shared across all clients) ─────────────────────────
let isRefreshing = false;
let refreshSubscribers: ((accessToken: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((cb) => cb(accessToken));
  refreshSubscribers = [];
};

const handleAuthFailure = async () => {
  await tokenStorage.clear();
  isRefreshing = false;
  refreshSubscribers = [];
  if (onAuthFailureCallback) {
    onAuthFailureCallback();
  }
};

const getCookieValue = (name: string): string | null => {
  if (Platform.OS !== "web" || typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

// ─── Factory: createApiClient ─────────────────────────────────────────────────
/**
 * Ek naya API client banao kisi bhi service ke liye.
 *
 * Usage:
 *   const umsApi = createApiClient(SERVICE_URLS.UMS);
 *   const vmsApi = createApiClient(SERVICE_URLS.VMS);
 *
 * Token refresh UMS ke `/auth/refresh` se hota hai (shared logic).
 */
export const createApiClient = (baseUrl: string) => ({
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;
    const url = `${baseUrl}${path}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...((headers as Record<string, string>) || {}),
    };

    if (requiresAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    if (Platform.OS === "web") {
      const refreshCookie = getCookieValue("refresh_token");
      if (refreshCookie && !requestHeaders["Authorization"]) {
        requestHeaders["X-Refresh-Token"] = refreshCookie;
      }
    }
    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        ...(Platform.OS === "web"
          ? { credentials: "include" as RequestCredentials }
          : {}),
        ...restOptions,
      });

      // ── 401: Try token refresh (UMS /auth/refresh) ────────────────────────
      if (response.status === 401 && requiresAuth) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = await tokenStorage.getRefreshToken();
          const cookieRefreshToken =
            Platform.OS === "web" ? getCookieValue("refresh_token") : null;
          const tokenToRefresh = refreshToken || cookieRefreshToken;

          if (!tokenToRefresh) {
            await handleAuthFailure();
            throw new Error("No refresh token available");
          }

          try {
            const refreshResponse = await fetch(
              `${SERVICE_URLS.UMS}/auth/refresh`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                ...(Platform.OS === "web"
                  ? { credentials: "include" as RequestCredentials }
                  : {}),
                ...(tokenToRefresh
                  ? { body: JSON.stringify({ refreshToken: tokenToRefresh }) }
                  : {}),
              },
            );

            if (!refreshResponse.ok) {
              throw new Error("Refresh token request failed");
            }

            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.data) {
              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user,
              } = refreshData.data;
              await tokenStorage.setAccessToken(newAccessToken);
              await tokenStorage.setRefreshToken(newRefreshToken);
              if (user) await tokenStorage.setUser(user);
              isRefreshing = false;
              onRefreshed(newAccessToken);
            } else {
              throw new Error("Invalid refresh response data");
            }
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
            await handleAuthFailure();
            throw new Error("Session expired");
          }
        }

        // Queue request until refresh completes
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh(async (newAccessToken) => {
            try {
              const retryResponse = await fetch(url, {
                headers: {
                  ...requestHeaders,
                  Authorization: `Bearer ${newAccessToken}`,
                },
                ...(Platform.OS === "web"
                  ? { credentials: "include" as RequestCredentials }
                  : {}),
                ...restOptions,
              });
              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({}));
                reject(
                  new Error(
                    errorData.message ||
                      `Request failed with status ${retryResponse.status}`,
                  ),
                );
              } else {
                const data = await retryResponse.json();
                resolve(data.data as T);
              }
            } catch (retryErr) {
              reject(retryErr);
            }
          });
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const resJson = await response.json();
      return resJson.data as T;
    } catch (error) {
      throw error;
    }
  },

  async get<T>(
    path: string,
    options: Omit<RequestOptions, "method"> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  async post<T>(
    path: string,
    body: any,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async put<T>(
    path: string,
    body: any,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async delete<T>(
    path: string,
    options: Omit<RequestOptions, "method"> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },
});

// ─── Default clients — ready to import ───────────────────────────────────────

/** UMS client — User Management Service (port 8080) */
export const api = createApiClient(SERVICE_URLS.UMS);

/** VMS client — Vehicle Management Service (port 8082) */
export const vmsApi = createApiClient(SERVICE_URLS.VMS);
