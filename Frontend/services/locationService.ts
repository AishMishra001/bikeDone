import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface UserLocationData {
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  region: string;
  postalCode?: string;
  shortAddress: string;
  fullAddress: string;
}

export type LocationErrorType = 'DISABLED' | 'DENIED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface LocationResult {
  success: boolean;
  location?: UserLocationData;
  errorType?: LocationErrorType;
  errorMessage?: string;
}

/**
 * Checks if location services are enabled on the device.
 */
export async function isLocationServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.warn('Error checking location services status:', error);
    return false;
  }
}

/**
 * Requests foreground location permissions from the user.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.warn('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Helper to perform reverse geocoding on Web using OpenStreetMap Nominatim API,
 * since Expo Location's built-in web reverseGeocodeAsync was removed in SDK 49.
 */
async function reverseGeocodeWeb(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || '';
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      const region = addr.state || addr.country || '';
      const postalCode = addr.postcode || '';

      const areaStr = area && area !== city ? area : '';
      const cityStr = city || region;

      let shortAddress = 'Current Location';
      if (areaStr && cityStr) {
        shortAddress = `${areaStr}, ${cityStr}`;
      } else if (cityStr) {
        shortAddress = cityStr;
      } else if (areaStr) {
        shortAddress = areaStr;
      }

      const fullAddress = data.display_name || [area, city, region, postalCode].filter(Boolean).join(', ');

      return { area, city, region, postalCode, shortAddress, fullAddress };
    }
  } catch (err) {
    console.warn('Web reverse geocoding fallback error:', err);
  }
  return null;
}

/**
 * Automatically fetches the user's current location if location services and permissions are enabled.
 */
export async function fetchCurrentLocation(): Promise<LocationResult> {
  try {
    // 1. Check if location services (GPS) are turned on
    const servicesEnabled = await isLocationServicesEnabled();
    if (!servicesEnabled) {
      return {
        success: false,
        errorType: 'DISABLED',
        errorMessage: 'Location services are turned off. Please turn on location on your device.',
      };
    }

    // 2. Check and request permissions
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    let hasPermission = existingStatus === Location.PermissionStatus.GRANTED;

    if (!hasPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      hasPermission = status === Location.PermissionStatus.GRANTED;
    }

    if (!hasPermission) {
      return {
        success: false,
        errorType: 'DENIED',
        errorMessage: 'Location permission was denied.',
      };
    }

    // 3. Get current position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

    // 4. Reverse geocode coordinates to human-readable address
    let area = '';
    let city = '';
    let region = '';
    let postalCode = '';
    let shortAddress = 'Current Location';
    let fullAddress = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

    let geocodedSuccess = false;

    // On Web, use Nominatim API directly to avoid SDK 49 web geocoding deprecation warning/error
    if (Platform.OS === 'web') {
      const webResult = await reverseGeocodeWeb(latitude, longitude);
      if (webResult) {
        area = webResult.area;
        city = webResult.city;
        region = webResult.region;
        postalCode = webResult.postalCode;
        shortAddress = webResult.shortAddress;
        fullAddress = webResult.fullAddress;
        geocodedSuccess = true;
      }
    }

    // On iOS/Android (or as fallback on web if Nominatim fails), try native Expo reverse geocoding
    if (!geocodedSuccess) {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          
          area = place.name || place.subregion || place.district || place.street || '';
          city = place.city || place.subregion || place.region || '';
          region = place.region || place.country || '';
          postalCode = place.postalCode || '';

          const areaStr = area && area !== city ? area : '';
          const cityStr = city || region;

          if (areaStr && cityStr) {
            shortAddress = `${areaStr}, ${cityStr}`;
          } else if (cityStr) {
            shortAddress = cityStr;
          } else if (areaStr) {
            shortAddress = areaStr;
          }

          const addressParts = [
            place.name,
            place.street,
            place.subregion || place.district,
            place.city,
            place.region,
            place.postalCode
          ].filter((part, index, self) => Boolean(part) && self.indexOf(part) === index);

          if (addressParts.length > 0) {
            fullAddress = addressParts.join(', ');
          }
        }
      } catch (geocodeError) {
        // Fallback to web geocode if native throws on web
        const webResult = await reverseGeocodeWeb(latitude, longitude);
        if (webResult) {
          area = webResult.area;
          city = webResult.city;
          region = webResult.region;
          postalCode = webResult.postalCode;
          shortAddress = webResult.shortAddress;
          fullAddress = webResult.fullAddress;
        }
      }
    }

    return {
      success: true,
      location: {
        latitude,
        longitude,
        area,
        city,
        region,
        postalCode,
        shortAddress,
        fullAddress,
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch user location:', error);
    return {
      success: false,
      errorType: 'UNKNOWN',
      errorMessage: error?.message || 'Failed to determine location.',
    };
  }
}
