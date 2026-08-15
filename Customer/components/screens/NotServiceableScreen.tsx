import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { POPULAR_NOIDA_HUBS, ServiceabilityResult } from '../../utils/geoUtils';
import { UserLocationData } from '../../services/locationService';
import { vehicleService } from '../../services/vehicleService';

interface HubItem {
  name: string;
  landmark: string;
  latitude: number;
  longitude: number;
  pincode?: string;
}

interface NotServiceableScreenProps {
  detectedLocation?: UserLocationData | null;
  serviceabilityResult?: ServiceabilityResult | null;
  onRefreshLocation: () => Promise<void>;
  onSelectNoidaHub: (hub: HubItem) => void;
  onLogout?: () => void;
}

export default function NotServiceableScreen({
  detectedLocation,
  serviceabilityResult,
  onRefreshLocation,
  onSelectNoidaHub,
  onLogout,
}: NotServiceableScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [phone, setPhone] = useState('');
  const [notified, setNotified] = useState(false);
  const [dynamicHubs, setDynamicHubs] = useState<HubItem[]>(POPULAR_NOIDA_HUBS);

  useEffect(() => {
    vehicleService.getActiveServiceableZones()
      .then((zones) => {
        if (Array.isArray(zones) && zones.length > 0) {
          const mapped: HubItem[] = zones.map((z) => ({
            name: z.areaName || `${z.city} (${z.pincode})`,
            landmark: `Pincode ${z.pincode} • ${z.city}`,
            latitude: z.latitude || 28.5708,
            longitude: z.longitude || 77.3260,
            pincode: z.pincode,
          }));
          setDynamicHubs(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshLocation();
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotifyMe = () => {
    if (!phone || phone.trim().length < 10) {
      Alert.alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setNotified(true);
    Alert.alert(
      'Notification Saved!',
      `Thank you! We will notify you at ${phone} as soon as MyKaarigar services launch in ${serviceabilityResult?.city || 'your area'}.`
    );
  };

  const currentDisplayAddress =
    detectedLocation?.shortAddress ||
    detectedLocation?.area ||
    detectedLocation?.city ||
    serviceabilityResult?.city ||
    'Outside Noida';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header & Logout */}
        <View style={styles.headerRow}>
          <View style={styles.logoBadge}>
            <FontAwesome5 name="motorcycle" size={18} color="#ea580c" />
            <Text style={styles.logoText}>MyKaarigar</Text>
          </View>
          {onLogout && (
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Feather name="log-out" size={16} color="#6b7280" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Visual Banner */}
        <View style={styles.heroCard}>
          <View style={styles.pinCircleOuter}>
            <View style={styles.pinCircleInner}>
              <Feather name="map-pin" size={32} color="#ea580c" />
            </View>
          </View>

          <Text style={styles.heroTitle}>Not Serviceable in Your Area Yet</Text>
          <Text style={styles.heroSubtitle}>
            MyKaarigar is currently operational exclusively in{' '}
            <Text style={{ fontWeight: '800', color: '#ea580c' }}>Noida & Greater Noida</Text>. We are expanding to other cities very soon!
          </Text>

          {/* Detected Location Box */}
          <View style={styles.detectedBox}>
            <View style={styles.detectedIconCircle}>
              <Feather name="navigation" size={14} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detectedLabel}>DETECTED LOCATION</Text>
              <Text style={styles.detectedText} numberOfLines={2}>
                {currentDisplayAddress}
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#ea580c" />
              ) : (
                <Feather name="rotate-cw" size={16} color="#ea580c" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Switch to Noida Location (For Testing / Booking in Noida) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.sectionTitle}>Select a Noida Location</Text>
          </View>
          <Text style={styles.sectionSub}>
            Want to book a breakdown service or test the app in our active service zone? Tap any Noida hub below:
          </Text>

          <View style={styles.hubsList}>
            {dynamicHubs.map((hub, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.hubItem}
                onPress={() => onSelectNoidaHub(hub)}
                activeOpacity={0.7}
              >
                <View style={styles.hubIconBox}>
                  <Feather name="map-pin" size={16} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hubName}>{hub.name}</Text>
                  <Text style={styles.hubLandmark}>{hub.landmark}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notify Me Form */}
        <View style={styles.notifyCard}>
          <View style={styles.notifyHeader}>
            <Feather name="bell" size={18} color="#2563eb" />
            <Text style={styles.notifyTitle}>Get Notified in Your City</Text>
          </View>
          <Text style={styles.notifySub}>
            Drop your number and we'll alert you with early-bird discounts when we launch in {serviceabilityResult?.city || 'your city'}!
          </Text>

          {notified ? (
            <View style={styles.notifiedSuccessBox}>
              <Feather name="check" size={16} color="#16a34a" />
              <Text style={styles.notifiedSuccessText}>We will notify you upon launch!</Text>
            </View>
          ) : (
            <View style={styles.notifyInputRow}>
              <TextInput
                style={styles.notifyInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
              <TouchableOpacity style={styles.notifySubmitBtn} onPress={handleNotifyMe}>
                <Text style={styles.notifySubmitText}>Notify Me</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  pinCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pinCircleInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDBA74',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  detectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detectedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  hubsList: {
    gap: 10,
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  hubIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  hubLandmark: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  notifyCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  notifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  notifyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  notifySub: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
    marginBottom: 14,
  },
  notifyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  notifyInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    height: 44,
  },
  notifySubmitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  notifySubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  notifiedSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  notifiedSuccessText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },
});
