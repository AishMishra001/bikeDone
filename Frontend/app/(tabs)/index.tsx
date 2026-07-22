import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import LoginScreen from '../../components/screens/LoginScreen';
import SignupScreen from '../../components/screens/SignupScreen';
import HomeScreen from '../../components/screens/HomeScreen';
import BookingScreen from '../../components/screens/BookingScreen';
import ProfileScreen from '../../components/screens/ProfileScreen';
import { registerAuthFailureCallback } from '../../services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');

  useEffect(() => {
    registerAuthFailureCallback(() => {
      setCurrentScreen('Login');
    });
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