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
import BookingReviewScreen, { ReviewData } from '../../components/screens/BookingReviewScreen';
import ProfileScreen from '../../components/screens/ProfileScreen';
import ResetPasswordScreen from '../../components/screens/ResetPasswordScreen';
import AddBikeScreen from '../../components/screens/AddBikeScreen';
import RequestSuccessScreen from '../../components/screens/RequestSuccessScreen';
import MyRequestsScreen from '../../components/screens/MyRequestsScreen';
import RequestDetailScreen from '../../components/screens/RequestDetailScreen';
import AppBottomNavigation from '../../components/ui/AppBottomNavigation';
import { registerAuthFailureCallback } from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('loading');
  const [resetToken, setResetToken] = useState('');
  const [lastRequestNumber, setLastRequestNumber] = useState('');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    registerAuthFailureCallback(() => {
      setCurrentScreen('Login');
    });

    const checkExistingSession = async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        setCurrentScreen('Home');
      } else {
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

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      processUrl(window.location.href);
    } else {
      Linking.getInitialURL().then(processUrl);
    }

    const subscription = Linking.addEventListener('url', (event) => {
      processUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleRequestSuccess = (requestNumber: string) => {
    setLastRequestNumber(requestNumber);
  };

  const handleReview = (data: ReviewData) => {
    setReviewData(data);
    setCurrentScreen('BookingReview');
  };

  const handleViewDetails = (id: string) => {
    setSelectedRequestId(id);
    setCurrentScreen('RequestDetail');
  };

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
          <BookingScreen
            onNavigate={setCurrentScreen}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
          />
        )}
        {currentScreen === 'BookingReview' && reviewData && (
          <BookingReviewScreen
            reviewData={reviewData}
            onConfirm={(requestNumber) => {
              handleRequestSuccess(requestNumber);
            }}
            onBack={() => setCurrentScreen('Booking')}
            onNavigate={setCurrentScreen}
          />
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
        {currentScreen === 'RequestSuccess' && (
          <RequestSuccessScreen
            onNavigate={setCurrentScreen}
            requestNumber={lastRequestNumber}
          />
        )}
        {currentScreen === 'MyRequests' && (
          <MyRequestsScreen
            onNavigate={setCurrentScreen}
            onViewDetails={handleViewDetails}
          />
        )}
        {currentScreen === 'RequestDetail' && selectedRequestId && (
          <RequestDetailScreen
            requestId={selectedRequestId}
            onBack={() => setCurrentScreen('MyRequests')}
            onNavigate={setCurrentScreen}
          />
        )}
      </KeyboardAvoidingView>
      {(['Home', 'MyRequests', 'Profile'] as const).includes(currentScreen as 'Home' | 'MyRequests' | 'Profile') && (
        <AppBottomNavigation
          activeScreen={currentScreen as 'Home' | 'MyRequests' | 'Profile'}
          onNavigate={setCurrentScreen}
        />
      )}
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
