import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';
import InputField from '../ui/InputField';
import PrimaryButton from '../ui/PrimaryButton';
import BackButton from '../ui/BackButton';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await api.get<UserProfile>('/users/me');
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load profile details.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      alert("Current Password is required");
      return;
    }

    // Backend regex validation check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("New password must be at least 8 characters, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      alert("🎉 Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to change password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await tokenStorage.clear();
    onNavigate('Login');
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.profileHeader}>
        <BackButton
          style={styles.backButtonOverride}
          onPress={() => onNavigate('Home')}
        />
        <Text style={styles.profileTitle}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingProfile ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#f97316" size="large" />
            <Text style={styles.loadingText}>Fetching profile details...</Text>
          </View>
        ) : (
          profile && (
            <>
              {/* Profile details card */}
              <View style={styles.detailsCard}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {profile.firstName.charAt(0).toUpperCase()}
                      {profile.lastName ? profile.lastName.charAt(0).toUpperCase() : ''}
                    </Text>
                  </View>
                  <View style={styles.avatarDetails}>
                    <Text style={styles.userName}>
                      {profile.firstName} {profile.lastName || ''}
                    </Text>
                    <Text style={styles.userRole}>{profile.role}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Email info */}
                <View style={styles.infoRow}>
                  <Feather name="mail" size={18} color="#6b7280" style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                  <View style={[styles.badge, profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                    <Text style={[styles.badgeText, profile.emailVerified ? styles.verifiedText : styles.unverifiedText]}>
                      {profile.emailVerified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                </View>

                {/* Mobile info */}
                <View style={styles.infoRow}>
                  <Feather name="phone" size={18} color="#6b7280" style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
                    <Text style={styles.infoValue}>{profile.mobileNumber}</Text>
                  </View>
                  <View style={[styles.badge, profile.mobileVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                    <Text style={[styles.badgeText, profile.mobileVerified ? styles.verifiedText : styles.unverifiedText]}>
                      {profile.mobileVerified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Password change card */}
              <View style={styles.passwordCard}>
                <Text style={styles.sectionTitle}>Change Password</Text>
                
                <InputField
                  iconName="lock"
                  placeholder="Current Password"
                  isPassword
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />

                <InputField
                  iconName="lock"
                  placeholder="New Password"
                  isPassword
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />

                <InputField
                  iconName="lock"
                  placeholder="Confirm New Password"
                  isPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />

                <PrimaryButton
                  title="Update Password"
                  loading={updatingPassword}
                  style={{ marginTop: 8 }}
                  onPress={handleChangePassword}
                />
              </View>

              {/* Logout button */}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
  },
  backButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff3eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe4c6',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  avatarDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  userRole: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
  },
  unverifiedBadge: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedText: {
    color: '#16a34a',
  },
  unverifiedText: {
    color: '#dc2626',
  },
  passwordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff5f5',
    borderRadius: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
