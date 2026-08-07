import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import ResetPasswordScreen from '../components/screens/ResetPasswordScreen';

export default function ResetPasswordRoute() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    if (screen === 'Login') {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    }
  };

  return (
    <ResetPasswordScreen
      initialToken={token || ''}
      onNavigate={handleNavigate}
    />
  );
}
