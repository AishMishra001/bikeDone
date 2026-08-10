import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, Animated, Modal, TouchableOpacity, 
  Dimensions, Switch, ScrollView, SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authService } from '../../services/authService';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width;

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  user: any;
  completionPercentage?: number;
}

export default function ProfileSidebar({ visible, onClose, onNavigate, user, completionPercentage = 75 }: ProfileSidebarProps) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (visible) {
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
    if (screen === 'SavedAddresses') {
      onNavigate(screen);
    } else {
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
        // Use a small timeout to let the modal fully hide before unmounting its parent
        setTimeout(() => {
          onNavigate(screen);
        }, 50);
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={closeSidebar}>
       <View style={styles.overlay}>
         <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={closeSidebar} />
         <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={closeSidebar} style={styles.backButton}>
                <Feather name="chevron-left" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Profile Card */}
              <View style={styles.profileCard}>
                <View style={styles.profileAvatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                    </Text>
                  </View>
                  {completionPercentage === 100 && (
                    <View style={styles.verifiedBadge}>
                      <Feather name="check-circle" size={12} color="#ffffff" />
                    </View>
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{user?.firstName || 'Alex Rider'}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>Pro Member</Text>
                    </View>
                    <View style={styles.ratingBox}>
                      <Feather name="star" size={12} color="#6b7280" />
                      <Text style={styles.ratingText}> 4.9 Rating</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Completion Card */}
              {completionPercentage < 100 && (
                <View style={styles.completionCard}>
                  <View style={styles.completionHeader}>
                    <Text style={styles.completionTitle}>Profile Completion</Text>
                    <Text style={styles.completionValue}>{completionPercentage}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
                  </View>
                  
                  {user && user.mobileVerified === false && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
                      <Feather name="alert-circle" size={14} color="#dc2626" />
                      <Text style={{ fontSize: 12, color: '#dc2626', marginLeft: 6 }}>Mobile number not verified</Text>
                    </View>
                  )}
                  {user && user.emailVerified === false && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
                      <Feather name="alert-circle" size={14} color="#dc2626" />
                      <Text style={{ fontSize: 12, color: '#dc2626', marginLeft: 6 }}>Email not verified</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.completeBtn} onPress={() => navigateTo('FullProfile')}>
                    <Text style={styles.completeBtnText}>Complete Profile</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Your Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR INFORMATION</Text>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('SavedAddresses')}>
                  <View style={styles.menuIconBox}>
                    <Feather name="map-pin" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Saved Addresses</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Other Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>OTHER INFORMATION</Text>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="gift" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Rewards</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="share-2" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Refer & Earn</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="alert-circle" size={18} color="#dc2626" />
                  </View>
                  <Text style={[styles.menuItemText, { color: '#dc2626' }]}>Emergency SOS</Text>
                  <Feather name="chevron-right" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>

              {/* Theme */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>THEME</Text>
                <View style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="moon" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Dark Mode</Text>
                  <Switch 
                    value={isDarkMode} 
                    onValueChange={setIsDarkMode} 
                    trackColor={{ false: '#d1d5db', true: '#fb923c' }}
                    thumbColor={isDarkMode ? '#ea580c' : '#ffffff'}
                  />
                </View>
              </View>

              {/* Help & Support */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>HELP & SUPPORT</Text>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="help-circle" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Support Center</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="file-text" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Feather name="shield" size={18} color="#9a3412" />
                  </View>
                  <Text style={styles.menuItemText}>Privacy Policy</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Logout */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Feather name="log-out" size={18} color="#dc2626" />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    padding: 2,
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  profileDetails: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBadge: {
    backgroundColor: '#b45309',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 24,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  completionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#b45309',
    borderRadius: 3,
  },
  completeBtn: {
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  menuIconBox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffedd5',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  }
});
