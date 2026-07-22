import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView
} from 'react-native';
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
      
      alert("🎉 Customer registered successfully! Please log in.");
      onNavigate('Login');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Registration failed. Please check your details and try again.");
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
});
