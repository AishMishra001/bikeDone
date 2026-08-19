import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { api, tokenStorage } from '@/services/api';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAppSession();
  }, []);

  const checkAppSession = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        // No token -> go to mobile screen for login
        router.replace('/onboarding/mobile' as any);
        return;
      }

      // Token exists -> Fetch mechanic onboarding status
      const res: any = await api.get('/mechanics/onboarding');

      const isManualVerificationCompleted = res?.steps?.some(
        (s: any) => s.stepCode === 'MANUAL_VERIFICATION' && (s.status === 'COMPLETED' || s.status === 'UNDER_REVIEW')
      );
      const isUnderReview =
        isManualVerificationCompleted ||
        res?.progressPercentage === 100 ||
        res?.overallStatus === 'UNDER_REVIEW' ||
        res?.overallStatus === 'SUBMITTED' ||
        res?.overallStatus === 'MANUAL_VERIFICATION' ||
        res?.overallStatus === 'PENDING_APPROVAL';

      if (res && (res.overallStatus === 'ACTIVE' || res.overallStatus === 'APPROVED')) {
        // Fully approved mechanic -> Go to Dashboard (Tabs)
        router.replace('/(tabs)' as any);
      } else if (isUnderReview) {
        // Submitted & Waiting for Admin Approval
        router.replace('/onboarding/approval' as any);
      } else {
        // In Progress -> Navigate to Welcome / resume target step
        router.replace('/onboarding/welcome' as any);
      }
    } catch (err) {
      console.warn('Session check failed or token expired:', err);
      await tokenStorage.clear();
      router.replace('/onboarding/mobile' as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={checkAppSession}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        {/* Bike Logo Graphic */}
        <View style={styles.logoCircle}>
          <Ionicons name="bicycle" size={60} color={Colors.primary} />
        </View>

        <Text style={styles.brandTitle}>
          MyKaarigar <Text style={{ color: Colors.primary }}>Partner</Text>
        </Text>
        <Text style={styles.partnerSubtitle}>EXPERT WORKSHOP NETWORK</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tagline}>Your Work. Our Priority.</Text>
        <Text style={styles.tapNotice}>Tap anywhere to continue</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splashBackground,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textWhite,
    letterSpacing: 2,
  },
  partnerSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray400,
    letterSpacing: 4,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray400,
    letterSpacing: 0.5,
  },
  tapNotice: {
    fontSize: 11,
    color: Colors.gray600,
    marginTop: 8,
  },
});
