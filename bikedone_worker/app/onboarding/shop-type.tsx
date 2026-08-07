import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';

export default function ShopTypeScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleContinue = () => {
    if (data.hasShop) {
      router.push('/onboarding/shop-info' as any);
    } else {
      router.push('/onboarding/services' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Shop Details" showBack step={2} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Do you have a shop?</Text>
        <Text style={styles.subtitle}>This helps us to show better service requests.</Text>

        <View style={styles.optionsContainer}>
          <SelectionCard
            title="Yes, I have a shop"
            selected={data.hasShop === true}
            onSelect={() => updateData({ hasShop: true })}
            icon="business-outline"
          />

          <SelectionCard
            title="No, I am a mobile mechanic"
            selected={data.hasShop === false}
            onSelect={() => updateData({ hasShop: false })}
            icon="build-outline"
          />
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
