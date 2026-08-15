import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from '../ui/MapView';
import {
  fetchCurrentLocation,
  reverseGeocodeLocation,
  searchPlaces,
  UserLocationData,
} from '../../services/locationService';
import { vehicleService } from '../../services/vehicleService';
import { POPULAR_NOIDA_HUBS, checkServiceability } from '../../utils/geoUtils';

interface LocationPickerModalProps {
  visible: boolean;
  initialLocation: UserLocationData | null;
  onClose: () => void;
  onSelectLocation: (location: UserLocationData, isServiceable: boolean) => void;
}

const { width, height } = Dimensions.get('window');

export default function LocationPickerModal({
  visible,
  initialLocation,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Selected Pin Coordinates & Address
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLocation?.latitude || 28.5708,
    longitude: initialLocation?.longitude || 77.3260,
  });
  const [currentAddress, setCurrentAddress] = useState<UserLocationData | null>(initialLocation);
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [serviceableMessage, setServiceableMessage] = useState<string>('Checking serviceability...');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(true);

  const debounceTimerRef = useRef<any>(null);

  // Sync initial location when modal opens
  useEffect(() => {
    if (visible && initialLocation) {
      setSelectedCoords({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      setCurrentAddress(initialLocation);
      verifyServiceability(initialLocation.latitude, initialLocation.longitude, initialLocation.shortAddress);
    }
  }, [visible, initialLocation]);

  // Check serviceability against dynamic Backend & Local Geo-Fencing
  const verifyServiceability = async (lat: number, lng: number, addressStr?: string) => {
    try {
      const res = await vehicleService.checkServiceability(undefined, lat, lng, addressStr);
      if (res && res.isServiceable !== undefined) {
        setIsServiceable(res.isServiceable);
        setServiceableMessage(
          res.isServiceable
            ? `✅ We are operational in ${res.areaName || res.city || 'this zone'}!`
            : `⚠️ Currently not serviceable. We operate exclusively in Noida & Gr. Noida.`
        );
        return;
      }
    } catch (e) {
      // Fallback to local geo-check
    }
    const localRes = checkServiceability({ latitude: lat, longitude: lng, shortAddress: addressStr });
    setIsServiceable(localRes.isServiceable);
    setServiceableMessage(
      localRes.isServiceable
        ? `✅ We are operational in Noida & Gr. Noida!`
        : `⚠️ Currently not serviceable in ${localRes.city}. We operate exclusively in Noida.`
    );
  };

  // Search input handler
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!text || text.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(text);
        setSearchResults(places);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  // Pick search result
  const handleSelectSearchResult = async (place: any) => {
    setSearchQuery('');
    setSearchResults([]);
    const lat = place.latitude;
    const lng = place.longitude;

    setSelectedCoords({ latitude: lat, longitude: lng });

    const addr: UserLocationData = {
      latitude: lat,
      longitude: lng,
      area: place.name || '',
      city: place.city || 'Noida',
      region: 'Uttar Pradesh',
      postalCode: place.postalCode || '',
      shortAddress: place.shortAddress || place.name,
      fullAddress: place.fullAddress,
    };
    setCurrentAddress(addr);
    verifyServiceability(lat, lng, addr.fullAddress);
  };

  // Use GPS location
  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const res = await fetchCurrentLocation();
      if (res.success && res.location) {
        setSelectedCoords({
          latitude: res.location.latitude,
          longitude: res.location.longitude,
        });
        setCurrentAddress(res.location);
        verifyServiceability(res.location.latitude, res.location.longitude, res.location.fullAddress);
      }
    } finally {
      setGpsLoading(false);
    }
  };

  // Map drag / region change handler (Handpick)
  const handleRegionChangeComplete = async (region: any) => {
    if (!region || !region.latitude || !region.longitude) return;

    // Only update if moved more than slight jitter (~20m)
    const latDiff = Math.abs(region.latitude - selectedCoords.latitude);
    const lngDiff = Math.abs(region.longitude - selectedCoords.longitude);
    if (latDiff < 0.0002 && lngDiff < 0.0002) return;

    setSelectedCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });

    setIsGeocoding(true);
    try {
      const reverseLoc = await reverseGeocodeLocation(region.latitude, region.longitude);
      if (reverseLoc) {
        setCurrentAddress(reverseLoc);
        verifyServiceability(region.latitude, region.longitude, reverseLoc.fullAddress);
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Select popular Noida Hub
  const handleSelectNoidaHub = (hub: typeof POPULAR_NOIDA_HUBS[0]) => {
    const lat = hub.latitude;
    const lng = hub.longitude;
    setSelectedCoords({ latitude: lat, longitude: lng });

    const loc: UserLocationData = {
      latitude: lat,
      longitude: lng,
      area: hub.name,
      city: 'Noida',
      region: 'Uttar Pradesh',
      postalCode: '201301',
      shortAddress: hub.name,
      fullAddress: `${hub.name}, ${hub.landmark}, Uttar Pradesh 201301`,
    };
    setCurrentAddress(loc);
    setIsServiceable(true);
    setServiceableMessage('✅ Selected active Noida service hub!');
  };

  const handleConfirm = () => {
    if (!currentAddress) return;
    onSelectLocation(currentAddress, isServiceable);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Delivery Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search area, landmark, or pincode..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Feather name="x" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
            {searching && <ActivityIndicator size="small" color="#ea580c" style={{ marginLeft: 4 }} />}
          </View>
        </View>

        {/* Search Results Dropdown List */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <View style={styles.searchResultIcon}>
                    <Feather name="map-pin" size={16} color="#ea580c" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchResultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.searchResultAddress} numberOfLines={2}>{item.fullAddress}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* "Use Current Location" GPS Bar */}
        <TouchableOpacity
          style={styles.gpsBar}
          onPress={handleUseCurrentLocation}
          disabled={gpsLoading}
          activeOpacity={0.7}
        >
          <View style={styles.gpsIconCircle}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color="#ea580c" />
            ) : (
              <Feather name="crosshair" size={18} color="#ea580c" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>Use Current Location</Text>
            <Text style={styles.gpsSub}>Enable GPS to detect your exact live address</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Interactive Handpick Map */}
        <View style={styles.mapWrapper}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: selectedCoords.latitude,
              longitude: selectedCoords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            region={{
              latitude: selectedCoords.latitude,
              longitude: selectedCoords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
          >
            <Marker coordinate={selectedCoords} title="Selected Location" />
          </MapView>

          {/* Central Target Pin Overlay (Handpick) */}
          <View style={styles.centerPinContainer} pointerEvents="none">
            <View style={styles.pinBubble}>
              <Text style={styles.pinBubbleText}>
                {isGeocoding ? 'Locating...' : 'Drag map to pin'}
              </Text>
            </View>
            <Ionicons name="location" size={38} color="#ea580c" />
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* Popular Noida Hubs Quick Carousel */}
        <View style={styles.hubsRowContainer}>
          <Text style={styles.hubsTitle}>Popular Noida Hubs:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubsScroll}>
            {POPULAR_NOIDA_HUBS.map((hub, i) => (
              <TouchableOpacity
                key={i}
                style={styles.hubChip}
                onPress={() => handleSelectNoidaHub(hub)}
                activeOpacity={0.7}
              >
                <Feather name="map-pin" size={12} color="#ea580c" />
                <Text style={styles.hubChipText}>{hub.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Address Confirmation Sheet */}
        <View style={styles.bottomCard}>
          {/* Serviceability Banner */}
          <View style={[styles.serviceStatusBanner, isServiceable ? styles.bannerServiceable : styles.bannerUnserviceable]}>
            <Text style={[styles.serviceStatusText, { color: isServiceable ? '#166534' : '#991b1b' }]}>
              {serviceableMessage}
            </Text>
          </View>

          {/* Selected Address Display */}
          <View style={styles.addressInfoRow}>
            <View style={styles.addressPinCircle}>
              <Feather name="map-pin" size={18} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitleText} numberOfLines={1}>
                {currentAddress?.shortAddress || 'Selected Location'}
              </Text>
              <Text style={styles.addressSubText} numberOfLines={2}>
                {currentAddress?.fullAddress || `${selectedCoords.latitude.toFixed(4)}, ${selectedCoords.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, !isServiceable && styles.confirmBtnWarning]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>
              {isServiceable ? 'Confirm Location' : 'Confirm Location (Outside Noida)'}
            </Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 110,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  searchResultAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff7ed',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fed7aa',
    gap: 12,
  },
  gpsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9a3412',
  },
  gpsSub: {
    fontSize: 11,
    color: '#c2410c',
    marginTop: 1,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerPinContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -19,
    marginTop: -38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubble: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: -4,
  },
  pinBubbleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: -2,
  },
  hubsRowContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  hubsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 6,
  },
  hubsScroll: {
    gap: 8,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  hubChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  serviceStatusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  bannerServiceable: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  bannerUnserviceable: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  addressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  addressPinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  addressSubText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: '#ea580c',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmBtnWarning: {
    backgroundColor: '#d97706',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
