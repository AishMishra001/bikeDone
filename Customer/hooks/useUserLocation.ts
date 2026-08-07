import { useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentLocation,
  UserLocationData,
  LocationErrorType,
} from '../services/locationService';

export interface UseUserLocationReturn {
  loading: boolean;
  location: UserLocationData | null;
  errorType: LocationErrorType | null;
  errorMessage: string | null;
  refreshLocation: () => Promise<void>;
}

/**
 * React hook to automatically fetch the current location of the user
 * when location services are turned on.
 */
export function useUserLocation(): UseUserLocationReturn {
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<UserLocationData | null>(null);
  const [errorType, setErrorType] = useState<LocationErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setErrorType(null);
    setErrorMessage(null);

    const result = await fetchCurrentLocation();

    if (result.success && result.location) {
      setLocation(result.location);
    } else {
      setErrorType(result.errorType || 'UNKNOWN');
      setErrorMessage(result.errorMessage || 'Unable to fetch location');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  return {
    loading,
    location,
    errorType,
    errorMessage,
    refreshLocation: loadLocation,
  };
}
