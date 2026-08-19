import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';

const RADIUS_OPTIONS = ['3 KM', '5 KM', '10 KM', '15 KM', '20 KM'];

export default function ServiceRadiusScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';
  const { data, updateData, goToNextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      const numericRadius = parseInt(data.serviceRadius.replace(/[^0-9]/g, ''), 10) || 10;
      await api.post('/mechanics/onboarding/service-radius', {
        radiusKm: Math.min(numericRadius, 20),
      });

      goToNextStep('SERVICE_RADIUS', router, isEditing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save service radius');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Service Radius" showBack stepCode="SERVICE_RADIUS" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>How far are you willing to travel?</Text>
        <Text style={styles.subtitle}>
          You will receive service requests within this radius (Max 20 KM).
        </Text>

        <View style={styles.optionsList}>
          {RADIUS_OPTIONS.map((rad) => (
            <SelectionCard
              key={rad}
              title={rad}
              selected={data.serviceRadius === rad}
              onSelect={() => updateData({ serviceRadius: rad })}
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
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsList: {
    gap: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
