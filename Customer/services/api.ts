import { Platform } from "react-native";
import { SERVICE_URLS } from "../config/services";
import { tokenStorage } from "./tokenStorage";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

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

const getCookieValue = (name: string): string | null => {
  if (Platform.OS !== "web" || typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

let authFailureCallback: (() => void) | null = null;

export const registerAuthFailureCallback = (cb: () => void) => {
  authFailureCallback = cb;
};

/**
 * Handle authentication failure (clear local tokens & trigger auth failure callback)
 */
const handleAuthFailure = async () => {
  isRefreshing = false;
  refreshSubscribers = [];
  await tokenStorage.clear();
  if (authFailureCallback) {
    authFailureCallback();
  }
};

/**
 * Creates a configured API client for a specific service base URL.
 * Includes automatic 401 token-refresh and request retrying.
 */
export const createApiClient = (baseUrl: string) => ({
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;
    const url = `${baseUrl}${path}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }

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
        let freshAccessToken: string | null = null;

        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = await tokenStorage.getRefreshToken();
          const cookieRefreshToken =
            Platform.OS === "web" ? getCookieValue("refresh_token") : null;
          const tokenToRefresh = refreshToken || cookieRefreshToken;

          if (!tokenToRefresh) {
            await handleAuthFailure();
            throw new Error("Session expired. Please log in again.");
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
              freshAccessToken = newAccessToken;
              isRefreshing = false;
              onRefreshed(newAccessToken);
            } else {
              throw new Error("Invalid refresh response data");
            }
          } catch (refreshErr) {
            isRefreshing = false;
            console.error("Token refresh failed:", refreshErr);
            await handleAuthFailure();
            throw new Error("Session expired. Please log in again.");
          }
        } else {
          // Another request is currently refreshing — wait for new token
          freshAccessToken = await new Promise<string>((resolve) => {
            subscribeTokenRefresh((newToken: string) => resolve(newToken));
          });
        }

        // Retry original request with the fresh access token
        const activeToken =
          freshAccessToken || (await tokenStorage.getAccessToken());
        const retryResponse = await fetch(url, {
          headers: {
            ...requestHeaders,
            Authorization: `Bearer ${activeToken}`,
          },
          ...(Platform.OS === "web"
            ? { credentials: "include" as RequestCredentials }
            : {}),
          ...restOptions,
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Request failed with status ${retryResponse.status}`,
          );
        }

        if (retryResponse.status === 204) {
          return {} as T;
        }

        const data = await retryResponse.json();
        return data.data as T;
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

  /**
   * Multipart/form-data upload with token-refresh retry logic.
   */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const url = `${baseUrl}${path}`;

    const buildHeaders = async (customToken?: string): Promise<Record<string, string>> => {
      const token = customToken || (await tokenStorage.getAccessToken());
      return token ? { Authorization: `Bearer ${token}` } : {};
    };

    let response = await fetch(url, {
      method: "POST",
      headers: await buildHeaders(),
      body: formData,
      ...(Platform.OS === "web" ? { credentials: "include" as RequestCredentials } : {}),
    });

    // 401 → try refresh once, then retry
    if (response.status === 401) {
      let freshAccessToken: string | null = null;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          await handleAuthFailure();
          throw new Error("Session expired. Please log in again.");
        }
        try {
          const refreshResponse = await fetch(`${SERVICE_URLS.UMS}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (!refreshResponse.ok) throw new Error("Token refresh failed");
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.data) {
            const { accessToken: newAccess, refreshToken: newRefresh, user } = refreshData.data;
            await tokenStorage.setAccessToken(newAccess);
            await tokenStorage.setRefreshToken(newRefresh);
            if (user) await tokenStorage.setUser(user);
            freshAccessToken = newAccess;
            isRefreshing = false;
            onRefreshed(newAccess);
          } else {
            throw new Error("Invalid refresh response");
          }
        } catch {
          isRefreshing = false;
          await handleAuthFailure();
          throw new Error("Session expired. Please log in again.");
        }
      } else {
        freshAccessToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken: string) => resolve(newToken));
        });
      }

      // Retry with fresh token
      response = await fetch(url, {
        method: "POST",
        headers: await buildHeaders(freshAccessToken || undefined),
        body: formData,
        ...(Platform.OS === "web" ? { credentials: "include" as RequestCredentials } : {}),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed with status ${response.status}`,
      );
    }

    const resJson = await response.json();
    return resJson.data as T;
  },
});

// ─── Default clients — ready to import ───────────────────────────────────────

/** UMS client — User Management Service (port 8080) */
export const api = createApiClient(SERVICE_URLS.UMS);

/** VMS client — Vehicle Management Service (port 8082) */
export const vmsApi = createApiClient(SERVICE_URLS.VMS);
