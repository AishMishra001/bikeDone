import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
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
import { locationService, Coordinates } from '@/services/locationService';
import { ServiceZoneModal } from '@/components/ServiceZoneModal';
import { isWithinNoidaServiceZone } from '@/utils/geoUtils';

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
  const [showServiceZoneModal, setShowServiceZoneModal] = useState<boolean>(false);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
    fetchActiveJob();
    // Warm up GPS location on mount
    locationService.getCurrentLocation().then((loc) => {
      if (loc) setCurrentCoords(loc);
    }).catch(() => {});
  }, []);

  const getMechanicId = () => {
    return mechanicData?.id || mechanicData?.mechanicId || '4043b9cd-bb8d-495d-af42-6305d72133c6';
  };

  const syncLocationWithUMS = async (onlineStatus: boolean) => {
    const mechanicId = getMechanicId();
    if (!mechanicId) return;

    try {
      const loc = await locationService.getCurrentLocation();
      if (loc && loc.latitude && loc.longitude) {
        setCurrentCoords(loc);
        await dispatchService.updateLocation(mechanicId, loc.latitude, loc.longitude, onlineStatus);
      } else if (currentCoords) {
        await dispatchService.updateLocation(mechanicId, currentCoords.latitude, currentCoords.longitude, onlineStatus);
      }
    } catch (err) {
      console.warn('Location sync failed:', err);
    }
  };

  useEffect(() => {
    if (!isOnline) return;
    const mechanicId = getMechanicId();

    const sendLocationPing = async () => {
      await syncLocationWithUMS(true);
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

    const locInterval = setInterval(sendLocationPing, 10000);
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

      setGpsLoading(true);
      const permGranted = await locationService.requestLocationPermission();
      if (!permGranted) {
        setGpsLoading(false);
        Alert.alert(
          "Location Permission Required",
          "Please enable GPS location permissions on your device so nearby customers can find your garage / service."
        );
        setIsOnline(false);
        return;
      }

      const loc = await locationService.getCurrentLocation();
      setGpsLoading(false);

      if (loc && loc.latitude && loc.longitude) {
        setCurrentCoords(loc);
        const zoneCheck = isWithinNoidaServiceZone(loc);
        if (!zoneCheck.isServiceable) {
          Alert.alert(
            "Outside Noida Service Zone",
            `Your current location is outside the active Noida operational area (${zoneCheck.message}). Please move inside Noida & Greater Noida to receive customer breakdown dispatches.`,
            [
              { text: "View Service Zone", onPress: () => setShowServiceZoneModal(true) },
              { text: "Continue Online (Testing)", onPress: () => {} }
            ]
          );
        }

        setIsOnline(true);
        try {
          await dispatchService.updateLocation(mechanicId, loc.latitude, loc.longitude, true);
          console.log(`Duty status updated to ONLINE at (${loc.latitude}, ${loc.longitude}) in UMS`);
        } catch (e) {
          console.warn('Failed to update location/duty status:', e);
        }
      } else {
        Alert.alert(
          "GPS Location Notice",
          "Could not detect high accuracy GPS. Using best available device location."
        );
        setIsOnline(true);
        if (currentCoords) {
          await dispatchService.updateLocation(mechanicId, currentCoords.latitude, currentCoords.longitude, true).catch(() => {});
        }
      }
    } else {
      setIsOnline(false);
      try {
        const loc = currentCoords || locationService.getCachedLocation();
        if (loc) {
          await dispatchService.updateLocation(mechanicId, loc.latitude, loc.longitude, false);
        }
        console.log(`Duty status updated to OFFLINE in UMS`);
      } catch (e) {
        console.warn('Failed to update duty status:', e);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Partner Top Header Card (Customer App Theme) */}
      <View style={styles.heroTopCard}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarContainer}>
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.partnerBadge}>
                <Ionicons name="person" size={22} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.activeDot, { backgroundColor: isOnline ? Colors.success : Colors.gray400 }]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.greetingText}>
                {mechanicData?.firstName
                  ? `${mechanicData.firstName} ${mechanicData.lastName || ''}`
                  : 'Rahul Kumar'}
              </Text>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingPillText}>4.9</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
              <Text style={styles.verifiedText}>MyKaarigar Certified Workshop Partner</Text>
            </View>
          </View>
        </View>

        {/* Online / Offline Duty Switch Header */}
        <View style={[styles.onlineStatusRow, isOnline ? styles.onlineRowBg : styles.offlineRowBg]}>
          <View style={styles.dutyStatusMeta}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={[styles.dutyStatusIndicator, isOnline ? styles.indicatorOnline : styles.indicatorOffline]}>
                <Ionicons
                  name={isOnline ? 'radio-button-on' : 'power-outline'}
                  size={16}
                  color={isOnline ? Colors.success : Colors.gray500}
                />
              </View>
            )}
            <View>
              <Text style={[styles.onlineText, { color: isOnline ? '#065F46' : Colors.textDark }]}>
                {isOnline ? 'ON DUTY • Accepting Requests' : 'OFF DUTY • Dispatches Paused'}
              </Text>
              <Text style={styles.dutySubtext}>
                {isOnline ? 'Auto-matching nearby breakdown jobs' : 'Toggle switch to start receiving orders'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: Colors.gray300, true: '#BBF7D0' }}
            thumbColor={isOnline ? Colors.success : '#FFFFFF'}
          />
        </View>

        {/* GPS Live Tracking Info Pill */}
        <TouchableOpacity 
          style={[styles.gpsPill, isOnline ? styles.gpsPillOnline : styles.gpsPillOffline]}
          onPress={() => syncLocationWithUMS(isOnline)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentCoords ? "navigate-circle" : "location-outline"}
            size={16}
            color={isOnline && currentCoords ? Colors.primary : Colors.gray500}
          />
          <Text style={[styles.gpsPillText, isOnline && currentCoords ? { color: Colors.textDark, fontWeight: '700' } : null]} numberOfLines={1}>
            {currentCoords
              ? `GPS Area: ${currentCoords.latitude.toFixed(4)}, ${currentCoords.longitude.toFixed(4)}`
              : (isOnline ? 'Detecting device GPS coordinates...' : 'Location tracking off')}
          </Text>
          {isOnline && (
            <View style={styles.gpsSyncBadge}>
              <Ionicons name="refresh" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
              <Text style={styles.gpsSyncText}>Sync</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Booking Banner (High Priority) */}
        {activeAcceptedJob && (
          <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.activeJobCard, Shadows.medium]}
            onPress={() => router.push(`/job/${activeAcceptedJob.id}`)}
          >
            <View style={styles.activeJobHeader}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeJobTag}>LIVE ACTIVE SERVICE REQUEST</Text>
              <View style={styles.activeJobStatusBadge}>
                <Text style={styles.activeJobStatusText}>{activeAcceptedJob.status || 'IN_PROGRESS'}</Text>
              </View>
            </View>

            <Text style={styles.customerBike}>{activeAcceptedJob.requestType || 'Motorcycle Breakdown'}</Text>
            <Text style={styles.serviceRequiredText}>Order #{activeAcceptedJob.requestNumber || 'BD-7821'}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>📍 Tap to view customer location & open job console</Text>

            <View style={styles.actionBtnRow}>
              <TouchableOpacity 
                style={styles.acceptBtn}
                onPress={() => router.push(`/job/${activeAcceptedJob.id}`)}
              >
                <Ionicons name="flash" size={16} color={Colors.textWhite} />
                <Text style={styles.acceptBtnText}>Open Job Console</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textWhite} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Today's Earnings & Live Wallet Balance Card */}
        {(() => {
          const isWalletActive = Boolean(wallet?.isActive || (wallet as any)?.active);
          return (
            <View style={[styles.earningsCard, Shadows.medium]}>
              <View style={styles.earningsTop}>
                <View>
                  <View style={styles.walletHeaderPill}>
                    <Ionicons name="shield-checkmark" size={12} color="#FDBA74" />
                    <Text style={styles.earningsLabel}>BIKEDONE PARTNER WALLET</Text>
                  </View>
                  <Text style={styles.earningsAmount}>₹ {wallet?.balance !== undefined ? Number(wallet.balance).toFixed(2) : '0.00'}</Text>
                  <Text style={styles.jobsCompletedText}>
                    {isWalletActive
                      ? '● Active PaaS Account (Ready for Dispatches)'
                      : '⚠️ Wallet Inactive (Tap to Activate)'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.walletIconBox}
                  onPress={() => setShowWalletModal(true)}
                >
                  <Ionicons name="wallet" size={26} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.payoutDivider} />

              <View style={styles.payoutMetaRow}>
                <Text style={styles.payoutMetaText}>
                  Status: <Text style={{ color: isWalletActive ? '#86EFAC' : '#FCA5A5', fontWeight: '700' }}>
                    {isWalletActive ? 'Verified & Active' : 'Activation Required'}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.payoutDetailBtn}
                  onPress={() => setShowWalletModal(true)}
                >
                  <Text style={styles.payoutDetailText}>{isWalletActive ? 'Top-Up / Manage' : 'Activate Wallet'}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {/* Live Partner Duty Metrics */}
        <Text style={styles.sectionHeading}>Today's Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricLabel}>New Dispatches</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="construct" size={20} color="#2563EB" />
            </View>
            <Text style={styles.metricValue}>{activeAcceptedJob ? "1" : "0"}</Text>
            <Text style={styles.metricLabel}>Active Jobs</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.metricValue}>4</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          <View style={[styles.metricCard, Shadows.small]}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.metricValue}>4.9 ★</Text>
            <Text style={styles.metricLabel}>Satisfaction</Text>
          </View>
        </View>

        {/* Quick Partner Tools */}
        <Text style={styles.sectionHeading}>Partner Quick Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={[styles.toolItem, Shadows.small]} onPress={() => setShowServiceZoneModal(true)}>
            <View style={styles.toolIconBox}>
              <Ionicons name="map-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Service Zone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolItem, Shadows.small]} onPress={() => router.push('/(tabs)/wallet')}>
            <View style={styles.toolIconBox}>
              <Ionicons name="cash-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolItem, Shadows.small]} onPress={() => Alert.alert('MyKaarigar Helpline', 'Partner Support Desk: 1800-123-KAARIGAR\nAvailable 24/7 for Breakdown Assistance.')}>
            <View style={styles.toolIconBox}>
              <Ionicons name="headset-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.toolText}>Helpline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolItem, Shadows.small]}
            onPress={() => {
              setIncomingJob({
                requestId: '00000000-0000-0000-0000-000000000000',
                customerName: 'Rahul Sharma',
                issueDescription: 'Engine Starting Issue & Chain Lubrication',
                latitude: 28.6139,
                longitude: 77.2090,
                addressNote: 'Sector 62, Near Metro Station Gate 2, Noida',
                dispatchRound: 1,
                timeoutSeconds: 30,
              });
            }}
          >
            <View style={[styles.toolIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="flash-outline" size={22} color="#10B981" />
            </View>
            <Text style={[styles.toolText, { color: '#059669', fontWeight: '700' }]}>Test Alert</Text>
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

      {/* BikeDone Service Zone Modal */}
      <ServiceZoneModal
        visible={showServiceZoneModal}
        coords={currentCoords}
        onDismiss={() => setShowServiceZoneModal(false)}
        onRefreshGps={async () => {
          setGpsLoading(true);
          const loc = await locationService.getCurrentLocation();
          setGpsLoading(false);
          if (loc) setCurrentCoords(loc);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  heroTopCard: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  partnerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  onlineRowBg: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  offlineRowBg: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  dutyStatusMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dutyStatusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorOnline: {
    backgroundColor: '#D1FAE5',
  },
  indicatorOffline: {
    backgroundColor: Colors.gray200,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dutySubtext: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 1,
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  gpsPillOnline: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  gpsPillOffline: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  gpsPillText: {
    flex: 1,
    fontSize: 12,
    color: Colors.gray600,
    fontWeight: '500',
  },
  gpsSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gpsSyncText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  earningsCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  earningsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 11,
    color: '#FDBA74',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  jobsCompletedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  walletIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
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
    color: '#9CA3AF',
  },
  payoutDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  payoutDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  metricIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
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
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  activeJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  activeJobTag: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  activeJobStatusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeJobStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  customerBike: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  serviceRequiredText: {
    fontSize: 13,
    color: Colors.gray600,
    marginTop: 2,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
    marginBottom: 14,
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
  acceptBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  toolItem: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
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
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
});
