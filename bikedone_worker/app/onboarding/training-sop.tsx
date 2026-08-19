import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/services/api';

const SOP_PILLARS = [
  {
    id: 'etiquette',
    icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Professional Uniform & Etiquette',
    description: 'Wear clean MyKaarigar partner uniform/apron, greet customer respectfully, and maintain personal hygiene.',
  },
  {
    id: 'inspection',
    icon: 'camera-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Pre & Post Service Photos',
    description: 'Always click before-service photos (odometer, dents) and post-service completed work photos in the app.',
  },
  {
    id: 'cleanliness',
    icon: 'shield-checkmark-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Floor Mat & Zero Stain Guarantee',
    description: 'Always lay down the protective service mat underneath the bike. Never leave oil or grease on customer premises.',
  },
  {
    id: 'parts',
    icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
    title: '100% Genuine Spare Parts Policy',
    description: 'Use authentic OEM parts only. Show old replaced parts and new packaging boxes to the customer for full transparency.',
  },
];

export default function TrainingSopScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';
  const { data, updateData, goToNextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [checkedPillars, setCheckedPillars] = useState<Record<string, boolean>>({
    etiquette: true,
    inspection: true,
    cleanliness: true,
    parts: true,
  });
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  const togglePillar = (id: string) => {
    setCheckedPillars((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allPillarsChecked = SOP_PILLARS.every((p) => checkedPillars[p.id]);

  const handleContinue = async () => {
    if (!allPillarsChecked) {
      Alert.alert('Incomplete SOP Review', 'Please review and acknowledge all 4 service quality standards.');
      return;
    }
    if (!pledgeAccepted) {
      Alert.alert('Pledge Required', 'Please accept the MyKaarigar Partner Service Quality Pledge.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/mechanics/onboarding/training-sop', {});
      updateData({ sopAccepted: true });
      goToNextStep('TRAINING_SOP', router, isEditing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit SOP training acknowledgement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Quality & SOP Training" showBack stepCode="TRAINING_SOP" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <Ionicons name="ribbon" size={28} color={Colors.primary} />
          </View>
          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>MyKaarigar Partner Quality Standards</Text>
            <Text style={styles.heroSubtitle}>
              Top-rated MyKaarigar partner mechanics earn up to ₹45,000/month by following these 4 golden quality standards.
            </Text>
          </View>
        </View>

        {/* Video Briefing Card */}
        <View style={[styles.videoCard, Shadows.small]}>
          <View style={styles.videoThumbnail}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color={Colors.primary} style={{ marginLeft: 3 }} />
            </View>
            <View style={styles.videoDurationBadge}>
              <Text style={styles.videoDurationText}>2:45 min training</Text>
            </View>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>Doorstep Service Masterclass</Text>
            <Text style={styles.videoDesc}>How to get 5-star customer ratings on every single order.</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>4 Quality Pillars (Tap to Confirm)</Text>

        {/* Pillar List */}
        {SOP_PILLARS.map((pillar) => {
          const isChecked = Boolean(checkedPillars[pillar.id]);

          return (
            <TouchableOpacity
              key={pillar.id}
              activeOpacity={0.8}
              onPress={() => togglePillar(pillar.id)}
              style={[styles.pillarCard, Shadows.small, isChecked && styles.pillarCardChecked]}
            >
              <View style={styles.pillarRow}>
                <View style={[styles.pillarIconBox, isChecked && styles.pillarIconBoxChecked]}>
                  <Ionicons
                    name={pillar.icon}
                    size={22}
                    color={isChecked ? Colors.primary : Colors.gray500}
                  />
                </View>

                <View style={styles.pillarContent}>
                  <Text style={styles.pillarTitle}>{pillar.title}</Text>
                  <Text style={styles.pillarDesc}>{pillar.description}</Text>
                </View>

                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked ? <Ionicons name="checkmark" size={16} color={Colors.textWhite} /> : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Safety & Service Pledge Box */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setPledgeAccepted(!pledgeAccepted)}
          style={[styles.pledgeBox, pledgeAccepted && styles.pledgeBoxActive]}
        >
          <View style={[styles.checkbox, pledgeAccepted && styles.checkboxChecked, { marginTop: 2 }]}>
            {pledgeAccepted ? <Ionicons name="checkmark" size={16} color={Colors.textWhite} /> : null}
          </View>
          <Text style={styles.pledgeText}>
            I pledge to deliver professional doorstep service, adhere to MyKaarigar Partner quality protocols, and maintain at least 4.7+ customer rating.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={loading ? "Saving Progress..." : "Agree & Continue"}
          onPress={handleContinue}
        />
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
    paddingBottom: 28,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    gap: 14,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  heroTextBox: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 18,
  },
  videoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  videoThumbnail: {
    height: 120,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoDurationText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  videoDesc: {
    fontSize: 12,
    color: Colors.gray500,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 14,
  },
  pillarCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  pillarCardChecked: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFDFB',
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillarIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarIconBoxChecked: {
    backgroundColor: Colors.primaryLight,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    color: Colors.gray600,
    lineHeight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pledgeBox: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  pledgeBoxActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  pledgeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
  },
});
