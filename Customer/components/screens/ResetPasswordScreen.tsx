import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import InputField from '../ui/InputField';
import PrimaryButton from '../ui/PrimaryButton';
import { api } from '../../services/api';

interface ResetPasswordScreenProps {
  initialToken?: string;
  onNavigate: (screen: string) => void;
}

export default function ResetPasswordScreen({
  initialToken = '',
  onNavigate
}: ResetPasswordScreenProps) {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const handleResetPassword = async () => {
    if (!token.trim()) {
      alert('Password reset token is missing or invalid.');
      return;
    }

    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character (e.g. @$!%*?&#).'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post<any>(
        '/auth/reset-password',
        {
          token: token.trim(),
          newPassword,
          confirmPassword
        },
        { requiresAuth: false }
      );

      if (Platform.OS === 'web') {
        alert('🎉 Password reset successfully! Redirecting to login...');
        onNavigate('Login');
      } else {
        Alert.alert(
          'Success 🎉',
          'Password reset successfully! You can now log in with your new password.',
          [
            {
              text: 'Log In',
              onPress: () => onNavigate('Login'),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('Login')}
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.iconBox}>
            <Feather name="key" size={32} color="#f97316" />
          </View>
          <Text style={styles.headerTitle}>Reset Password 🔒</Text>
          <Text style={styles.subtitle}>
            Enter your new password to secure your BikeDone account.
          </Text>
        </View>

        {/* Token field (Hidden or readonly if auto-filled, editable if manually pasting) */}
        {!initialToken && (
          <InputField
            iconName="shield"
            placeholder="Reset Token"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
        )}

        {/* Inputs */}
        <InputField
          iconName="lock"
          placeholder="New Password"
          isPassword
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />

        <InputField
          iconName="check-circle"
          placeholder="Confirm New Password"
          isPassword
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />

        <Text style={styles.hintText}>
          Must contain at least 8 characters, uppercase, lowercase, number & special character.
        </Text>

        {/* Reset Button */}
        <PrimaryButton
          title="Reset Password"
          loading={loading}
          onPress={handleResetPassword}
        />

        <View style={styles.spacer} />

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => onNavigate('Login')}
        >
          <Text style={styles.brandText}>Back to Log In</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#fff3eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe4c6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  brandText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 14,
  },
});
