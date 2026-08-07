import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import InputField from '../ui/InputField';
import PrimaryButton from '../ui/PrimaryButton';
import BackButton from '../ui/BackButton';

import { api } from '../../services/api';

interface SignupScreenProps {
  onNavigate: (screen: string) => void;
}

export default function SignupScreen({ onNavigate }: SignupScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim()) {
      alert("First Name is required");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert("Please enter a valid email address");
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number starting with 6-9");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        password
      }, { requiresAuth: false });
      
      setRegisteredEmail(email.trim());
      setShowVerificationModal(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await api.post('/auth/resend-email-verification', { email: registeredEmail }, { requiresAuth: false });
      alert('✉️ Verification email resent! Please check your inbox.');
    } catch (err: any) {
      alert(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => onNavigate('Login')} />

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.subtitleLeft}>
            Join BIKEDONE for instant roadside & garage assistance.
          </Text>
        </View>

        <InputField
          iconName="user"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <InputField
          iconName="user"
          placeholder="Last Name (Optional)"
          value={lastName}
          onChangeText={setLastName}
        />

        <InputField
          iconName="phone"
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />

        <InputField
          iconName="mail"
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          iconName="lock"
          placeholder="Password"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <PrimaryButton
          title="Sign Up"
          loading={loading}
          style={{ marginTop: 20 }}
          onPress={handleSignup}
        />

        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text style={styles.brandText}>Terms of Service</Text> and{' '}
          <Text style={styles.brandText}>Privacy Policy</Text>.
        </Text>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => onNavigate('Login')}>
            <Text style={[styles.brandText, { fontWeight: 'bold' }]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Email Verification Notice Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowVerificationModal(false);
          onNavigate('Login');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconCircle}>
              <Feather name="mail" size={36} color="#f97316" />
            </View>

            <Text style={styles.modalTitle}>Check Your Email ✉️</Text>
            <Text style={styles.modalSubtitle}>
              We have sent a verification link to:
            </Text>
            <Text style={styles.modalEmailText}>{registeredEmail}</Text>

            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={18} color="#d97706" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: 'bold' }}>Important: </Text>
                You cannot log in until your email address is verified. Please check your inbox and verify your token first.
              </Text>
            </View>

            <PrimaryButton
              title="Go to Login"
              onPress={() => {
                setShowVerificationModal(false);
                onNavigate('Login');
              }}
              style={{ width: '100%', marginTop: 8 }}
            />

            <TouchableOpacity
              style={styles.resendButton}
              disabled={resending}
              onPress={handleResendVerification}
            >
              <Text style={styles.resendText}>
                {resending ? 'Sending...' : "Didn't receive email? Resend link"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  titleContainer: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  subtitleLeft: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  termsText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  brandText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 12,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff3eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe4c6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalEmailText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f97316',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#fef08a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

