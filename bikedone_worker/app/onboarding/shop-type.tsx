import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ShopTypeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Having a shop/garage is now compulsory for all mechanics. Direct redirect to shop-info.
    router.replace('/onboarding/shop-info' as any);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.lightBackground }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
