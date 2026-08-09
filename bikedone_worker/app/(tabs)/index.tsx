import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/context/OnboardingContext';
import { api, tokenStorage } from '@/services/api';
import { IncomingJobModal } from '@/components/IncomingJobModal';
import { WalletActivationModal } from '@/components/WalletActivationModal';
import { dispatchService, IncomingJobRequest } from '@/services/dispatchService';
import { walletService, WalletData } from '@/services/walletService';

export default function DashboardHomeScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [isOnline, setIsOnline] = useState(false);
  const [mechanicData, setMechanicData] = useState<any>(null);
  const [incomingJob, setIncomingJob] = useState<IncomingJobRequest | null>(null);
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(new Set());
  const [activeAcceptedJob, setActiveAcceptedJob] = useState<any>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
    fetchActiveJob();
  }, []);

  const getMechanicId = () => {
    return mechanicData?.id || mechanicData?.mechanicId || '4043b9cd-bb8d-495d-af42-6305d72133c6';
  };

  useEffect(() => {
    if (!isOnline) return;
    const mechanicId = getMechanicId();

    const sendLocationPing = () => {
      dispatchService.updateLocation(mechanicId, 28.6139, 77.2090, true).catch(() => {});
    };

    const checkPendingNotifications = async () => {
      if (incomingJob) return;
      const notif = await dispatchService.getPendingNotification(mechanicId);
      if (notif && notif.requestId && !dismissedJobIds.has(notif.requestId)) {
        setIncomingJob(notif);
      }
    };

    sendLocationPing();
    checkPendingNotifications();

    const locInterval = setInterval(sendLocationPing, 15000);
    const notifInterval = setInterval(checkPendingNotifications, 3000);
    const activeJobInterval = setInterval(fetchActiveJob, 5000);

    return () => {
      clearInterval(locInterval);
      clearInterval(notifInterval);
      clearInterval(activeJobInterval);
    };
  }, [isOnline, mechanicData, incomingJob]);

  const fetchActiveJob = async () => {
    const mechanicId = getMechanicId();
    if (!mechanicId) return;
    try {
      const activeJob = await dispatchService.getActiveJob(mechanicId);
      if (activeJob && activeJob.id) {
        setActiveAcceptedJob(activeJob);
      } else {
        setActiveAcceptedJob(null);
      }
    } catch (e) {
      setActiveAcceptedJob(null);
    }
  };

  const fetchProfile = async () => {
    try {
      const storedMechanic = await tokenStorage.getMechanic();
      const res = await api.get('/mechanics/onboarding');
      const mergedData = { ...(storedMechanic || {}), ...(res || {}) };
      setMechanicData(mergedData);

      const targetId = (mergedData as any)?.id || (mergedData as any)?.mechanicId || '4043b9cd-bb8d-495d-af42-6305d72133c6';
      
      // Fetch Location & Wallet Status
      const [locData, walletRes] = await Promise.all([
        dispatchService.getLocation(targetId),
        walletService.getMyWallet(targetId),
      ]);

      if (walletRes) {
        setWallet(walletRes);
      }

      if (locData && locData.isOnline !== undefined) {
        setIsOnline(Boolean(locData.isOnline));
      }
    } catch (e) {
      const storedMechanic = await tokenStorage.getMechanic();
      if (storedMechanic) setMechanicData(storedMechanic);
    }
  };

  const handleToggleOnline = async (newValue: boolean) => {
    const mechanicId = getMechanicId();

    if (newValue) {
      // Wallet gating check: Mechanic MUST activate wallet before going ON DUTY!
      if (!wallet || !wallet.isActive) {
        setIsOnline(false);
        setShowWalletModal(true);
        return;
      }
    }

    setIsOnline(newValue);
    try {
      await dispatchService.updateLocation(mechanicId, 28.6139, 77.2090, newValue);
      console.log(`Duty status updated to ${newValue ? 'ONLINE' : 'OFFLINE'} in UMS`);
    } catch (e) {
      console.warn('Failed to update location/duty status:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Partner Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarContainer}>
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.partnerBadge}>
                <Ionicons name="person" size={22} color={Colors.primary} />
              </View>
            )}
            <View style={styles.activeDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>
              {mechanicData?.firstName
                ? `${mechanicData.firstName} ${mechanicData.lastName || ''}`
                : 'Rahul Kumar'}
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#00E676" />
              <Text style={styles.verifiedText}>BikeDone Certified Mechanic</Text>
            </View>
          </View>
        </View>

        {/* Online / Offline Duty Switch Header */}
        <View style={[styles.onlineStatusRow, isOnline ? styles.onlineRowBg : styles.offlineRowBg]}>
          <View style={styles.dutyStatusMeta}>
            <Ionicons
              name={isOnline ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={isOnline ? Colors.success : Colors.gray500}
            />
            <Text style={[styles.onlineText, { color: isOnline ? Colors.success : Colors.gray600 }]}>
              {isOnline ? 'ON DUTY (Online)' : 'OFF DUTY (Offline)'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: Colors.gray300, true: 'rgba(46, 125, 50, 0.4)' }}
            thumbColor={isOnline ? Colors.success : Colors.gray100}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's Earnings & Live Wallet Balance Card */}
        {(() => {
          const isWalletActive = Boolean(wallet?.isActive || (wallet as any)?.active);
          return (
            <View style={[styles.earningsCard, Shadows.medium]}>
              <View style={styles.earningsTop}>
                <View>
                  <Text style={styles.earningsLabel}>BIKEDONE WALLET BALANCE</Text>
                  <Text style={styles.earningsAmount}>₹ {wallet?.balance ?? '0.00'}</Text>
                  <Text style={styles.jobsCompletedText}>
                    {isWalletActive
                      ? '✅ Wallet Active (PaaS Platform Mode)'
                      : '⚠️ Wallet Not Activated (Tap to Activate)'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.walletIconBox}
                  onPress={() => setShowWalletModal(true)}
                >
                  <Ionicons name="wallet" size={32} color={isWalletActive ? Colors.primary : '#FF9100'} />
                </TouchableOpacity>
              </View>
              <View style={styles.payoutDivider} />
              <View style={styles.payoutMetaRow}>
                <Text style={styles.payoutMetaText}>
                  Platform Status: <Text style={{ color: isWalletActive ? '#00E676' : '#FF9100', fontWeight: '700' }}>
                    {isWalletActive ? 'Active PaaS Account' : 'Activation Required'}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.payoutDetailBtn}
                  onPress={() => setShowWalletModal(true)}
                >
                  <Text style={styles.payoutDetailText}>{isWalletActive ? 'Wallet' : 'Activate'}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {/* Live Partner Duty Metrics */}
        <Text style={styles.sectionHeading}>Today's Duty Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(242, 86, 29, 0.1)' }]}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricLabel}>New Requests</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(2, 136, 209, 0.1)' }]}>
              <Ionicons name="build" size={20} color="#0288D1" />
            </View>
            <Text style={styles.metricValue}>{activeAcceptedJob ? "1" : "0"}</Text>
            <Text style={styles.metricLabel}>Active Job</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
              <Ionicons name="checkmark-done-circle" size={20} color={Colors.success} />
            </View>
            <Text style={styles.metricValue}>4</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
              <Ionicons name="star" size={20} color="#D32F2F" />
            </View>
            <Text style={styles.metricValue}>4.9 ★</Text>
            <Text style={styles.metricLabel}>Rating</Text>
          </View>
        </View>

        {/* Active Booking Banner */}
        {activeAcceptedJob && (
          <TouchableOpacity 
            style={[styles.activeJobCard, Shadows.medium]}
            onPress={() => router.push(`/job/${activeAcceptedJob.id}`)}
          >
            <View style={styles.activeJobHeader}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeJobTag}>LIVE BREAKDOWN REQUEST</Text>
              <Text style={styles.distanceText}>
                Status: {activeAcceptedJob.status}
              </Text>
            </View>

            <Text style={styles.customerBike}>{activeAcceptedJob.requestType}</Text>
            <Text style={styles.serviceRequiredText}>{activeAcceptedJob.requestNumber}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>📍 Tap to view job details & navigate</Text>

            <View style={styles.actionBtnRow}>
              <TouchableOpacity 
                style={styles.acceptBtn}
                onPress={() => router.push(`/job/${activeAcceptedJob.id}`)}
              >
                <Ionicons name="flash" size={16} color={Colors.textWhite} />
                <Text style={styles.acceptBtnText}>View Job Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Partner Tools */}
        <Text style={styles.sectionHeading}>Partner Quick Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolItem}>
            <View style={styles.toolIconBox}>
              <Ionicons name="map-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Service Zone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem}>
            <View style={styles.toolIconBox}>
              <Ionicons name="card-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Bank Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem}>
            <View style={styles.toolIconBox}>
              <Ionicons name="headset-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Helpline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => {
              setIncomingJob({
                requestId: '00000000-0000-0000-0000-000000000000',
                customerName: 'Rahul Sharma',
                issueDescription: 'Engine Oil Change & Chain Lube',
                latitude: 28.6139,
                longitude: 77.2090,
                addressNote: 'Sector 62, Near Metro Station Gate 2, Noida',
                dispatchRound: 1,
                timeoutSeconds: 30,
              });
            }}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(0, 200, 83, 0.15)' }]}>
              <Ionicons name="notifications" size={24} color="#00C853" />
            </View>
            <Text style={[styles.toolText, { color: '#00C853' }]}>Test Alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dispatch Incoming Job Alert Modal */}
      <IncomingJobModal
        visible={!!incomingJob}
        job={incomingJob}
        mechanicId={getMechanicId()}
        onAcceptSuccess={(acceptedJob) => {
          setActiveAcceptedJob(acceptedJob);
          setIncomingJob(null);
          // Route to the new Job Screen instead of keeping it on home
          router.push(`/job/${acceptedJob.requestId}`);
        }}
        onDismiss={() => {
          if (incomingJob) {
            setDismissedJobIds((prev) => new Set(prev).add(incomingJob.requestId));
          }
          setIncomingJob(null);
        }}
      />

      {/* Wallet Activation & Add Money Modal */}
      <WalletActivationModal
        visible={showWalletModal}
        mechanicId={getMechanicId()}
        wallet={wallet}
        onSuccess={(updatedWallet) => {
          setWallet(updatedWallet);
          if (!isOnline) {
            handleToggleOnline(true);
          }
        }}
        onDismiss={() => setShowWalletModal(false)}
      />
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
    gap: 14,
    marginBottom: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  partnerBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  partnerSub: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  onlineRowBg: {
    backgroundColor: '#F4FBF7',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
  offlineRowBg: {
    backgroundColor: Colors.gray100,
  },
  dutyStatusMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  earningsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  earningsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: Colors.gray400,
    fontWeight: '700',
    letterSpacing: 1,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textWhite,
    marginVertical: 4,
  },
  jobsCompletedText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  walletIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 14,
  },
  payoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payoutMetaText: {
    fontSize: 12,
    color: Colors.gray400,
  },
  payoutDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  payoutDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  metricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '600',
    marginTop: 2,
  },
  activeJobCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
  activeJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  activeJobTag: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
  },
  customerBike: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  serviceRequiredText: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
    marginBottom: 14,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray700,
  },
  acceptBtn: {
    flex: 2,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  toolItem: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
