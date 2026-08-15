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
import FindingMechanicScreen from '../../components/screens/FindingMechanicScreen';
import MyRequestsScreen from '../../components/screens/MyRequestsScreen';
import RequestDetailScreen from '../../components/screens/RequestDetailScreen';
import CustomerChatScreen from '../../components/screens/CustomerChatScreen';
import GarageScreen from '../../components/screens/GarageScreen';
import SavedAddressesScreen from '../../components/screens/SavedAddressesScreen';
import AddAddressScreen from '../../components/screens/AddAddressScreen';
import InspectionScreen from '../../components/screens/InspectionScreen';
import NotServiceableScreen from '../../components/screens/NotServiceableScreen';
import AppBottomNavigation from '../../components/ui/AppBottomNavigation';
import { checkServiceability, POPULAR_NOIDA_HUBS, ServiceabilityResult } from '../../utils/geoUtils';
import { fetchCurrentLocation, UserLocationData } from '../../services/locationService';
import { registerAuthFailureCallback } from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('loading');
  const [previousScreen, setPreviousScreen] = useState<string>('Inspection');
  const [resetToken, setResetToken] = useState('');
  const [lastRequestNumber, setLastRequestNumber] = useState('');
  const [lastRequestId, setLastRequestId] = useState('');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState<any>(null);

  const [userLocation, setUserLocation] = useState<UserLocationData | null>(null);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);
  const [hasChosenNoidaLocation, setHasChosenNoidaLocation] = useState<boolean>(false);

  const checkCustomerServiceability = async (): Promise<ServiceabilityResult | null> => {
    try {
      const locResult = await fetchCurrentLocation();
      if (locResult && locResult.success && locResult.location) {
        setUserLocation(locResult.location);
        const result = checkServiceability(locResult.location);
        setServiceability(result);
        return result;
      }
    } catch (e) {
      console.warn('Serviceability check failed:', e);
    }
    return null;
  };

  useEffect(() => {
    registerAuthFailureCallback(() => {
      setCurrentScreen('Login');
    });

    const checkExistingSession = async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        const servResult = await checkCustomerServiceability();
        if (servResult && !servResult.isServiceable && !hasChosenNoidaLocation) {
          setCurrentScreen('NotServiceable');
        } else {
          setCurrentScreen('Home');
        }
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

  const handleNavigate = (nextScreen: string, params?: any) => {
    const target = nextScreen === 'Booking' ? 'RoutineService' : nextScreen;
    if (params?.requestId) {
      if (['RequestDetail', 'CustomerChat'].includes(target)) {
        setSelectedRequestId(params.requestId);
      }
      if (['FindingMechanic'].includes(target)) {
        setLastRequestId(params.requestId);
        if (params.requestNumber) setLastRequestNumber(params.requestNumber);
      }
    }
    if (target !== currentScreen) {
      setPreviousScreen(currentScreen);
      setCurrentScreen(target);
    }
  };

  const handleRequestSuccess = (requestNumber: string, requestId?: string) => {
    setLastRequestNumber(requestNumber);
    if (requestId) setLastRequestId(requestId);
  };

  const handleReview = (data: ReviewData) => {
    setPreviousScreen(currentScreen);
    setReviewData(data);
    setCurrentScreen('BookingReview');
  };

  const handleViewDetails = (id: string) => {
    setSelectedRequestId(id);
    setCurrentScreen('RequestDetail');
  };

  const handleSelectNoidaHub = (hub: typeof POPULAR_NOIDA_HUBS[0]) => {
    const simulatedLoc: UserLocationData = {
      latitude: hub.latitude,
      longitude: hub.longitude,
      shortAddress: hub.name,
      fullAddress: `${hub.name}, ${hub.landmark}, Uttar Pradesh 201301`,
      area: hub.name,
      city: 'Noida',
      region: 'Uttar Pradesh',
      postalCode: '201301',
    };
    setUserLocation(simulatedLoc);
    setHasChosenNoidaLocation(true);
    setServiceability({
      isServiceable: true,
      city: 'Noida',
      matchedZone: 'Noida & Greater Noida Zone',
    });
    setCurrentScreen('Home');
  };

  const handleRefreshLocation = async () => {
    setHasChosenNoidaLocation(false);
    const res = await checkCustomerServiceability();
    if (res && res.isServiceable) {
      setCurrentScreen('Home');
    }
  };

  const handleLogout = async () => {
    await tokenStorage.clear();
    setCurrentScreen('Login');
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
        barStyle={currentScreen === 'AddBike' ? 'light-content' : 'dark-content'}
        backgroundColor={currentScreen === 'AddBike' ? '#f97316' : '#f9fafb'}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {currentScreen === 'NotServiceable' && (
          <NotServiceableScreen
            detectedLocation={userLocation}
            serviceabilityResult={serviceability}
            onRefreshLocation={handleRefreshLocation}
            onSelectNoidaHub={handleSelectNoidaHub}
            onLogout={handleLogout}
          />
        )}
        {currentScreen === 'Login' && (
          <LoginScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'Signup' && (
          <SignupScreen onNavigate={handleNavigate} />
        )}
        {['Home', 'Profile', 'SavedAddresses', 'AddAddress'].includes(currentScreen) && (
          <HomeScreen 
            onNavigate={handleNavigate} 
            initialSidebarOpen={currentScreen !== 'Home'} 
          />
        )}
        {currentScreen === 'FullProfile' && (
          <ProfileScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'Inspection' && (
          <InspectionScreen
            onNavigate={handleNavigate}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
            serviceTypeLabel="Inspection"
          />
        )}
        {currentScreen === 'RoutineService' && (
          <InspectionScreen
            onNavigate={handleNavigate}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
            serviceTypeLabel="Routine Service"
          />
        )}
        {currentScreen === 'Repair' && (
          <InspectionScreen
            onNavigate={handleNavigate}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
            serviceTypeLabel="Repair"
          />
        )}
        {currentScreen === 'Emergency' && (
          <InspectionScreen
            onNavigate={handleNavigate}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
            serviceTypeLabel="Emergency"
            isEmergency={true}
          />
        )}
        {currentScreen === 'Booking' && (
          <InspectionScreen
            onNavigate={handleNavigate}
            onRequestSuccess={handleRequestSuccess}
            onReview={handleReview}
            serviceTypeLabel="Routine Service"
          />
        )}
        {currentScreen === 'BookingReview' && reviewData && (
          <BookingReviewScreen
            reviewData={reviewData}
            onConfirm={(requestNumber, requestId) => {
              handleRequestSuccess(requestNumber, requestId);
            }}
            onBack={() => setCurrentScreen(previousScreen || 'Inspection')}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'ResetPassword' && (
          <ResetPasswordScreen
            initialToken={resetToken}
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === 'AddBike' && (
          <AddBikeScreen
            onNavigate={handleNavigate}
            onBack={() => setCurrentScreen(previousScreen || 'Inspection')}
          />
        )}
        {currentScreen === 'FindingMechanic' && (
          <FindingMechanicScreen
            onNavigate={handleNavigate}
            requestId={lastRequestId}
            requestNumber={lastRequestNumber}
          />
        )}
        {currentScreen === 'RequestSuccess' && (
          <RequestSuccessScreen
            onNavigate={handleNavigate}
            requestNumber={lastRequestNumber}
          />
        )}
        {currentScreen === 'MyRequests' && (
          <MyRequestsScreen
            onNavigate={handleNavigate}
            onViewDetails={handleViewDetails}
          />
        )}
        {currentScreen === 'RequestDetail' && selectedRequestId && (
          <RequestDetailScreen
            requestId={selectedRequestId}
            onBack={() => setCurrentScreen('MyRequests')}
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === 'CustomerChat' && selectedRequestId && (
          <CustomerChatScreen
            requestId={selectedRequestId}
            onBack={() => setCurrentScreen(previousScreen || 'RequestDetail')}
          />
        )}
        {currentScreen === 'Garage' && (
          <GarageScreen onNavigate={handleNavigate} />
        )}

        {['SavedAddresses', 'AddAddress'].includes(currentScreen) && (
          <SavedAddressesScreen 
            isActive={currentScreen === 'SavedAddresses'}
            onNavigate={(screen, params) => {
              if (screen === 'AddAddress') {
                setEditAddress(params?.address || null);
              }
              handleNavigate(screen);
            }} 
          />
        )}
        {currentScreen === 'AddAddress' && (
          <AddAddressScreen 
            onNavigate={handleNavigate} 
            initialAddress={editAddress} 
          />
        )}
      </KeyboardAvoidingView>
      {(['Home', 'MyRequests', 'Profile', 'FullProfile', 'Garage'] as const).includes(currentScreen as 'Home' | 'MyRequests' | 'Profile' | 'FullProfile' | 'Garage') && (
        <AppBottomNavigation
          activeScreen={currentScreen as 'Home' | 'MyRequests' | 'Profile' | 'FullProfile' | 'Garage'}
          onNavigate={handleNavigate}
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
