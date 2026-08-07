import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';

export default function BankDetailsScreen() {
  const router = useRouter();
  const { data, updateBankDetails } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!data.bankDetails.accountHolderName || !data.bankDetails.accountNumber || !data.bankDetails.ifscCode || !data.bankDetails.bankName) {
      Alert.alert('Compulsory Fields', 'Please fill in all bank details');
      return;
    }

    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/bank-details', {
        accountHolderName: data.bankDetails.accountHolderName,
        accountNumber: data.bankDetails.accountNumber,
        ifscCode: data.bankDetails.ifscCode,
        bankName: data.bankDetails.bankName,
      });

      router.push('/onboarding/review' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Bank Details" showBack step={7} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Add bank details for payout (All compulsory)</Text>

        <InputField
          label="Account Holder Name *"
          placeholder="Rahul Kumar"
          value={data.bankDetails.accountHolderName}
          onChangeText={(val) => updateBankDetails({ accountHolderName: val })}
          icon="person-outline"
        />

        <InputField
          label="Account Number *"
          placeholder="123456789012"
          keyboardType="number-pad"
          value={data.bankDetails.accountNumber}
          onChangeText={(val) => updateBankDetails({ accountNumber: val })}
          icon="card-outline"
        />

        <InputField
          label="IFSC Code *"
          placeholder="PUNB0123456"
          autoCapitalize="characters"
          value={data.bankDetails.ifscCode}
          onChangeText={(val) => updateBankDetails({ ifscCode: val.toUpperCase() })}
          icon="barcode-outline"
        />

        <InputField
          label="Bank Name *"
          placeholder="Punjab National Bank"
          value={data.bankDetails.bankName}
          onChangeText={(val) => updateBankDetails({ bankName: val })}
          icon="business-outline"
        />
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
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.cardBackground,
  },
});
