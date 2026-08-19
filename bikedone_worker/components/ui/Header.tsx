import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  stepCode?: string;
  step?: number;
  totalSteps?: number;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  stepCode,
  step,
  totalSteps = 8,
  rightAction,
}) => {
  const router = useRouter();
  const { getMetrics, goToPrevStep } = useOnboarding();

  const metrics = stepCode ? getMetrics(stepCode) : null;
  const currentStep = metrics ? metrics.stepIndex : step;
  const stepCount = metrics ? metrics.totalSteps : totalSteps;
  const progressPercent = metrics ? metrics.progressPercent : (step ? Math.min(100, Math.max(0, (step / stepCount) * 100)) : 0);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (stepCode) {
      goToPrevStep(stepCode, router);
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const displayTitle = title || (metrics?.currentStep?.title ?? '');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.titleText}>{displayTitle}</Text>

        <View style={styles.rightSlot}>{rightAction || <View style={styles.placeholder} />}</View>
      </View>

      {currentStep ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.stepText}>Step {currentStep} of {stepCount}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray200,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray500,
  },
});
