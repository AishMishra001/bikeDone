import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { ChipTag } from '@/components/ui/ChipTag';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';

const ALL_SERVICES = [
  'Routine Service',
  'Repair',
  'Inspection',
  'Breakdown Assistance',
  'Customization',
];

export default function ServicesScreen() {
  const router = useRouter();
  const { data, toggleService } = useOnboarding();

  const handleContinue = () => {
    if (data.services.length === 0) {
      alert('Please select at least one service offered');
      return;
    }
    router.push('/onboarding/expertise' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Services Offered" showBack step={4} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Select services you provide</Text>

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
