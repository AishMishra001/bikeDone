/**
 * Geo-Fencing & Serviceability Utilities for BikeDone (Noida Region).
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ServiceabilityCheckInput {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  area?: string | null;
  shortAddress?: string | null;
  fullAddress?: string | null;
  postalCode?: string | null;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  city: string;
  matchedZone: string;
  reason?: string;
}

// Noida Center Coordinates
export const NOIDA_CENTER = {
  latitude: 28.5355,
  longitude: 77.3910,
};

// Noida & Greater Noida Bounding Box
export const NOIDA_BOUNDS = {
  minLat: 28.4000,
  maxLat: 28.6600,
  minLng: 77.2600,
  maxLng: 77.5800,
  maxRadiusKm: 25.0,
};

// Whitelisted Pincodes for Noida & Greater Noida
export const NOIDA_PINCODES = [
  '201301', '201302', '201303', '201304', '201305',
  '201306', '201307', '201308', '201309', '201310',
  '201311', '201312', '201313', '201314', '201315',
  '201316', '201317', '201318'
];

// Popular Noida Hubs for quick selection
export const POPULAR_NOIDA_HUBS = [
  {
    name: 'Sector 62, Noida',
    landmark: 'Near Electronic City Metro Station',
    latitude: 28.6280,
    longitude: 77.3670,
  },
  {
    name: 'Sector 18, Noida',
    landmark: 'Atta Market & Mall of India',
    latitude: 28.5708,
    longitude: 77.3260,
  },
  {
    name: 'Sector 137, Noida',
    landmark: 'Noida-Greater Noida Expressway',
    latitude: 28.5135,
    longitude: 77.4042,
  },
  {
    name: 'Sector 76, Noida',
    landmark: 'Near Amrapali Silicon City',
    latitude: 28.5726,
    longitude: 77.3820,
  },
  {
    name: 'Noida Extension (Gaur City)',
    landmark: 'Greater Noida West',
    latitude: 28.6080,
    longitude: 77.4280,
  },
];

/**
 * Calculates Haversine distance in KM between two coordinates.
 */
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

/**
 * Checks if a given location is within the Noida service boundary.
 */
export function checkServiceability(input: ServiceabilityCheckInput): ServiceabilityResult {
  const { latitude, longitude, city, area, shortAddress, fullAddress, postalCode } = input;

  const fullText = [city, area, shortAddress, fullAddress].filter(Boolean).join(' ').toLowerCase();

  // 1. Text keyword match for Noida / Greater Noida
  const noidaKeywords = [
    'noida',
    'greater noida',
    'gautam buddha nagar',
    'gautam budh nagar',
    'gb nagar',
    'gaur city',
    'noida extension',
  ];

  const hasNoidaKeyword = noidaKeywords.some((kw) => fullText.includes(kw));

  // 2. Postal code match
  const hasNoidaPincode = postalCode ? NOIDA_PINCODES.includes(postalCode.trim()) : false;

  // 3. GPS Coordinates match
  let isWithinGpsBounds = false;
  let distanceToCenter = 999;

  if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    const withinBoundingBox =
      lat >= NOIDA_BOUNDS.minLat &&
      lat <= NOIDA_BOUNDS.maxLat &&
      lng >= NOIDA_BOUNDS.minLng &&
      lng <= NOIDA_BOUNDS.maxLng;

    distanceToCenter = getDistanceKm(NOIDA_CENTER.latitude, NOIDA_CENTER.longitude, lat, lng);
    isWithinGpsBounds = withinBoundingBox && distanceToCenter <= NOIDA_BOUNDS.maxRadiusKm;
  }

  // Combined Decision:
  // If GPS is valid, GPS bounding box is the source of truth, supported by keywords/pincode
  if (isWithinGpsBounds || hasNoidaPincode || hasNoidaKeyword) {
    return {
      isServiceable: true,
      city: 'Noida',
      matchedZone: 'Noida & Greater Noida Zone',
    };
  }

  // Extracted city name for display in unserviceable banner
  let detectedCity = city || 'Your Area';
  if (fullText.includes('delhi')) detectedCity = 'New Delhi';
  else if (fullText.includes('gurugram') || fullText.includes('gurgaon')) detectedCity = 'Gurugram';
  else if (fullText.includes('faridabad')) detectedCity = 'Faridabad';
  else if (fullText.includes('ghaziabad')) detectedCity = 'Ghaziabad';

  return {
    isServiceable: false,
    city: detectedCity,
    matchedZone: 'Outside Noida Region',
    reason: `MyKaarigar is currently serviceable only in Noida & Greater Noida. We are expanding to ${detectedCity} soon!`,
  };
}
