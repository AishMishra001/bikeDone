import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { tokenStorage, LoggedInUser } from './tokenStorage';

const getLocalBackendUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8080/api/v1`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

const BASE_URL = getLocalBackendUrl();

let isRefreshing = false;
let refreshSubscribers: ((accessToken: string) => void)[] = [];
let onAuthFailureCallback: (() => void) | null = null;

export const registerAuthFailureCallback = (callback: () => void) => {
  onAuthFailureCallback = callback;
};

const subscribeTokenRefresh = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.map((cb) => cb(accessToken));
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

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const api = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;
    const url = `${BASE_URL}${path}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((headers as Record<string, string>) || {}),
    };

    if (requiresAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        ...restOptions,
      });

      if (response.status === 401 && requiresAuth) {
        // Access token expired, attempt to refresh
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            await handleAuthFailure();
            throw new Error('No refresh token available');
          }

          try {
            const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
              throw new Error('Refresh token request failed');
            }

            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.data) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = refreshData.data;
              await tokenStorage.setAccessToken(newAccessToken);
              await tokenStorage.setRefreshToken(newRefreshToken);
              if (user) {
                await tokenStorage.setUser(user);
              }
              isRefreshing = false;
              onRefreshed(newAccessToken);
            } else {
              throw new Error('Invalid refresh response data');
            }
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            await handleAuthFailure();
            throw new Error('Session expired');
          }
        }

        // Queue requests while refreshing
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh(async (newAccessToken) => {
            try {
              const retriedHeaders = {
                ...requestHeaders,
                'Authorization': `Bearer ${newAccessToken}`,
              };
              const retryResponse = await fetch(url, {
                headers: retriedHeaders,
                ...restOptions,
              });

              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({}));
                reject(new Error(errorData.message || `Request failed with status ${retryResponse.status}`));
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
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      // Handle endpoints returning no content (Void)
      if (response.status === 204) {
        return {} as T;
      }

      const resJson = await response.json();
      return resJson.data as T;
    } catch (error) {
      throw error;
    }
  },

  async get<T>(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  async post<T>(path: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  async put<T>(path: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  async delete<T>(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
};
