import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleSubmit = () => {
    updateData({ status: 'under_review' });
    router.push('/onboarding/approval' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Review & Submit" showBack step={9} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Please review your details before submitting</Text>

        {/* Section 1: Basic Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Basic Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/basic-details' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContentRow}>
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={styles.avatarImg} />
            ) : null}
            <View>
              <Text style={styles.primaryVal}>{data.fullName || 'Rahul Kumar'}</Text>
              <Text style={styles.secondaryVal}>{data.experience || '5 Years'} Experience</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Shop Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Shop Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/shop-type' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.hasShop ? data.shopName : 'Mobile Mechanic'}</Text>
          {data.hasShop ? <Text style={styles.secondaryVal}>{data.shopAddress}</Text> : null}
        </View>

        {/* Section 3: Services Offered */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Services Offered</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/services' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>
            {data.services.length > 0
              ? data.services.slice(0, 3).join(', ') + (data.services.length > 3 ? ` +${data.services.length - 3} more` : '')
              : 'No services selected'}
          </Text>
        </View>

        {/* Section 4: Service Radius */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Service Radius</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/radius' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.serviceRadius || '5 KM'}</Text>
        </View>

        {/* Section 5: Bank Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bank Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/bank-details' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.bankDetails.bankName || 'Punjab National Bank'}</Text>
          <Text style={styles.secondaryVal}>
            A/C: **** {data.bankDetails.accountNumber ? data.bankDetails.accountNumber.slice(-4) : '9012'} | IFSC: {data.bankDetails.ifscCode || 'PUNB0123456'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Submit for Review" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  primaryVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  secondaryVal: {
    fontSize: 13,
    color: Colors.gray600,
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
  },
});
