import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useOnboarding } from '@/context/OnboardingContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [nextStepPath, setNextStepPath] = useState('/onboarding/basic-details');

  useEffect(() => {
    fetchJourneyProgress();
  }, []);

  const fetchJourneyProgress = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/mechanics/onboarding');
      if (res && res.currentStepCode) {
        const stepMap: Record<string, string> = {
          BASIC_DETAILS: '/onboarding/basic-details',
          SHOP_DETAILS: '/onboarding/shop-type',
          SERVICE_CATEGORIES: '/onboarding/services',
          DOCUMENTS: '/onboarding/documents',
          BANK_DETAILS: '/onboarding/bank-details',
          MANUAL_VERIFICATION: '/onboarding/approval',
        };
        const targetPath = stepMap[res.currentStepCode] || '/onboarding/basic-details';
        setNextStepPath(targetPath);
      }
    } catch (err: any) {
      console.warn('Failed to fetch journey progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.push(nextStepPath as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Mechanic Artwork Box */}
        <View style={styles.illustrationContainer}>
          <View style={styles.gearBg}>
            <Ionicons name="settings-outline" size={140} color="rgba(242, 86, 29, 0.08)" />
          </View>

          <View style={[styles.avatarCircle, Shadows.medium]}>
            <Ionicons name="person-circle-outline" size={110} color={Colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>Welcome Aboard!</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile to start receiving service requests.
        </Text>
      </View>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <PrimaryButton title="Get Started" onPress={handleGetStarted} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 34,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    position: 'relative',
  },
  gearBg: {
    position: 'absolute',
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footer: {
    width: '100%',
  },
});
