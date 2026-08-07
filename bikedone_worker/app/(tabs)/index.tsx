import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/context/OnboardingContext';

export default function DashboardHomeScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoRow}>
          <View style={styles.partnerBadge}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.greetingText}>Dashboard (Home)</Text>
            <Text style={styles.partnerName}>{data.fullName || 'Rahul Kumar'}</Text>
          </View>
        </View>

        {/* Online Toggle Switch */}
        <View style={styles.onlineStatusRow}>
          <Text style={styles.onlineText}>
            {isOnline ? 'You are Online' : 'You are Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: Colors.gray300, true: Colors.success }}
            thumbColor={Colors.textWhite}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Restart Flow banner link */}
        <TouchableOpacity
          style={styles.restartBanner}
          onPress={() => router.replace('/onboarding/splash' as any)}
        >
          <Ionicons name="refresh-circle" size={20} color={Colors.primary} />
          <Text style={styles.restartBannerText}>Restart Onboarding Wizard (Steps 1-14)</Text>
        </TouchableOpacity>

        {/* Today's Earnings Card */}
        <View style={[styles.earningsCard, Shadows.small]}>
          <View style={styles.earningsTop}>
            <View>
              <Text style={styles.earningsLabel}>Today's Earnings</Text>
              <Text style={styles.earningsAmount}>₹ 0</Text>
              <Text style={styles.jobsCompletedText}>0 Jobs Completed</Text>
            </View>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet-outline" size={32} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, Shadows.small]}>
            <Text style={styles.metricLabel}>New Requests</Text>
            <Text style={styles.metricValue}>0</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <Text style={styles.metricLabel}>Ongoing Jobs</Text>
            <Text style={styles.metricValue}>0</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <Text style={styles.metricLabel}>Completed Jobs</Text>
            <Text style={styles.metricValue}>0</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <Text style={styles.metricLabel}>Cancelled Jobs</Text>
            <Text style={styles.metricValue}>0</Text>
          </View>
        </View>

        {/* Today's Schedule Section */}
        <View style={[styles.scheduleCard, Shadows.small]}>
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
          <View style={styles.emptyScheduleBox}>
            <Ionicons name="calendar-outline" size={40} color={Colors.gray400} />
            <Text style={styles.emptyScheduleText}>No jobs for today</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  topHeader: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  partnerBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  partnerName: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '500',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  scrollContent: {
    padding: 20,
  },
  restartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  restartBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  earningsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  earningsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 13,
    color: Colors.gray400,
    fontWeight: '600',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textWhite,
    marginVertical: 4,
  },
  jobsCompletedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  walletIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.gray500,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 8,
  },
  scheduleCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  emptyScheduleBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyScheduleText: {
    fontSize: 14,
    color: Colors.gray400,
    marginTop: 8,
    fontWeight: '500',
  },
});
