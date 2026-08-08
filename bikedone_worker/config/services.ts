import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDeviceIp = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return null;
};

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

const SERVICE_PORTS = {
  UMS: 8080,
  OMS: 8082,
} as const;

export const SERVICE_URLS = {
  UMS: buildBaseUrl(SERVICE_PORTS.UMS),
  OMS: buildBaseUrl(SERVICE_PORTS.OMS),
} as const;
