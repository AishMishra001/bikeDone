import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Linking from 'expo-linking';

import LoginScreen from '../../components/screens/LoginScreen';
import SignupScreen from '../../components/screens/SignupScreen';
import HomeScreen from '../../components/screens/HomeScreen';
import BookingScreen from '../../components/screens/BookingScreen';
import ProfileScreen from '../../components/screens/ProfileScreen';
import ResetPasswordScreen from '../../components/screens/ResetPasswordScreen';
import { registerAuthFailureCallback, api } from '../../services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    registerAuthFailureCallback(() => {
      setCurrentScreen('Login');
    });

    const processUrl = async (urlStr: string | null) => {
      if (!urlStr) return;

      try {
        const parsed = Linking.parse(urlStr);
        let token = (parsed.queryParams?.token as string) || '';
        const path = parsed.path || '';
        const hostname = parsed.hostname || '';

        // Web browser URL parsing fallback
        if (Platform.OS === 'web' && typeof window !== 'undefined' && !token) {
          const searchParams = new URLSearchParams(window.location.search);
          token = searchParams.get('token') || '';
        }

        const isResetPassword =
          path.includes('reset-password') ||
          hostname.includes('reset-password') ||
          urlStr.includes('reset-password');


        if (isResetPassword) {
          if (token) {
            setResetToken(token);
          }
          setCurrentScreen('ResetPassword');
        }
      } catch (err) {
        console.error('Error handling deep link:', err);
      }
    };

    // Check initial URL on startup
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      processUrl(window.location.href);
    } else {
      Linking.getInitialURL().then(processUrl);
    }

    // Listen for incoming deep link events
    const subscription = Linking.addEventListener('url', (event) => {
      processUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={currentScreen === 'Home' ? 'light-content' : 'dark-content'}
        backgroundColor={currentScreen === 'Home' ? '#f97316' : '#ffffff'}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {currentScreen === 'Login' && (
          <LoginScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'Signup' && (
          <SignupScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'Home' && (
          <HomeScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'Booking' && (
          <BookingScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'Profile' && (
          <ProfileScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'ResetPassword' && (
          <ResetPasswordScreen
            initialToken={resetToken}
            onNavigate={setCurrentScreen}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});