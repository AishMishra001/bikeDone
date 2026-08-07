import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { ChipTag } from '@/components/ui/ChipTag';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';

const EXPERTISE_CATEGORIES = [
  'Engine',
  'Brakes',
  'Battery',
  'Electrical',
  'Tyres',
  'Suspension',
  'Clutch',
  'General Service',
];

export default function ExpertiseScreen() {
  const router = useRouter();
  const { data, toggleExpertise } = useOnboarding();

  const handleContinue = () => {
    if (data.expertise.length === 0) {
      alert('Please select at least one expertise category');
      return;
    }
    router.push('/onboarding/radius' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Expertise / Categories" showBack step={5} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Select your expertise categories</Text>

        <View style={styles.grid}>
          {EXPERTISE_CATEGORIES.map((cat) => (
            <ChipTag
              key={cat}
              label={cat}
              variant="pill"
              selected={data.expertise.includes(cat)}
              onPress={() => toggleExpertise(cat)}
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
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
