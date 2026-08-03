import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';

import LoginScreen from '../../components/screens/LoginScreen';
import SignupScreen from '../../components/screens/SignupScreen';
import HomeScreen from '../../components/screens/HomeScreen';
import BookingScreen from '../../components/screens/BookingScreen';
import ProfileScreen from '../../components/screens/ProfileScreen';
import ResetPasswordScreen from '../../components/screens/ResetPasswordScreen';
import AddBikeScreen from '../../components/screens/AddBikeScreen';
import { registerAuthFailureCallback } from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';

export default function App() {
  // 'loading' — startup pe token check kar raha hai (splash ke jaise)
  const [currentScreen, setCurrentScreen] = useState<string>('loading');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    // Auth failure pe (dono tokens expire) → Login pe bhejo
    registerAuthFailureCallback(() => {
      setCurrentScreen('Login');
    });

    // ── Startup: check karo ki user pehle se logged in hai ────────────────
    const checkExistingSession = async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        // Refresh token hai matlab user logged in tha — seedha Home
        setCurrentScreen('Home');
      } else {
        // Koi token nahi — Login page dikhao
        setCurrentScreen('Login');
      }
    };

    checkExistingSession();

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

  // Startup loading — token check ho raha hai
  if (currentScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={currentScreen === 'Home' || currentScreen === 'AddBike' ? 'light-content' : 'dark-content'}
        backgroundColor={currentScreen === 'Home' || currentScreen === 'AddBike' ? '#f97316' : '#ffffff'}
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
        {currentScreen === 'AddBike' && (
          <AddBikeScreen onNavigate={setCurrentScreen} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});