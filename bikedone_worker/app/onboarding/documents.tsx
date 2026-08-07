import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { api } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

interface DocItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  uri?: string | null;
  name?: string | null;
  isMandatory: boolean;
}

export default function DocumentsUploadScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const [documents, setDocuments] = useState<Record<string, { uri: string; name: string } | null>>({
    aadhaar: null,
    pan: null,
    drivingLicense: null,
    shopPhoto: null,
  });

  const handlePickDocument = async (key: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocuments((prev) => ({
          ...prev,
          [key]: { uri: file.uri, name: file.name },
        }));
      }
    } catch (err: any) {
      Alert.alert('File Selection Error', err.message || 'Could not pick file');
    }
  };

  const handleContinue = async () => {
    if (!documents.aadhaar) {
      Alert.alert('Compulsory Document', 'Please upload your Aadhaar Card (PDF or Image)');
      return;
    }
    if (!documents.pan) {
      Alert.alert('Compulsory Document', 'Please upload your PAN Card (PDF or Image)');
      return;
    }
    if (!documents.drivingLicense) {
      Alert.alert('Compulsory Document', 'Please upload your Driving License (PDF or Image)');
      return;
    }
    if (data.hasShop && !documents.shopPhoto) {
      Alert.alert('Compulsory Document', 'Please upload your Shop Photo');
      return;
    }

    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/documents', {
        aadhaarUrl: documents.aadhaar.uri,
        panUrl: documents.pan.uri,
        drivingLicenseUrl: documents.drivingLicense.uri,
        shopPhotoUrl: (data.hasShop && documents.shopPhoto) ? documents.shopPhoto.uri : null,
        profilePhotoUrl: data.profilePhoto || 'https://dummy-storage.bikedone.com/docs/profile.jpg',
      });

      router.push('/onboarding/bank-details' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save documents');
    } finally {
      setLoading(false);
    }
  };

  const docList: DocItem[] = [
    {
      id: 'aadhaar',
      title: 'Aadhaar Card *',
      subtitle: 'Upload PDF or Front/Back Image',
      icon: 'card-outline',
      uri: documents.aadhaar?.uri,
      name: documents.aadhaar?.name,
      isMandatory: true,
    },
    {
      id: 'pan',
      title: 'PAN Card *',
      subtitle: 'Upload clear PDF or Image copy',
      icon: 'document-text-outline',
      uri: documents.pan?.uri,
      name: documents.pan?.name,
      isMandatory: true,
    },
    {
      id: 'drivingLicense',
      title: 'Driving License *',
      subtitle: 'Upload valid Driving License PDF/Image',
      icon: 'id-card-outline',
      uri: documents.drivingLicense?.uri,
      name: documents.drivingLicense?.name,
      isMandatory: true,
    },
    ...(data.hasShop
      ? [
          {
            id: 'shopPhoto',
            title: 'Shop Photo *',
            subtitle: 'Upload clear storefront photo with name banner',
            icon: 'image-outline',
            uri: documents.shopPhoto?.uri,
            name: documents.shopPhoto?.name,
            isMandatory: true,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <Header title="Documents Upload" showBack step={6} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerContainer}>
          <Ionicons name="folder-open" size={24} color={Colors.primary} />
          <Text style={styles.bannerText}>
            Please upload clear copies of all mandatory documents from your device folder (PDF or Images).
          </Text>
        </View>

        {docList.map((doc) => {
          const isUploaded = Boolean(doc.uri);

          return (
            <View key={doc.id} style={[styles.docCard, Shadows.small, isUploaded && styles.docCardUploaded]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, isUploaded && styles.iconBoxUploaded]}>
                  <Ionicons
                    name={isUploaded ? 'checkmark-circle' : doc.icon}
                    size={24}
                    color={isUploaded ? Colors.success : Colors.primary}
                  />
                </View>
                <View style={styles.docMeta}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSubtitle} numberOfLines={1}>
                    {isUploaded ? doc.name || 'File Selected' : doc.subtitle}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.uploadBtn, isUploaded && styles.uploadBtnChange]}
                onPress={() => handlePickDocument(doc.id)}
              >
                <Ionicons
                  name={isUploaded ? 'refresh-outline' : 'cloud-upload-outline'}
                  size={18}
                  color={isUploaded ? Colors.gray700 : Colors.textWhite}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.uploadBtnText, isUploaded && styles.uploadBtnTextChange]}>
                  {isUploaded ? 'Change File' : 'Choose File / PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
    backgroundColor: Colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(242, 86, 29, 0.2)',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  docCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.gray100,
  },
  docCardUploaded: {
    borderColor: Colors.success,
    backgroundColor: '#F4FBF7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxUploaded: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  docMeta: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  docSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnChange: {
    backgroundColor: Colors.gray200,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  uploadBtnTextChange: {
    color: Colors.gray800,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
  },
});
