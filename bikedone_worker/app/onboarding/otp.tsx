import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api, tokenStorage } from '@/services/api';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data, updateData, confirmationResult } = useOnboarding();
  const [timer, setTimer] = useState(30);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (text: string, index: number) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    updateData({ otp: newDigits.join('') });

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      try {
        await api.post('/auth/mechanic/send-otp', { mobileNumber: data.mobileNumber });
        setTimer(30);
        setDigits(['', '', '', '', '', '']);
        Alert.alert('Success', 'OTP resent successfully');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to resend OTP');
      }
    }
  };

  const handleVerify = async () => {
    const enteredOtp = digits.join('');
    if (enteredOtp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const isFirebase = params.clientShouldInitiateFirebase === 'true' || params.provider === 'FIREBASE';

      let loginRes: any;
      if (isFirebase && confirmationResult && typeof confirmationResult.confirm === 'function') {
        // Firebase Client Verification -> Get ID Token
        const userCredential = await confirmationResult.confirm(enteredOtp);
        const firebaseIdToken = await userCredential.user.getIdToken();

        // Submit real Firebase ID Token to Backend
        loginRes = await api.post('/auth/mechanic/verify-firebase-token', {
          mobileNumber: data.mobileNumber,
          firebaseIdToken: firebaseIdToken,
        });
      } else {
        loginRes = await api.post('/auth/mechanic/verify-otp', {
          mobileNumber: data.mobileNumber,
          otp: enteredOtp,
        });
      }

      if (loginRes.accessToken) {
        await tokenStorage.setAccessToken(loginRes.accessToken);
        if (loginRes.refreshToken) {
          await tokenStorage.setRefreshToken(loginRes.refreshToken);
        }
        if (loginRes.mechanic) {
          await tokenStorage.setMechanic(loginRes.mechanic);
        }

        try {
          const onboardingData: any = await api.get('/mechanics/onboarding');
          const overallStatus = onboardingData?.overallStatus || loginRes.mechanic?.status;
          if (overallStatus === 'ACTIVE' || overallStatus === 'APPROVED' || onboardingData?.personalInfo) {
            router.replace('/(tabs)' as any);
            return;
          } else if (overallStatus === 'SUBMITTED' || overallStatus === 'UNDER_REVIEW') {
            router.replace('/onboarding/approval' as any);
            return;
          }
        } catch {
          const status = loginRes.mechanic?.status;
          if (status === 'ACTIVE' || status === 'APPROVED') {
            router.replace('/(tabs)' as any);
            return;
          }
        }
      }

      router.push('/onboarding/welcome' as any);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid Firebase OTP or token verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Verify OTP" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBox}>
            <Text style={styles.subtitle}>
              Enter the OTP sent to{' '}
              <Text style={styles.phoneText}>+91 {data.mobileNumber || '98765 43210'}</Text>
            </Text>
          </View>

          <View style={styles.otpGrid}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                style={[styles.otpBox, digits[index] ? styles.otpBoxFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digits[index]}
                onChangeText={(val) => handleDigitChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0}
            style={styles.resendBox}
          >
            <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
              {timer > 0 ? `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          <PrimaryButton title={loading ? "Verifying..." : "Verify OTP"} onPress={handleVerify} style={{ marginTop: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  headerBox: {
    marginBottom: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray600,
    textAlign: 'center',
  },
  phoneText: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  resendBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendTextDisabled: {
    color: Colors.gray400,
  },
});
