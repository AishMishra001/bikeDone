import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'onboarding/splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <OnboardingProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/splash" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/mobile" />
          <Stack.Screen name="onboarding/otp" />
          <Stack.Screen name="onboarding/welcome" />
          <Stack.Screen name="onboarding/basic-details" />
          <Stack.Screen name="onboarding/shop-type" />
          <Stack.Screen name="onboarding/shop-info" />
          <Stack.Screen name="onboarding/services" />
          <Stack.Screen name="onboarding/expertise" />
          <Stack.Screen name="onboarding/radius" />
          <Stack.Screen name="onboarding/documents" />
          <Stack.Screen name="onboarding/bank-details" />
          <Stack.Screen name="onboarding/review" />
          <Stack.Screen name="onboarding/approval" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </OnboardingProvider>
  );
}
