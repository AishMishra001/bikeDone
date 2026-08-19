import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/theme';
import { placesService, PlaceSuggestion } from '@/services/placesService';
import { locationService } from '@/services/locationService';

interface ShopAddressMapPickerProps {
  address: string;
  onAddressChange: (fullAddress: string, lat?: number, lon?: number) => void;
  initialLat?: number;
  initialLon?: number;
}

export const ShopAddressMapPicker: React.FC<ShopAddressMapPickerProps> = ({
  address,
  onAddressChange,
  initialLat = 28.6139,
  initialLon = 77.2090,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [shopUnit, setShopUnit] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
    title: string;
    description: string;
  }>({
    lat: initialLat,
    lon: initialLon,
    title: 'Selected Garage Location',
    description: address || '123, Sharma Market, Laxmi Nagar, Delhi - 110092',
  });

  const debounceTimeout = useRef<any>(null);

  // Sync initial address
  useEffect(() => {
    if (address && !searchQuery) {
      // If address exists, set it as description
      setSelectedLocation((prev) => ({
        ...prev,
        description: address,
      }));
    }
  }, [address]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);
    debounceTimeout.current = setTimeout(async () => {
      const results = await placesService.searchPlaces(text);
      setSuggestions(results);
      setLoadingSearch(false);
    }, 350);
  };

  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    const formatted = shopUnit.trim()
      ? `${shopUnit.trim()}, ${place.description}`
      : place.description;

    setSelectedLocation({
      lat: place.latitude,
      lon: place.longitude,
      title: place.title,
      description: formatted,
    });
    setSuggestions([]);
    setSearchQuery(place.title);
    onAddressChange(formatted, place.latitude, place.longitude);
  };

  const handleUseGps = async () => {
    try {
      setLoadingGps(true);
      const coords = await locationService.getCurrentLocation();
      if (coords) {
        const place = await placesService.reverseGeocode(coords.latitude, coords.longitude);
        const fullDesc = place?.description || `Location near ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        const formatted = shopUnit.trim()
          ? `${shopUnit.trim()}, ${fullDesc}`
          : fullDesc;

        setSelectedLocation({
          lat: coords.latitude,
          lon: coords.longitude,
          title: place?.title || 'Current GPS Location',
          description: formatted,
        });
        setSearchQuery(place?.title || '');
        setSuggestions([]);
        onAddressChange(formatted, coords.latitude, coords.longitude);
      }
    } catch (e) {
      console.warn('GPS error:', e);
    } finally {
      setLoadingGps(false);
    }
  };

  const handleUnitChange = (unit: string) => {
    setShopUnit(unit);
    const baseDesc = selectedLocation.description.replace(/^[^,]+,\s*/, '');
    const combined = unit.trim() ? `${unit.trim()}, ${baseDesc || selectedLocation.description}` : baseDesc || selectedLocation.description;
    onAddressChange(combined, selectedLocation.lat, selectedLocation.lon);
  };

  const handleManualAddressChange = (full: string) => {
    setSelectedLocation((prev) => ({ ...prev, description: full }));
    onAddressChange(full, selectedLocation.lat, selectedLocation.lon);
  };

  // Google Maps embed URL
  const googleMapEmbedUrl = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lon}&z=16&output=embed`;

  return (
    <View style={styles.container}>
      {/* Header & GPS button */}
      <View style={styles.topRow}>
        <Text style={styles.sectionLabel}>Shop / Workshop Address *</Text>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseGps}
          activeOpacity={0.7}
          disabled={loadingGps}
        >
          {loadingGps ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="navigate" size={14} color={Colors.primary} />
          )}
          <Text style={styles.gpsButtonText}>
            {loadingGps ? 'Locating...' : 'Use GPS Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input with Autocomplete */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={Colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locality, street, market or landmark..."
          placeholderTextColor={Colors.gray400}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {loadingSearch ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 10 }} />
        ) : searchQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSuggestions([]);
            }}
            style={{ padding: 6 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Autocomplete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsBox, Shadows.medium]}>
          <ScrollView
            style={{ maxHeight: 220 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionIconBox}>
                  <Ionicons name="location-sharp" size={18} color={Colors.primary} />
                </View>
                <View style={styles.suggestionTextBox}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Optional Shop / Building Detail Input */}
      <View style={styles.unitInputWrapper}>
        <Ionicons name="business-outline" size={18} color={Colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.unitInput}
          placeholder="Shop / Unit No. or Building Name (e.g. Shop #12, Ground Floor)"
          placeholderTextColor={Colors.gray400}
          value={shopUnit}
          onChangeText={handleUnitChange}
        />
      </View>

      {/* Full Address Multi-line Box */}
      <View style={styles.fullAddressWrapper}>
        <Text style={styles.fullAddressLabel}>Full Formatted Address (Saved with Profile):</Text>
        <TextInput
          style={styles.fullAddressInput}
          multiline
          numberOfLines={3}
          value={address || selectedLocation.description}
          onChangeText={handleManualAddressChange}
          placeholder="Enter complete verified shop address"
          placeholderTextColor={Colors.gray400}
        />
      </View>

      {/* Interactive Map Pin & View */}
      <Text style={styles.mapHeaderTitle}>Verify Garage Location Pin</Text>
      <View style={[styles.mapContainer, Shadows.small]}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Garage Location Map"
            src={googleMapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <View style={styles.nativeMapFallback}>
            <Ionicons name="map" size={40} color={Colors.primary} />
            <Text style={styles.nativeMapText}>
              Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Selected Coordinates Tag Overlay */}
        <View style={styles.mapCoordsBadge}>
          <Ionicons name="location" size={14} color="#EF4444" />
          <Text style={styles.mapCoordsText}>
            GPS Pin: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    paddingVertical: 10,
    outlineStyle: 'none' as any,
  },
  suggestionsBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginTop: -4,
    marginBottom: 12,
    overflow: 'hidden',
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 10,
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTextBox: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 11,
    color: Colors.gray600,
    lineHeight: 15,
  },
  unitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 10,
  },
  unitInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    paddingVertical: 8,
    outlineStyle: 'none' as any,
  },
  fullAddressWrapper: {
    backgroundColor: Colors.lightBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
    padding: 12,
    marginBottom: 16,
  },
  fullAddressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray600,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fullAddressInput: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  mapHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  nativeMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  nativeMapText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  mapCoordsBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  mapCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
