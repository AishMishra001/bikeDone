import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';

export default function ReviewScreen() {
  const router = useRouter();
  const { data, updateData, goToNextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/submit-verification', {});
      updateData({ status: 'under_review' });
      router.push('/onboarding/approval' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit onboarding application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Review & Submit" showBack stepCode="MANUAL_VERIFICATION" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Please review all application details before final submission</Text>

        {/* Section 1: Basic Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Basic Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/basic-details?edit=true' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContentRow}>
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={styles.avatarImg} />
            ) : null}
            <View>
              <Text style={styles.primaryVal}>{data.fullName || 'Not Provided'}</Text>
              <Text style={styles.secondaryVal}>{data.experience || '1 Year'} Experience</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Shop / Garage Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Shop / Garage Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/shop-info?edit=true' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.shopName || 'Workshop Details'}</Text>
          <Text style={styles.secondaryVal}>{data.shopAddress || 'Address not provided'}</Text>
        </View>

        {/* Section 3: Services Offered */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Services Offered</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/services?edit=true' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>
            {data.services && data.services.length > 0
              ? data.services.slice(0, 3).join(', ') + (data.services.length > 3 ? ` +${data.services.length - 3} more` : '')
              : 'No services selected'}
          </Text>
        </View>

        {/* Section 4: Service Radius */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Service Radius</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/radius?edit=true' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.serviceRadius || '10 KM'}</Text>
        </View>

        {/* Section 5: Bank Details */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bank Details</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/bank-details?edit=true' as any)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.primaryVal}>{data.bankDetails.bankName || 'Bank Account'}</Text>
          <Text style={styles.secondaryVal}>
            A/C: {data.bankDetails.accountNumber ? `**** ${data.bankDetails.accountNumber.slice(-4)}` : 'Not provided'} | IFSC: {data.bankDetails.ifscCode || 'N/A'}
          </Text>
        </View>

        {/* Section 6: Quality SOP Training */}
        <View style={[styles.card, Shadows.small]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quality & SOP Training</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/training-sop?edit=true' as any)}>
              <Text style={styles.editBtn}>Review</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.primaryVal, { color: Colors.success }]}>✓ Service Standards & Pledge Accepted</Text>
          <Text style={styles.secondaryVal}>Committed to 4.7+ star rating & doorstep cleanliness.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={loading ? "Submitting..." : "Submit Application"} onPress={handleSubmit} />
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
