import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tokenStorage, LoggedInUser } from '../../services/tokenStorage';
import { useUserLocation } from '../../hooks/useUserLocation';
import { api } from '../../services/api';
import ProfileSidebar from '../ui/ProfileSidebar';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  initialSidebarOpen?: boolean;
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

export default function HomeScreen({ onNavigate, initialSidebarOpen = false }: HomeScreenProps) {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);
  const { loading: locationLoading, location, errorType, refreshLocation } = useUserLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(initialSidebarOpen);

  const sosOpacity = useRef(new Animated.Value(1)).current;

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

    // Start SOS Blinking animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sosOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();

  }, [sosOpacity]);

  const renderLocationText = () => {
    if (locationLoading) {
      return <Text style={styles.locationText} numberOfLines={1}>Detecting...</Text>;
    }
    if (location) {
      return <Text style={styles.locationText} numberOfLines={1}>{location.shortAddress || 'Location unknown'}</Text>;
    }
    if (errorType === 'DISABLED') {
      return <Text style={styles.locationText} numberOfLines={1}>Turn on location</Text>;
    }
    if (errorType === 'DENIED') {
      return <Text style={styles.locationText} numberOfLines={1}>Enable location</Text>;
    }
    return <Text style={styles.locationText} numberOfLines={1}>Tap to fetch location</Text>;
  };

  const getGreetingName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    return 'Alex';
  };

  const calculateCompletion = () => {
    const profileToUse = fullProfile || user;
    if (!profileToUse) return 50;
    let score = 0;
    if (profileToUse.firstName) score += 25;
    if (profileToUse.emailVerified) score += 25;
    if (profileToUse.mobileNumber && profileToUse.mobileNumber.trim().length >= 10) score += 25;
    if (profileToUse.mobileVerified) score += 25;
    return score;
  };

  const completionPercentage = calculateCompletion();

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile & Location Card */}
        <View style={styles.topCard}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.greetingText}>Hello, {getGreetingName()}</Text>
            <TouchableOpacity style={styles.profileIcon} onPress={() => setSidebarVisible(true)}>
              <Feather name="user" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Location Pill */}
          <TouchableOpacity 
            style={styles.locationPill} 
            onPress={refreshLocation}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={14} color="#6b7280" />
            <View style={styles.locationTextContainer}>
              {renderLocationText()}
            </View>
            <Feather name="edit-2" size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Bike Related Issues</Text>

        {/* Action Grid */}
        <View style={styles.gridContainer}>
          {/* Inspection Card */}
          <Pressable 
            style={[styles.gridCard, hoveredCard === 'Inspection' && styles.gridCardHovered]} 
            onPress={() => onNavigate('Booking')}
            onHoverIn={() => setHoveredCard('Inspection')}
            onHoverOut={() => setHoveredCard(null)}
            onPressIn={() => setHoveredCard('Inspection')}
            onPressOut={() => setHoveredCard(null)}
          >
            <View style={[styles.iconCircle, hoveredCard === 'Inspection' && styles.iconCircleActive]}>
              <Feather name="search" size={24} color={hoveredCard === 'Inspection' ? "#000000" : "#374151"} />
            </View>
            <Text style={styles.gridCardText}>Inspection</Text>
          </Pressable>

          {/* Routine Service Card */}
          <Pressable 
            style={[styles.gridCard, hoveredCard === 'Routine Service' && styles.gridCardHovered]} 
            onPress={() => onNavigate('Booking')}
            onHoverIn={() => setHoveredCard('Routine Service')}
            onHoverOut={() => setHoveredCard(null)}
            onPressIn={() => setHoveredCard('Routine Service')}
            onPressOut={() => setHoveredCard(null)}
          >
            <View style={[styles.iconCircle, hoveredCard === 'Routine Service' && styles.iconCircleActive]}>
              <Feather name="tool" size={24} color={hoveredCard === 'Routine Service' ? "#000000" : "#374151"} />
            </View>
            <Text style={styles.gridCardText}>Routine Service</Text>
          </Pressable>

          {/* Repair Card */}
          <Pressable 
            style={[styles.gridCard, hoveredCard === 'Repair' && styles.gridCardHovered]} 
            onPress={() => onNavigate('Booking')}
            onHoverIn={() => setHoveredCard('Repair')}
            onHoverOut={() => setHoveredCard(null)}
            onPressIn={() => setHoveredCard('Repair')}
            onPressOut={() => setHoveredCard(null)}
          >
            <View style={[styles.iconCircle, hoveredCard === 'Repair' && styles.iconCircleActive]}>
              <Feather name="settings" size={24} color={hoveredCard === 'Repair' ? "#000000" : "#374151"} />
            </View>
            <Text style={styles.gridCardText}>Repair</Text>
          </Pressable>

          {/* Emergency Card */}
          <TouchableOpacity 
            style={[styles.gridCard, styles.emergencyCard]} 
            onPress={() => onNavigate('Booking')}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.emergencyIconCircle, { opacity: sosOpacity }]}>
              <Text style={styles.sosText}>SOS</Text>
            </Animated.View>
            <Text style={styles.emergencyText}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Promotional Offer Card */}
        <TouchableOpacity activeOpacity={0.9} style={styles.promoContainer} onPress={() => onNavigate('Booking')}>
          <View style={styles.promoBackground}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Winter Prep{'\n'}Package</Text>
            <Text style={styles.promoSubtitle}>Get your bike ready for{'\n'}tough conditions with o...</Text>
            
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => onNavigate('Booking')}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ProfileSidebar
        visible={sidebarVisible}
        onClose={() => {
          setSidebarVisible(false);
          if (initialSidebarOpen) {
            onNavigate('Home'); // Ensure the route resets to Home from Profile
          }
        }}
        onNavigate={onNavigate}
        user={fullProfile || user}
        completionPercentage={completionPercentage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  topCard: {
    backgroundColor: '#fff7f2',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1ece9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  locationTextContainer: {
    marginHorizontal: 8,
    maxWidth: 200,
  },
  locationText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginLeft: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  gridCardHovered: {
    backgroundColor: '#f3f4f6',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircleActive: {
    backgroundColor: '#f97316',
  },
  gridCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  emergencyCard: {
    backgroundColor: '#fee2e2',
  },
  emergencyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#b91c1c',
  },
  promoContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  promoBackground: {
    backgroundColor: '#1f2937',
    padding: 24,
    minHeight: 200,
  },
  offerBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  offerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 30,
  },
  promoSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  bookNowBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookNowText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  }
});

