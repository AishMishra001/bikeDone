import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '@/services/api';
import {
  ServerStepDetail,
  getNextStepRoute,
  getPrevStepRoute,
  getStepMetrics,
  resolveActiveSteps,
} from '@/config/onboardingSteps';

export interface OnboardingData {
  mobileNumber: string;
  otp: string;
  fullName: string;
  experience: string;
  profilePhoto: string | null;
  hasShop: boolean;
  shopName: string;
  shopAddress: string;
  workingHours: string;
  services: string[];
  expertise: string[];
  serviceRadius: string;
  documents: {
    aadhaar: boolean;
    drivingLicense: boolean;
    shopPhoto: boolean;
    profilePhoto: boolean;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  sopAccepted: boolean;
  status: 'pending' | 'under_review' | 'approved';
}

const DEFAULT_DATA: OnboardingData = {
  mobileNumber: '',
  otp: '',
  fullName: '',
  experience: '1 Year',
  profilePhoto: null,
  hasShop: true,
  shopName: '',
  shopAddress: '',
  workingHours: '09:00 AM To 08:30 PM (Mon - Sat)',
  services: [],
  expertise: [],
  serviceRadius: '10 KM',
  documents: {
    aadhaar: false,
    drivingLicense: false,
    shopPhoto: false,
    profilePhoto: false,
  },
  bankDetails: {
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  },
  sopAccepted: false,
  status: 'pending',
};

interface OnboardingContextType {
  data: OnboardingData;
  activeSteps: ServerStepDetail[];
  updateData: (partial: Partial<OnboardingData>) => void;
  updateBankDetails: (partialBank: Partial<OnboardingData['bankDetails']>) => void;
  updateDocuments: (docKey: keyof OnboardingData['documents'], status: boolean) => void;
  toggleService: (service: string) => void;
  toggleExpertise: (item: string) => void;
  confirmationResult: any;
  setConfirmationResult: (res: any) => void;
  resetData: () => void;
  prefillDummyData: () => void;
  fetchProgress: () => Promise<any>;
  goToNextStep: (currentCode: string, router: any, isEditing?: boolean) => void;
  goToPrevStep: (currentCode: string, router: any) => void;
  getMetrics: (currentCode: string) => {
    stepIndex: number;
    totalSteps: number;
    progressPercent: number;
    isFirst: boolean;
    isLast: boolean;
    currentStep: any;
  };
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [activeSteps, setActiveSteps] = useState<ServerStepDetail[]>([]);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const updateBankDetails = (partialBank: Partial<OnboardingData['bankDetails']>) => {
    setData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...partialBank },
    }));
  };

  const updateDocuments = (docKey: keyof OnboardingData['documents'], status: boolean) => {
    setData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docKey]: status },
    }));
  };

  const toggleService = (service: string) => {
    setData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const toggleExpertise = (item: string) => {
    setData((prev) => {
      const exists = prev.expertise.includes(item);
      return {
        ...prev,
        expertise: exists
          ? prev.expertise.filter((e) => e !== item)
          : [...prev.expertise, item],
      };
    });
  };

  const fetchProgress = async () => {
    try {
      const res: any = await api.get('/mechanics/onboarding');
      if (res && Array.isArray(res.steps)) {
        setActiveSteps(res.steps);
      }
      return res;
    } catch (err) {
      console.warn('Failed to fetch onboarding progress:', err);
      return null;
    }
  };

  const goToNextStep = (currentCode: string, router: any, isEditing?: boolean) => {
    if (isEditing) {
      router.push('/onboarding/review' as any);
      return;
    }
    const nextRoute = getNextStepRoute(currentCode, activeSteps);
    router.push(nextRoute as any);
  };

  const goToPrevStep = (currentCode: string, router: any) => {
    const prevRoute = getPrevStepRoute(currentCode, activeSteps);
    if (prevRoute) {
      router.push(prevRoute as any);
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const getMetrics = (currentCode: string) => {
    return getStepMetrics(currentCode, activeSteps);
  };

  const resetData = () => {
    setData({
      mobileNumber: '',
      otp: '',
      fullName: '',
      experience: '1 Year',
      profilePhoto: null,
      hasShop: true,
      shopName: '',
      shopAddress: '',
      workingHours: '10:00 AM To 8:00 PM',
      services: [],
      expertise: [],
      serviceRadius: '10 KM',
      documents: {
        aadhaar: false,
        drivingLicense: false,
        shopPhoto: false,
        profilePhoto: false,
      },
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      },
      sopAccepted: false,
      status: 'pending',
    });
  };

  const prefillDummyData = () => {
    setData(DEFAULT_DATA);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        activeSteps,
        updateData,
        updateBankDetails,
        updateDocuments,
        toggleService,
        toggleExpertise,
        confirmationResult,
        setConfirmationResult,
        resetData,
        prefillDummyData,
        fetchProgress,
        goToNextStep,
        goToPrevStep,
        getMetrics,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

