import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function WaitingForApprovalScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Poll status every 8 seconds to auto-redirect when Admin approves
    const interval = setInterval(() => {
      checkStatus(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async (silent = false) => {
    try {
      if (!silent) setChecking(true);
      const res: any = await api.get('/mechanics/onboarding');

      if (res && (res.overallStatus === 'ACTIVE' || res.overallStatus === 'APPROVED')) {
        router.replace('/(tabs)' as any);
      } else if (!silent) {
        Alert.alert('Verification in Progress', 'Your profile is currently under review by our admin team. You will be automatically redirected as soon as it is approved.');
      }
    } catch (err) {
      console.warn('Status check failed:', err);
    } finally {
      if (!silent) setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Under Review Badge */}
        <View style={styles.badgeOuter}>
          <View style={[styles.badgeInner, Shadows.medium]}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.primary} />
            <View style={styles.clockIconBadge}>
              <Ionicons name="time" size={26} color="#E65100" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your profile is under review</Text>
        <Text style={styles.subtitle}>
          Our team is verifying your documents and details. You will automatically be granted access to the Dashboard once approved.
        </Text>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => checkStatus(false)}>
          <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
          <Text style={styles.refreshBtnText}>Check Approval Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={checking ? "Checking..." : "Refresh Status"}
          onPress={() => checkStatus(false)}
        />
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
    paddingTop: 80,
    paddingBottom: 34,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  badgeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clockIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.cardBackground,
    borderRadius: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    width: '100%',
  },
});
