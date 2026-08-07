import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { InputField } from '@/components/ui/InputField';
import { MapPickerMock } from '@/components/ui/MapPickerMock';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

const WORKING_HOURS_OPTIONS = [
  '08:00 AM To 06:00 PM',
  '09:00 AM To 07:00 PM',
  '10:00 AM To 8:00 PM',
  '10:00 AM To 9:00 PM',
  '24 Hours Open',
];

export default function ShopInfoScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [showHoursModal, setShowHoursModal] = useState(false);

  const handleContinue = () => {
    if (!data.shopName || !data.shopAddress) {
      alert('Please enter shop details');
      return;
    }
    router.push('/onboarding/services' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Shop Information" showBack step={3} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InputField
          label="Shop Name"
          placeholder="Rahul Bike Garage"
          value={data.shopName}
          onChangeText={(val) => updateData({ shopName: val })}
          icon="storefront-outline"
        />

        <InputField
          label="Shop Address"
          placeholder="123, Sharma Market, Laxmi Nagar, Delhi - 110092"
          value={data.shopAddress}
          onChangeText={(val) => updateData({ shopAddress: val })}
          multiline
          icon="location-outline"
        />

        <MapPickerMock currentAddress={data.shopAddress} />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Working Hours</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowHoursModal(true)}
            style={styles.dropdownTrigger}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.dropdownText}>{data.workingHours || 'Select Hours'}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>

      {/* Hours Selector Modal */}
      <Modal visible={showHoursModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowHoursModal(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Working Hours</Text>
            {WORKING_HOURS_OPTIONS.map((hrs) => (
              <TouchableOpacity
                key={hrs}
                style={[
                  styles.optionRow,
                  data.workingHours === hrs && styles.optionRowSelected,
                ]}
                onPress={() => {
                  updateData({ workingHours: hrs });
                  setShowHoursModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    data.workingHours === hrs && styles.optionTextSelected,
                  ]}
                >
                  {hrs}
                </Text>
                {data.workingHours === hrs ? (
                  <Ionicons name="checkmark" size={18} color={Colors.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.cardBackground,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  optionRowSelected: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
