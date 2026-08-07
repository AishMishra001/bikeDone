import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

const EXPERIENCE_OPTIONS = ['1 Year', '2 Years', '3 Years', '5 Years', '5+ Years', '10+ Years'];

export default function BasicDetailsScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [showExpModal, setShowExpModal] = useState(false);

  const handleContinue = () => {
    if (!data.fullName) {
      alert('Please enter your full name');
      return;
    }
    router.push('/onboarding/shop-type' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Basic Details" showBack step={1} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Please provide your basic information</Text>

        <InputField
          label="Full Name"
          placeholder="Rahul Kumar"
          value={data.fullName}
          onChangeText={(val) => updateData({ fullName: val })}
          icon="person-outline"
        />

        {/* Experience Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Experience</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowExpModal(true)}
            style={styles.dropdownTrigger}
          >
            <Ionicons name="briefcase-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.dropdownText}>{data.experience || 'Select Experience'}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Profile Photo Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Profile Photo</Text>
          <View style={styles.avatarRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                updateData({
                  profilePhoto:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
                })
              }
              style={[styles.avatarBox, Shadows.small]}
            >
              {data.profilePhoto ? (
                <Image source={{ uri: data.profilePhoto }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={44} color={Colors.gray400} />
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={Colors.textWhite} />
              </View>
            </TouchableOpacity>
            <View style={styles.photoInfo}>
              <Text style={styles.photoTitle}>Upload clear headshot</Text>
              <Text style={styles.photoDesc}>JPEG or PNG. Max size 5MB.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>

      {/* Experience Selector Modal */}
      <Modal visible={showExpModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowExpModal(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Experience</Text>
            {EXPERIENCE_OPTIONS.map((exp) => (
              <TouchableOpacity
                key={exp}
                style={[
                  styles.optionRow,
                  data.experience === exp && styles.optionRowSelected,
                ]}
                onPress={() => {
                  updateData({ experience: exp });
                  setShowExpModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    data.experience === exp && styles.optionTextSelected,
                  ]}
                >
                  {exp}
                </Text>
                {data.experience === exp ? (
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
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 20,
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  photoDesc: {
    fontSize: 12,
    color: Colors.gray400,
    marginTop: 2,
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
