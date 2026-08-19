export interface PlaceSuggestion {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  pincode?: string;
  street?: string;
}

export const placesService = {
  /**
   * Search for places / addresses with autocomplete-style query
   */
  async searchPlaces(query: string): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const encoded = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&countrycodes=in`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BikeDoneWorkerApp/1.0',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((item: any) => {
        const addr = item.address || {};
        const title =
          item.name ||
          addr.road ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.amenity ||
          query;
        return {
          id: String(item.place_id || Math.random()),
          title: title,
          description: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
          street: addr.road || '',
        };
      });
    } catch (e) {
      console.warn('Place search error:', e);
      return [];
    }
  },

  /**
   * Reverse geocode GPS coordinates to human-readable address
   */
  async reverseGeocode(lat: number, lon: number): Promise<PlaceSuggestion | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BikeDoneWorkerApp/1.0',
        },
      });
      if (!res.ok) return null;
      const item = await res.json();
      const addr = item.address || {};
      const title =
        item.name ||
        addr.road ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.amenity ||
        'Current Location';
      return {
        id: String(item.place_id || 'gps'),
        title: title,
        description: item.display_name,
        latitude: lat,
        longitude: lon,
        city: addr.city || addr.town || addr.village || addr.county || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
        street: addr.road || '',
      };
    } catch (e) {
      console.warn('Reverse geocode error:', e);
      return null;
    }
  },
};
