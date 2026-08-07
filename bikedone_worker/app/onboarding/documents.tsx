import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { DocumentUploadRow } from '@/components/ui/DocumentUploadRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';

export default function DocumentsUploadScreen() {
  const router = useRouter();
  const { data, updateDocuments } = useOnboarding();

  const handleContinue = () => {
    router.push('/onboarding/bank-details' as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Documents Upload" showBack step={7} totalSteps={9} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Upload required documents</Text>

        <DocumentUploadRow
          title="Aadhaar Card"
          uploaded={data.documents.aadhaar}
          onToggleUpload={() => updateDocuments('aadhaar', !data.documents.aadhaar)}
        />

        <DocumentUploadRow
          title="Driving License"
          uploaded={data.documents.drivingLicense}
          onToggleUpload={() => updateDocuments('drivingLicense', !data.documents.drivingLicense)}
        />

        <DocumentUploadRow
          title="Shop Photo"
          uploaded={data.documents.shopPhoto}
          onToggleUpload={() => updateDocuments('shopPhoto', !data.documents.shopPhoto)}
        />

        <DocumentUploadRow
          title="Profile Photo"
          uploaded={data.documents.profilePhoto}
          avatarUri={data.profilePhoto}
          onToggleUpload={() => updateDocuments('profilePhoto', !data.documents.profilePhoto)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
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
