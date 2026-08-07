import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';

const RADIUS_OPTIONS = ['3 KM', '5 KM', '10 KM', '15 KM', '20 KM'];

export default function ServiceRadiusScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleContinue = () => {
    router.push('/onboarding/documents' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Service Radius" showBack step={6} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>How far are you willing to travel?</Text>
        <Text style={styles.subtitle}>
          You will receive service requests within this radius.
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
        <PrimaryButton title="Continue" onPress={handleContinue} />
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
