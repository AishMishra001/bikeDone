import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tokenStorage, LoggedInUser } from '../../services/tokenStorage';
import { useUserLocation } from '../../hooks/useUserLocation';
import { api } from '../../services/api';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

interface FullUserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNumber?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);
  const { loading: locationLoading, location, errorType, refreshLocation } = useUserLocation();

  useEffect(() => {
    const loadUser = async () => {
      const u = await tokenStorage.getUser();
      setUser(u);
    };
    loadUser();

    const fetchFullProfile = async () => {
      try {
        const p = await api.get<FullUserProfile>('/users/me');
        setFullProfile(p);
      } catch (err) {
        console.warn('Failed to load profile details in home:', err);
      }
    };
    fetchFullProfile();
  }, []);

  const calculateCompletion = (): number => {
    if (!fullProfile) return 50;
    let score = 0;
    if (fullProfile.firstName) score += 25;
    if (fullProfile.emailVerified) score += 25;
    if (fullProfile.mobileNumber && fullProfile.mobileNumber.trim().length >= 10) score += 25;
    if (fullProfile.mobileVerified) score += 25;
    return score;
  };

  const completionPercentage = calculateCompletion();

  const renderLocationText = () => {
    if (locationLoading) {
      return (
        <View style={styles.locationLoadingRow}>
          <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.headerLocation}>Detecting location...</Text>
        </View>
      );
    }
    if (location) {
      return <Text style={styles.headerLocation}> {location.shortAddress} </Text>;
    }
    if (errorType === 'DISABLED') {
      return <Text style={styles.headerLocation}> Turn on location 🔄 </Text>;
    }
    if (errorType === 'DENIED') {
      return <Text style={styles.headerLocation}> Enable location permissions 🔄 </Text>;
    }
    return <Text style={styles.headerLocation}> Tap to fetch location 🔄 </Text>;
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Header */}
      <View style={styles.homeHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Current Location</Text>
            <TouchableOpacity 
              style={styles.locationContainer} 
              onPress={refreshLocation}
              activeOpacity={0.7}
            >
              <Feather name="map-pin" size={14} color="white" />
              {renderLocationText()}
              <Feather name="chevron-down" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.bellIcon}>
            <Feather name="bell" size={20} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </View>
        <Text style={styles.greetingText}>Hello, {user ? user.firstName : 'Rider'}! 🏍️</Text>
        <Text style={styles.greetingSub}>What does your bike need today?</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Complete Your Profile Progress Card */}
        {completionPercentage < 100 ? (
          <View style={styles.completionCard}>
            <View style={styles.completionHeaderRow}>
              <View style={styles.completionTitleGroup}>
                <Feather name="shield" size={20} color="#f97316" />
                <Text style={styles.completionTitle}>Complete Your Profile</Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{completionPercentage}%</Text>
              </View>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>

            <Text style={styles.completionSubtext}>
              {!fullProfile?.mobileVerified
                ? 'Mobile verification is required to complete your profile.'
                : 'Please complete remaining details to personalize your experience.'}
            </Text>

            <View style={styles.checklistContainer}>
              <View style={styles.checklistItem}>
                <Feather
                  name={fullProfile?.emailVerified ? 'check-circle' : 'clock'}
                  size={14}
                  color={fullProfile?.emailVerified ? '#16a34a' : '#f59e0b'}
                />
                <Text style={styles.checklistText}>Email Verified</Text>
              </View>

              <View style={styles.checklistItem}>
                <Feather
                  name={fullProfile?.mobileVerified ? 'check-circle' : 'alert-circle'}
                  size={14}
                  color={fullProfile?.mobileVerified ? '#16a34a' : '#dc2626'}
                />
                <Text
                  style={[
                    styles.checklistText,
                    !fullProfile?.mobileVerified && { color: '#dc2626', fontWeight: 'bold' }
                  ]}
                >
                  {fullProfile?.mobileVerified ? 'Mobile Verified' : 'Mobile Verification Needed'}
                </Text>
              </View>
            </View>

            {!fullProfile?.mobileVerified && (
              <TouchableOpacity
                style={styles.verifyMobileCta}
                onPress={() => onNavigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyMobileCtaText}>Verify Mobile Number</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.completedCard}>
            <View style={styles.completedHeaderRow}>
              <Feather name="check-circle" size={20} color="#16a34a" />
              <Text style={styles.completedTitle}>Profile 100% Complete</Text>
            </View>
            <Text style={styles.completedSubtext}>
              Your email and mobile number are verified!
            </Text>
          </View>
        )}

        {/* Booking management */}
        <TouchableOpacity
          style={styles.bookingStatusCard}
          onPress={() => onNavigate('MyRequests')}
          activeOpacity={0.8}
        >
          <View style={styles.alertIconBox}>
            <Feather name="clipboard" size={19} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Manage your bookings</Text>
            <Text style={styles.alertSub}>
              Track service requests and their latest status.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Bike care, made simple</Text>

        <TouchableOpacity
          style={styles.bookServiceCard}
          onPress={() => onNavigate('Booking')}
          activeOpacity={0.85}
        >
          <View style={styles.bookServiceIcon}>
            <Feather name="tool" size={25} color="#f97316" />
          </View>
          <View style={styles.bookServiceContent}>
            <Text style={styles.bookServiceTitle}>Book a Service</Text>
            <Text style={styles.bookServiceSubtext}>
              Service, repair or emergency assistance
            </Text>
          </View>
          <View style={styles.bookServiceArrow}>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#f97316" />
          <Text style={[styles.navText, { color: '#f97316' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('MyRequests')}>
          <Feather name="clipboard" size={24} color="#9ca3af" />
          <Text style={styles.navText}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Profile')}>
          <Feather name="user" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  homeHeader: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    color: '#fff3eb',
    fontSize: 12,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLocation: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bellIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  greetingSub: {
    color: '#fff3eb',
    fontSize: 14,
    marginTop: 4,
  },
  homeContent: {
    padding: 24,
    paddingBottom: 100,
  },
  bookingStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  alertIconBox: {
    padding: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  alertSub: {
    fontSize: 12,
    color: '#1d4ed8',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  bookServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bookServiceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff3eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookServiceContent: {
    flex: 1,
    marginLeft: 14,
  },
  bookServiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  bookServiceSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 18,
  },
  bookServiceArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#9ca3af',
  },
  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffedd5',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  completionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  percentageBadge: {
    backgroundColor: '#fff3eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd8be',
  },
  percentageText: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 13,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  completionSubtext: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  checklistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistText: {
    fontSize: 11,
    color: '#374151',
    marginLeft: 6,
  },
  verifyMobileCta: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyMobileCtaText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  completedCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166534',
    marginLeft: 8,
  },
  completedSubtext: {
    fontSize: 12,
    color: '#15803d',
  },
});
