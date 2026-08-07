import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding/mobile' as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => router.replace('/onboarding/mobile' as any)}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        {/* Bike Logo Graphic */}
        <View style={styles.logoCircle}>
          <Ionicons name="bicycle" size={60} color={Colors.primary} />
        </View>

        <Text style={styles.brandTitle}>
          BIKE <Text style={{ color: Colors.primary }}>DONE</Text>
        </Text>
        <Text style={styles.partnerSubtitle}>PARTNER</Text>
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
    backgroundColor: 'rgba(242, 86, 29, 0.1)',
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
