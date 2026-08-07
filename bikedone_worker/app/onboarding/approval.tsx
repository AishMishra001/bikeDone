import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

export default function WaitingForApprovalScreen() {
  const router = useRouter();

  const handleGoToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Under Review Illustration Badge */}
        <View style={styles.badgeOuter}>
          <View style={[styles.badgeInner, Shadows.medium]}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.accentBlue} />
            <View style={styles.clockIconBadge}>
              <Ionicons name="time" size={24} color={Colors.warning} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your profile is under review</Text>
        <Text style={styles.subtitle}>
          We will notify you once your profile is approved.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Go to Home" onPress={handleGoToHome} />
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
    backgroundColor: Colors.accentBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
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
    borderRadius: 12,
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
  },
  footer: {
    width: '100%',
  },
});
