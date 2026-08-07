import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { InputField } from '@/components/ui/InputField';
import { MapPickerMock } from '@/components/ui/MapPickerMock';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';

export default function ShopInfoScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (data.hasShop) {
      if (!data.shopName || data.shopName.trim() === '') {
        Alert.alert('Compulsory Field', 'Please enter shop name');
        return;
      }
      if (!data.shopAddress || data.shopAddress.trim() === '') {
        Alert.alert('Compulsory Field', 'Please enter shop address');
        return;
      }
    }

    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/shop-details', {
        hasShop: data.hasShop,
        shopName: data.hasShop ? data.shopName : null,
        shopAddress: data.hasShop ? data.shopAddress : null,
      });

      router.push('/onboarding/services' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save shop details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Shop Information" showBack step={3} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InputField
          label="Shop Name *"
          placeholder="Rahul Bike Garage"
          value={data.shopName}
          onChangeText={(val) => updateData({ shopName: val })}
          icon="storefront-outline"
        />

        <InputField
          label="Shop Address *"
          placeholder="123, Sharma Market, Laxmi Nagar, Delhi - 110092"
          value={data.shopAddress}
          onChangeText={(val) => updateData({ shopAddress: val })}
          multiline
          icon="location-outline"
        />

        <MapPickerMock currentAddress={data.shopAddress} />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={loading ? "Saving..." : "Continue"} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
