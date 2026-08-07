/**
 * services.ts — Centralized microservice URL config
 *
 * Sirf yahan port ya base path change karo.
 * Saari services automatically update ho jaayengi.
 *
 * Future services bhi yahan add karo:
 *   BOOKING_SERVICE, NOTIFICATION_SERVICE, etc.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Helper: device IP detect karo Expo dev mode mein ────────────────────────
const getDeviceIp = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return null;
};

// ─── Helper: ek service ka full base URL banao ────────────────────────────────
const buildBaseUrl = (port: number, basePath: string = '/api/v1'): string => {
  const ip = getDeviceIp();
  if (ip) {
    return `http://${ip}:${port}${basePath}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}${basePath}`;
  }
  return `http://localhost:${port}${basePath}`;
};

// ─── Service Port Config — SIRF YAHAN CHANGE KARO ────────────────────────────
const SERVICE_PORTS = {
  UMS: 8080,   // User Management Service
  VMS: 8082,   // Vehicle Management Service
  // future services:
  // BMS: 8083,  // Booking Management Service
  // NMS: 8084,  // Notification Service
} as const;

// ─── Exported Base URLs ───────────────────────────────────────────────────────
export const SERVICE_URLS = {
  UMS: buildBaseUrl(SERVICE_PORTS.UMS),
  VMS: buildBaseUrl(SERVICE_PORTS.VMS),
  // future:
  // BMS: buildBaseUrl(SERVICE_PORTS.BMS),
} as const;
