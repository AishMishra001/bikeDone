import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─── Keys ─────────────────────────────────────────────────────────────────────
const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DETAILS: 'user_details',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LoggedInUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNumber: string;
  role: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
// Web: localStorage (persists across sessions)
// Mobile (iOS/Android): expo-secure-store (encrypted, persists across app restarts)

const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('localStorage read error:', e);
        return null;
      }
    }
    // iOS: Keychain | Android: Keystore — survives app restarts
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage write error:', e);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage remove error:', e);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ─── Token Storage API ────────────────────────────────────────────────────────
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

  async getUser(): Promise<LoggedInUser | null> {
    const userStr = await storage.get(KEYS.USER_DETAILS);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as LoggedInUser;
    } catch (e) {
      console.warn('Failed to parse user details:', e);
      return null;
    }
  },

  async setUser(user: LoggedInUser): Promise<void> {
    await storage.set(KEYS.USER_DETAILS, JSON.stringify(user));
  },

  async clear(): Promise<void> {
    await Promise.all([
      storage.remove(KEYS.ACCESS_TOKEN),
      storage.remove(KEYS.REFRESH_TOKEN),
      storage.remove(KEYS.USER_DETAILS),
    ]);
  },
};
