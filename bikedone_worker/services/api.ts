import { Platform } from "react-native";
import { SERVICE_URLS } from "../config/services";

export interface LoggedInMechanic {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber: string;
  status: string;
  mobileVerified: boolean;
  isBlocked: boolean;
}

const KEYS = {
  ACCESS_TOKEN: "mechanic_access_token",
  REFRESH_TOKEN: "mechanic_refresh_token",
  MECHANIC_DETAILS: "mechanic_details",
} as const;

export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    try {
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {}
      return;
    }
    try {
      const SecureStore = require("expo-secure-store");
      await SecureStore.setItemAsync(key, value);
    } catch (e) {}
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {}
      return;
    }
    try {
      const SecureStore = require("expo-secure-store");
      await SecureStore.deleteItemAsync(key);
    } catch (e) {}
  },
};

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return storage.get(KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await storage.set(KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return storage.get(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await storage.set(KEYS.REFRESH_TOKEN, token);
  },

  async getMechanic(): Promise<LoggedInMechanic | null> {
    const dataStr = await storage.get(KEYS.MECHANIC_DETAILS);
    if (!dataStr) return null;
    try {
      return JSON.parse(dataStr) as LoggedInMechanic;
    } catch (e) {
      return null;
    }
  },

  async setMechanic(mechanic: LoggedInMechanic): Promise<void> {
    await storage.set(KEYS.MECHANIC_DETAILS, JSON.stringify(mechanic));
  },

  async clear(): Promise<void> {
    await Promise.all([
      storage.remove(KEYS.ACCESS_TOKEN),
      storage.remove(KEYS.REFRESH_TOKEN),
      storage.remove(KEYS.MECHANIC_DETAILS),
    ]);
  },
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const api = {
  async request<T>(path: string, options: any = {}): Promise<T> {
    const { requiresAuth = true, targetService = "UMS", headers = {}, ...restOptions } = options;
    const baseUrl = targetService === "OMS" ? SERVICE_URLS.OMS : SERVICE_URLS.UMS;
    const url = `${baseUrl}${path}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requiresAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    let response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    });

    // Handle 401 Unauthorized → Try Refresh Token
    if (response.status === 401 && requiresAuth) {
      let freshToken: string | null = null;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = await tokenStorage.getRefreshToken();

        if (refreshToken) {
          try {
            // Check if we are refreshing for a mechanic
            const mechanicStr = await tokenStorage.getMechanic();
            const refreshUrl = mechanicStr 
                ? `${SERVICE_URLS.UMS}/auth/mechanic/refresh` 
                : `${SERVICE_URLS.UMS}/auth/refresh`;

            const refreshRes = await fetch(refreshUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data?.accessToken) {
                freshToken = refreshData.data.accessToken;
                await tokenStorage.setAccessToken(freshToken!);
                if (refreshData.data.refreshToken) {
                  await tokenStorage.setRefreshToken(refreshData.data.refreshToken);
                }
                isRefreshing = false;
                onRefreshed(freshToken!);
              }
            }
          } catch (e) {
            console.warn("Mechanic token refresh failed:", e);
          }
        }

        if (!freshToken) {
          isRefreshing = false;
          await tokenStorage.clear();
          throw new Error("Session expired. Please log in again.");
        }
      } else {
        freshToken = await new Promise<string>((resolve) => {
          refreshSubscribers.push((newToken) => resolve(newToken));
        });
      }

      // Retry original request with fresh access token
      response = await fetch(url, {
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${freshToken}`,
        },
        ...restOptions,
      });
    }

    let resJson: any = null;
    try {
      const text = await response.text();
      resJson = text ? JSON.parse(text) : null;
    } catch {
      resJson = null;
    }

    if (!response.ok) {
      throw new Error(resJson?.message || `Request failed with status ${response.status}`);
    }

    if (resJson === null || resJson === undefined) {
      return null as unknown as T;
    }

    if (resJson.success === false) {
      throw new Error(resJson.message || `Request failed with status ${response.status}`);
    }

    return (resJson.data !== undefined ? resJson.data : resJson) as T;
  },

  async post<T>(path: string, body?: any, options: any = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async patch<T>(path: string, body?: any, options: any = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(path: string, body?: any, options: any = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async get<T>(path: string, options: any = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  async delete<T>(path: string, options: any = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },

  async upload<T>(path: string, formData: FormData, options: any = {}): Promise<T> {
    const { targetService = "OMS", requiresAuth = false } = options;
    const baseUrl = targetService === "OMS" ? SERVICE_URLS.OMS : SERVICE_URLS.UMS;
    const url = `${baseUrl}${path}`;

    const headers: Record<string, string> = {};
    if (requiresAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    let resJson: any = null;
    try {
      const text = await response.text();
      resJson = text ? JSON.parse(text) : null;
    } catch {
      resJson = null;
    }

    if (!response.ok) {
      throw new Error(resJson?.message || `Upload failed with status ${response.status}`);
    }

    if (resJson?.success === false) {
      throw new Error(resJson.message || `Upload failed with status ${response.status}`);
    }

    return (resJson?.data !== undefined ? resJson.data : resJson) as T;
  },
};

export const omsApi = {
  get: <T>(path: string, options: any = {}): Promise<T> =>
    api.get<T>(path, { ...options, targetService: "OMS" }),
  post: <T>(path: string, body?: any, options: any = {}): Promise<T> =>
    api.post<T>(path, body, { ...options, targetService: "OMS" }),
  upload: <T>(path: string, formData: FormData, options: any = {}): Promise<T> =>
    api.upload<T>(path, formData, { ...options, targetService: "OMS" }),
};

