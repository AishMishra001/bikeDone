import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { auth } from '@/config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function MobileScreen() {
  const router = useRouter();
  const { data, updateData, prefillDummyData, setConfirmationResult } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!data.mobileNumber || data.mobileNumber.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const res: any = await api.post('/auth/mechanic/send-otp', {
        mobileNumber: data.mobileNumber,
      });

      if (res.clientShouldInitiateFirebase || res.provider === 'FIREBASE') {
        const formattedPhone = `+91${data.mobileNumber}`;
        const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';
        const isLocalhost =
          isWeb &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.'));

        let recaptchaVerifier: any = null;

        if (isWeb && !isLocalhost && typeof document !== 'undefined' && document.body) {
          try {
            let container = document.getElementById('recaptcha-container');
            if (!container) {
              container = document.createElement('div');
              container.id = 'recaptcha-container';
              document.body.appendChild(container);
            }
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible',
            });
          } catch (err) {
            console.warn('RecaptchaVerifier init warning:', err);
          }
        }

        if (!recaptchaVerifier) {
          recaptchaVerifier = {
            type: 'recaptcha',
            verify: async () => 'fake-recaptcha-token',
            _reset: () => {},
            _resetRecaptchaToken: () => {},
            clear: () => {},
          };
        }

        try {
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
          setConfirmationResult(confirmation);
        } catch (fbErr: any) {
          console.warn('Firebase signInWithPhoneNumber fallback:', fbErr);
        }
      }

      router.push({
        pathname: '/onboarding/otp' as any,
        params: { provider: res.provider, clientShouldInitiateFirebase: String(res.clientShouldInitiateFirebase) }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Demo prefill bar */}
        <TouchableOpacity style={styles.demoBar} onPress={prefillDummyData}>
          <Ionicons name="flash" size={14} color={Colors.primary} />
          <Text style={styles.demoText}>Fill Demo Data</Text>
        </TouchableOpacity>

        <View style={styles.headerBox}>
          <Text style={styles.title}>Welcome to{'\n'}Bike Done Partner</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
        </View>

        <View style={styles.formBox}>
          <InputField
            label="Mobile Number"
            prefixText="+91"
            placeholder="98765 43210"
            keyboardType="number-pad"
            maxLength={10}
            value={data.mobileNumber}
            onChangeText={(val) => updateData({ mobileNumber: val })}
            icon="call-outline"
          />

          <PrimaryButton title={loading ? "Sending..." : "Send OTP"} onPress={handleSendOTP} style={{ marginTop: 12 }} />
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  demoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 20,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerBox: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 8,
    fontWeight: '500',
  },
  formBox: {
    marginBottom: 24,
  },
  footerBox: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
