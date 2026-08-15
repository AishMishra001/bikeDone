import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

let cachedCoords: Coordinates | null = null;

export const locationService = {
  /**
   * Check if location services (GPS) are enabled on the device.
   */
  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return typeof navigator !== 'undefined' && 'geolocation' in navigator;
      }
      return await Location.hasServicesEnabledAsync();
    } catch (e) {
      console.warn('Failed to check location services:', e);
      return false;
    }
  },

  /**
   * Request foreground location permission.
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 'permissions' in navigator && (navigator.permissions as any).query) {
          try {
            const status = await (navigator.permissions as any).query({ name: 'geolocation' });
            if (status.state === 'granted' || status.state === 'prompt') {
              return true;
            }
          } catch (err) {
            // Some browsers don't support query for geolocation, continue to standard check
          }
        }
        return typeof navigator !== 'undefined' && 'geolocation' in navigator;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (e) {
      console.warn('Failed to request location permissions:', e);
      return false;
    }
  },

  /**
   * Fetch current GPS location.
   */
  async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      // 1. Try Native / Expo Location first
      if (Platform.OS !== 'web') {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          const req = await Location.requestForegroundPermissionsAsync();
          if (req.status !== Location.PermissionStatus.GRANTED) {
            console.warn('Location permission not granted on device');
            return cachedCoords;
          }
        }

        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (pos && pos.coords) {
            const coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            cachedCoords = coords;
            return coords;
          }
        } catch (posError) {
          console.warn('getCurrentPositionAsync failed, trying last known position:', posError);
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown && lastKnown.coords) {
            const coords = {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            };
            cachedCoords = coords;
            return coords;
          }
        }
      } else {
        // 2. Web / Browser fallback
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          const webCoords = await new Promise<Coordinates | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const coords = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                };
                resolve(coords);
              },
              (err) => {
                console.warn('Web geolocation error:', err.message);
                resolve(null);
              },
              { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
            );
          });

          if (webCoords) {
            cachedCoords = webCoords;
            return webCoords;
          }
        }
      }

      return cachedCoords;
    } catch (error) {
      console.warn('Error obtaining current location:', error);
      return cachedCoords;
    }
  },

  /**
   * Get cached coordinates if available
   */
  getCachedLocation(): Coordinates | null {
    return cachedCoords;
  },

  /**
   * Set cached coordinates manually
   */
  setCachedLocation(coords: Coordinates) {
    cachedCoords = coords;
  },
};
