/**
 * Geo-Fencing & Service Zone validation for BikeDone Worker (Noida Region).
 */

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const NOIDA_CENTER = {
  latitude: 28.5355,
  longitude: 77.3910,
};

export const NOIDA_BOUNDS = {
  minLat: 28.4000,
  maxLat: 28.6600,
  minLng: 77.2600,
  maxLng: 77.5800,
  maxRadiusKm: 25.0,
};

export const NOIDA_SECTORS_SUMMARY = [
  'Sector 1 to 168 (Full Noida)',
  'Noida-Greater Noida Expressway Corridor',
  'Greater Noida West (Noida Extension & Gaur City)',
  'Knowledge Park & Pari Chowk Region',
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinNoidaServiceZone(coords: LocationCoords | null | undefined): {
  isServiceable: boolean;
  distanceToZoneKm: number;
  message: string;
} {
  if (!coords || coords.latitude == null || coords.longitude == null) {
    return {
      isServiceable: true, // Default to true if GPS is warming up
      distanceToZoneKm: 0,
      message: 'Detecting zone...',
    };
  }

  const lat = Number(coords.latitude);
  const lng = Number(coords.longitude);

  const withinBoundingBox =
    lat >= NOIDA_BOUNDS.minLat &&
    lat <= NOIDA_BOUNDS.maxLat &&
    lng >= NOIDA_BOUNDS.minLng &&
    lng <= NOIDA_BOUNDS.maxLng;

  const distanceToCenter = getDistanceKm(NOIDA_CENTER.latitude, NOIDA_CENTER.longitude, lat, lng);
  const isInside = withinBoundingBox || distanceToCenter <= NOIDA_BOUNDS.maxRadiusKm;

  if (isInside) {
    return {
      isServiceable: true,
      distanceToZoneKm: 0,
      message: 'Inside Noida Operational Zone',
    };
  }

  const excessDistance = Math.round(Math.max(distanceToCenter - NOIDA_BOUNDS.maxRadiusKm, 1));

  return {
    isServiceable: false,
    distanceToZoneKm: excessDistance,
    message: `You are ~${excessDistance}km outside the Noida Service Zone.`,
  };
}
