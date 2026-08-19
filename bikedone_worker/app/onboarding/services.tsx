import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { ChipTag } from '@/components/ui/ChipTag';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

const ALL_SERVICES = [
  'General Service',
  'Engine Repair',
  'Brake Repair',
  'Electrical & Battery',
  'Tyre & Wheel',
  'Oil Change',
  'Washing & Polishing',
  'Breakdown Support',
];

export default function ServicesScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';
  const { data, updateData, toggleService, goToNextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const isAllSelected = ALL_SERVICES.every((s) => data.services.includes(s));

  const handleSelectAll = () => {
    if (isAllSelected) {
      updateData({ services: [] });
    } else {
      updateData({ services: [...ALL_SERVICES] });
    }
  };

  const handleContinue = async () => {
    if (data.services.length === 0) {
      Alert.alert('Compulsory Selection', 'Please select at least one service offered');
      return;
    }

    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/service-categories', {
        selectAll: isAllSelected,
        services: data.services,
      });

      goToNextStep('SERVICE_CATEGORIES', router, isEditing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save service categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Services Offered" showBack stepCode="SERVICE_CATEGORIES" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Select services you provide</Text>
          <TouchableOpacity style={styles.selectAllBtn} onPress={handleSelectAll}>
            <Ionicons
              name={isAllSelected ? 'checkbox' : 'square-outline'}
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.selectAllText}>Select All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {ALL_SERVICES.map((srv) => (
            <ChipTag
              key={srv}
              label={srv}
              variant="checkbox"
              selected={data.services.includes(srv)}
              onPress={() => toggleService(srv)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={loading ? "Saving..." : "Continue"} onPress={handleContinue} />
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  list: {
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
