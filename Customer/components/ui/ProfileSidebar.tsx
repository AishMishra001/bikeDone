import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, Animated, Modal, TouchableOpacity, 
  Dimensions, Switch, ScrollView, SafeAreaView, Platform 
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import { UserAddress } from '../../services/addressService';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width;

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  user: any;
  completionPercentage?: number;
}

export default function ProfileSidebar({ 
  visible, 
  onClose, 
  onNavigate, 
  user, 
  completionPercentage = 75 
}: ProfileSidebarProps) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subView, setSubView] = useState<'MENU' | 'SAVED_ADDRESSES' | 'ADD_ADDRESS'>('MENU');
  const [selectedEditAddress, setSelectedEditAddress] = useState<UserAddress | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (visible) {
      setSubView('MENU');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleLogout = async () => {
    Animated.timing(slideAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      await authService.logout();
      onNavigate('Login');
    });
  };

  const navigateTo = (screen: string) => {
    Animated.timing(slideAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setTimeout(() => {
        onNavigate(screen);
      }, 50);
    });
  };

  if (!visible) return null;

  const firstLetter = (user?.firstName?.charAt(0) || 'A').toUpperCase();
  const fullName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : 'Abhishek';

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={closeSidebar}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={closeSidebar} />
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Top Navigation Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={closeSidebar} style={styles.backButton} activeOpacity={0.7}>
                <Feather name="chevron-left" size={24} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Account Profile</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Premium Brand Profile Hero Card */}
              <View style={styles.profileHeroCard}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-sharp" size={12} color="#ffffff" />
                  </View>
                </View>

                <View style={styles.profileMeta}>
                  <Text style={styles.userName} numberOfLines={1}>{fullName}</Text>
                  <View style={styles.tagsRow}>
                    <View style={styles.proPill}>
                      <Ionicons name="shield-checkmark" size={12} color="#ea580c" />
                      <Text style={styles.proPillText}>Pro Member</Text>
                    </View>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingPillText}>4.9 Rating</Text>
                    </View>
                  </View>
                  {user?.email && (
                    <Text style={styles.userEmailText} numberOfLines={1}>{user.email}</Text>
                  )}
                </View>
              </View>

              {/* Profile Completion Card (if not 100%) */}
              {completionPercentage < 100 && (
                <View style={styles.completionCard}>
                  <View style={styles.completionHeaderRow}>
                    <View style={styles.completionTitleGroup}>
                      <Ionicons name="sparkles" size={16} color="#ea580c" />
                      <Text style={styles.completionHeading}>Profile Completion</Text>
                    </View>
                    <Text style={styles.completionScore}>{completionPercentage}%</Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
                  </View>

                  <View style={styles.completionPromptRow}>
                    <Text style={styles.completionPromptText}>
                      Verify your mobile number to get 100% verified status & rewards.
                    </Text>
                    <TouchableOpacity 
                      style={styles.completeActionBtn}
                      onPress={() => navigateTo('FullProfile')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.completeActionText}>Complete</Text>
                      <Feather name="arrow-right" size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Section 1: YOUR INFORMATION */}
              <View style={styles.menuSection}>
                <Text style={styles.sectionHeading}>YOUR INFORMATION</Text>
                <View style={styles.groupedCard}>
                  <TouchableOpacity 
                    style={styles.menuRow} 
                    onPress={() => setSubView('SAVED_ADDRESSES')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#fff7ed' }]}>
                      <Feather name="map-pin" size={18} color="#ea580c" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Saved Addresses</Text>
                      <Text style={styles.menuSubtitle}>Manage home, office & repair spots</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  <View style={styles.cardDivider} />

                  <TouchableOpacity 
                    style={styles.menuRow} 
                    onPress={() => navigateTo('FullProfile')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                      <Feather name="user-check" size={18} color="#16a34a" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Personal Details</Text>
                      <Text style={styles.menuSubtitle}>Name, phone, email & password</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 2: REWARDS & OFFERS */}
              <View style={styles.menuSection}>
                <Text style={styles.sectionHeading}>REWARDS & BENEFITS</Text>
                <View style={styles.groupedCard}>
                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                      <Feather name="gift" size={18} color="#d97706" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>MyKaarigar Rewards</Text>
                      <Text style={styles.menuSubtitle}>Cashback & exclusive discounts</Text>
                    </View>
                    <View style={styles.miniTag}>
                      <Text style={styles.miniTagText}>New</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  <View style={styles.cardDivider} />

                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                      <Feather name="share-2" size={18} color="#0284c7" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Refer & Earn</Text>
                      <Text style={styles.menuSubtitle}>Invite friends & get ₹100 each</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  <View style={styles.cardDivider} />

                  <TouchableOpacity 
                    style={styles.menuRow} 
                    onPress={() => navigateTo('Emergency')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                      <Ionicons name="warning" size={18} color="#dc2626" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={[styles.menuTitle, { color: '#dc2626' }]}>Emergency Roadside SOS</Text>
                      <Text style={styles.menuSubtitle}>Immediate breakdown rescue 24x7</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 3: APP PREFERENCES */}
              <View style={styles.menuSection}>
                <Text style={styles.sectionHeading}>APP PREFERENCES</Text>
                <View style={styles.groupedCard}>
                  <View style={styles.menuRow}>
                    <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
                      <Feather name="moon" size={18} color="#475569" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Dark Appearance</Text>
                      <Text style={styles.menuSubtitle}>Switch theme preference</Text>
                    </View>
                    <Switch 
                      value={isDarkMode} 
                      onValueChange={setIsDarkMode} 
                      trackColor={{ false: '#e2e8f0', true: '#fdba74' }}
                      thumbColor={isDarkMode ? '#ea580c' : '#ffffff'}
                    />
                  </View>
                </View>
              </View>

              {/* Section 4: HELP & SUPPORT */}
              <View style={styles.menuSection}>
                <Text style={styles.sectionHeading}>HELP & LEGAL</Text>
                <View style={styles.groupedCard}>
                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                      <Feather name="help-circle" size={18} color="#16a34a" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Help & Support Center</Text>
                      <Text style={styles.menuSubtitle}>FAQs & live agent chat</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  <View style={styles.cardDivider} />

                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: '#f8fafc' }]}>
                      <Feather name="file-text" size={18} color="#64748b" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Terms & Conditions</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>

                  <View style={styles.cardDivider} />

                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconCircle, { backgroundColor: '#f8fafc' }]}>
                      <Feather name="shield" size={18} color="#64748b" />
                    </View>
                    <View style={styles.menuTextCol}>
                      <Text style={styles.menuTitle}>Privacy Policy</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity 
                style={styles.logoutBtn} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <View style={styles.logoutIconBox}>
                  <Feather name="log-out" size={16} color="#dc2626" />
                </View>
                <Text style={styles.logoutBtnText}>Log Out from Account</Text>
              </TouchableOpacity>
              
              <Text style={styles.versionFooterText}>
                MyKaarigar App • Version 2.4.0 (Noida Launch)
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Stack View Layer 1: Addresses (Stays mounted during both SAVED_ADDRESSES and ADD_ADDRESS) */}
            {(subView === 'SAVED_ADDRESSES' || subView === 'ADD_ADDRESS') && (
              <SavedAddressesScreen
                refreshTrigger={refreshCounter}
                onBack={() => setSubView('MENU')}
                onAddAddress={() => {
                  setSelectedEditAddress(null);
                  setSubView('ADD_ADDRESS');
                }}
                onEditAddress={(addr) => {
                  setSelectedEditAddress(addr);
                  setSubView('ADD_ADDRESS');
                }}
              />
            )}

            {/* Stack View Layer 2: Add or Edit Address (Overlays on top with zIndex: 200) */}
            {subView === 'ADD_ADDRESS' && (
              <AddAddressScreen
                initialAddress={selectedEditAddress}
                onBack={() => setSubView('SAVED_ADDRESSES')}
                onSaveSuccess={() => {
                  setRefreshCounter((prev) => prev + 1);
                  setSubView('SAVED_ADDRESSES');
                }}
              />
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffedd5',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#16a34a',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
    gap: 4,
  },
  proPillText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    gap: 4,
  },
  ratingPillText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '700',
  },
  userEmailText: {
    fontSize: 12,
    color: '#64748b',
  },
  completionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fdba74',
    marginBottom: 18,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  completionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  completionScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ea580c',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
  },
  completionPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  completionPromptText: {
    flex: 1,
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  completeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  completeActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  menuSection: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  miniTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  miniTagText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 62,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 6,
    gap: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#dc2626',
    fontWeight: '800',
    fontSize: 13,
  },
  versionFooterText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 16,
    fontWeight: '500',
  },
});
