/**
 * Utility functions for geolocation, distance calculation, ETA, and route rendering.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance between two coordinates in Kilometers using the Haversine formula.
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance into a clean user-facing string (e.g. "At your location", "450 m" or "2.4 km").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.03) {
    return 'At your location';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates arrival time in minutes based on urban bike speed (~22 km/h).
 */
export function calculateETA(distanceKm: number): string {
  if (distanceKm <= 0.03) return 'At location';
  if (distanceKm <= 0.1) return 'Arriving now';
  const avgSpeedKmh = 22;
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.max(1, Math.round(hours * 60) + 1);
  return `${minutes} min${minutes > 1 ? 's' : ''}`;
}

/**
 * Generates an interpolated, slightly natural route polyline between mechanic and customer.
 */
export function generateCurvedRoute(
  start: LatLng,
  end: LatLng,
  numPoints: number = 6
): LatLng[] {
  if (!start || !end) return [];
  if (
    start.latitude === end.latitude &&
    start.longitude === end.longitude
  ) {
    return [start, end];
  }

  const points: LatLng[] = [start];
  
  // Perpendicular deviation vector for realistic natural curve
  const midLat = (start.latitude + end.latitude) / 2;
  const midLng = (start.longitude + end.longitude) / 2;
  
  const dLat = end.latitude - start.latitude;
  const dLng = end.longitude - start.longitude;

  // Gentle bend factor
  const bend = 0.15;
  const perpLat = -dLng * bend;
  const perpLng = dLat * bend;

  for (let i = 1; i <= numPoints; i++) {
    const t = i / (numPoints + 1);
    // Quadratic Bezier interpolation with slight road-like deviation
    const lat =
      (1 - t) * (1 - t) * start.latitude +
      2 * (1 - t) * t * (midLat + perpLat) +
      t * t * end.latitude;
    const lng =
      (1 - t) * (1 - t) * start.longitude +
      2 * (1 - t) * t * (midLng + perpLng) +
      t * t * end.longitude;
    points.push({ latitude: lat, longitude: lng });
  }

  points.push(end);
  return points;
}
