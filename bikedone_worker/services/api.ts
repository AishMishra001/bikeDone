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
  MECHANIC_DETAILS: "mechanic_details",
} as const;

const storage = {
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
      storage.remove(KEYS.MECHANIC_DETAILS),
    ]);
  },
};

export const api = {
  async request<T>(path: string, options: any = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;
    const url = `${SERVICE_URLS.UMS}${path}`;

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

    const response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    });

    const resJson = await response.json();
    if (!response.ok || resJson.success === false) {
      throw new Error(resJson.message || `Request failed with status ${response.status}`);
    }

    return resJson.data as T;
  },

  async post<T>(path: string, body: any, options: any = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async get<T>(path: string, options: any = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  },
};
