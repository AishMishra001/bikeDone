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
import { vehicleService, MyServiceRequest } from '../../services/vehicleService';
import ProfileSidebar from '../ui/ProfileSidebar';
import LocationPickerModal from '../ui/LocationPickerModal';
import { UserLocationData } from '../../services/locationService';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
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
  const { loading: locationLoading, location: gpsLocation, errorType, refreshLocation } = useUserLocation();
  const [customLocation, setCustomLocation] = useState<UserLocationData | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(initialSidebarOpen);
  const [activeRequest, setActiveRequest] = useState<MyServiceRequest | null>(null);
  const sosOpacity = useRef(new Animated.Value(1)).current;

  const activeLocation = customLocation || gpsLocation;

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

    const fetchActiveRequest = async () => {
      try {
        const reqs = await vehicleService.getMyServiceRequests();
        const active = reqs.find((req) => 
          ["SEARCHING", "MECHANIC_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "INSPECTION_STARTED", "WORK_STARTED"].includes(req.status)
        );
        setActiveRequest(active || null);
      } catch (err) {
        console.warn('Failed to load active request in home:', err);
      }
    };
    fetchActiveRequest();

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
    if (activeLocation) {
      return <Text style={styles.locationText} numberOfLines={1}>{activeLocation.shortAddress || activeLocation.area || 'Location selected'}</Text>;
    }
    if (locationLoading) {
      return <Text style={styles.locationText} numberOfLines={1}>Detecting...</Text>;
    }
    if (errorType === 'DISABLED') {
      return <Text style={styles.locationText} numberOfLines={1}>Turn on location</Text>;
    }
    if (errorType === 'DENIED') {
      return <Text style={styles.locationText} numberOfLines={1}>Enable location</Text>;
    }
    return <Text style={styles.locationText} numberOfLines={1}>Tap to select location</Text>;
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
    if ('emailVerified' in profileToUse && profileToUse.emailVerified) score += 25;
    if (profileToUse.mobileNumber && profileToUse.mobileNumber.trim().length >= 10) score += 25;
    if ('mobileVerified' in profileToUse && profileToUse.mobileVerified) score += 25;
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
              <Feather name="user" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Location Pill */}
          <TouchableOpacity 
            style={styles.locationPill} 
            onPress={() => setShowLocationPicker(true)}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={14} color="#ffedd5" />
            <View style={styles.locationTextContainer}>
              {renderLocationText()}
            </View>
            <Feather name="edit-2" size={14} color="#ffedd5" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Vehicle Services & Issues</Text>

        {/* Action Grid */}
        <View style={styles.gridContainer}>
          {/* Inspection Card */}
          <Pressable 
            style={[styles.gridCard, hoveredCard === 'Inspection' && styles.gridCardHovered]} 
            onPress={() => onNavigate('Inspection')}
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
            onPress={() => onNavigate('RoutineService')}
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
            onPress={() => onNavigate('Repair')}
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
            onPress={() => onNavigate('Emergency')}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.emergencyIconCircle, { opacity: sosOpacity }]}>
              <Text style={styles.sosText}>SOS</Text>
            </Animated.View>
            <Text style={styles.emergencyText}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Promotional Offer Card */}
        <TouchableOpacity activeOpacity={0.9} style={styles.promoContainer} onPress={() => onNavigate('RoutineService')}>
          <View style={styles.promoBackground}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Winter Prep{'\n'}Package</Text>
            <Text style={styles.promoSubtitle}>Get your vehicle ready for{'\n'}tough conditions with our service package.</Text>
            
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => onNavigate('RoutineService')}>
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

      {/* Interactive Handpick Location & Map Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        initialLocation={activeLocation || null}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(newLoc, isServ) => {
          setCustomLocation(newLoc);
          if (!isServ) {
            onNavigate('NotServiceable');
          }
        }}
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
    paddingBottom: 170,
  },
  topCard: {
    backgroundColor: '#f97316',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '100%',
  },
  locationTextContainer: {
    marginHorizontal: 8,
    flexShrink: 1,
  },
  locationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  gridCardHovered: {
    backgroundColor: '#ffffff',
    borderColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ translateY: -2 }],
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
    backgroundColor: '#ffedd5',
  },
  gridCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
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
  emergencyCard: {
    backgroundColor: '#fee2e2',
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sosText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promoContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  promoBackground: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 24,
  },
  offerBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  offerBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  bookNowBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookNowText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

