import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { InputField } from '@/components/ui/InputField';
import { WorkingHoursPicker } from '@/components/ui/WorkingHoursPicker';
import { ShopAddressMapPicker } from '@/components/ui/ShopAddressMapPicker';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Motorcycles / Bike', icon: 'bicycle-outline' as const },
  { id: 'scooty', label: 'Scooter / Scooty', icon: 'speedometer-outline' as const },
  { id: 'car', label: 'Car / 4-Wheeler', icon: 'car-outline' as const },
];

export default function ShopInfoScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';
  const { data, updateData, goToNextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['bike', 'scooty']);

  const toggleVehicle = (id: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (!data.shopName || data.shopName.trim() === '') {
      Alert.alert('Compulsory Field', 'Please enter your Workshop / Garage Name');
      return;
    }
    if (!data.shopAddress || data.shopAddress.trim() === '') {
      Alert.alert('Compulsory Field', 'Please enter your full Workshop Address');
      return;
    }
    if (selectedVehicles.length === 0) {
      Alert.alert('Compulsory Selection', 'Please select at least one vehicle type your garage services (Bike, Scooty, Car)');
      return;
    }

    try {
      setLoading(true);
      updateData({ hasShop: true });

      await api.post('/mechanics/onboarding/shop-details', {
        hasShop: true,
        shopName: data.shopName.trim(),
        shopAddress: data.shopAddress.trim(),
      });

      goToNextStep('SHOP_DETAILS', router, isEditing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save shop details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Shop / Garage Details" showBack stepCode="SHOP_DETAILS" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Compulsory Shop Notice Banner */}
        <View style={styles.noticeBanner}>
          <View style={styles.noticeIconBox}>
            <Ionicons name="business" size={24} color={Colors.primary} />
          </View>
          <View style={styles.noticeTextBox}>
            <Text style={styles.noticeTitle}>Workshop Required (Compulsory)</Text>
            <Text style={styles.noticeDesc}>
              A verified garage or workshop is required to service Bike, Scooty & Car orders on MyKaarigar Partner.
            </Text>
          </View>
        </View>

        {/* Vehicles Serviced Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicles Serviced at Garage *</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((v) => {
              const isSelected = selectedVehicles.includes(v.id);
              return (
                <TouchableOpacity
                  key={v.id}
                  activeOpacity={0.8}
                  onPress={() => toggleVehicle(v.id)}
                  style={[
                    styles.vehicleCard,
                    Shadows.small,
                    isSelected && styles.vehicleCardSelected,
                  ]}
                >
                  <Ionicons
                    name={v.icon}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.gray500}
                  />
                  <Text style={[styles.vehicleLabel, isSelected && styles.vehicleLabelSelected]}>
                    {v.label}
                  </Text>
                  {isSelected ? (
                    <View style={styles.vehicleCheckBadge}>
                      <Ionicons name="checkmark" size={12} color={Colors.textWhite} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <InputField
          label="Shop / Garage Name *"
          placeholder="e.g. Rahul Auto Care & Garage"
          value={data.shopName}
          onChangeText={(val) => updateData({ shopName: val })}
          icon="storefront-outline"
        />

        {/* Interactive Working Hours Selector */}
        <WorkingHoursPicker
          value={data.workingHours || '09:00 AM To 08:30 PM (Mon - Sat)'}
          onChange={(val) => updateData({ workingHours: val })}
        />

        {/* Searchable Shop Address & Google Map Location Picker */}
        <ShopAddressMapPicker
          address={data.shopAddress}
          onAddressChange={(fullAddress) => updateData({ shopAddress: fullAddress })}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={loading ? "Saving..." : "Save & Continue"} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeTextBox: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 12,
    color: Colors.gray700,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  vehicleRow: {
    gap: 10,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    gap: 12,
  },
  vehicleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  vehicleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  vehicleLabelSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  vehicleCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
  },
});
