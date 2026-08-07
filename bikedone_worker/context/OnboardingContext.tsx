import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  status: 'pending' | 'under_review' | 'approved';
}

const DEFAULT_DATA: OnboardingData = {
  mobileNumber: '9876543210',
  otp: '123456',
  fullName: 'Rahul Kumar',
  experience: '5 Years',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
  hasShop: true,
  shopName: 'Rahul Bike Garage',
  shopAddress: '123, Sharma Market, Laxmi Nagar, Delhi - 110092',
  workingHours: '10:00 AM To 8:00 PM',
  services: ['Routine Service', 'Repair', 'Inspection', 'Breakdown Assistance'],
  expertise: ['Engine', 'Brakes', 'Battery', 'Electrical'],
  serviceRadius: '5 KM',
  documents: {
    aadhaar: true,
    drivingLicense: true,
    shopPhoto: true,
    profilePhoto: true,
  },
  bankDetails: {
    accountHolderName: 'Rahul Kumar',
    accountNumber: '123456789012',
    ifscCode: 'PUNB0123456',
    bankName: 'Punjab National Bank',
  },
  status: 'pending',
};

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  updateBankDetails: (partialBank: Partial<OnboardingData['bankDetails']>) => void;
  updateDocuments: (docKey: keyof OnboardingData['documents'], status: boolean) => void;
  toggleService: (service: string) => void;
  toggleExpertise: (item: string) => void;
  resetData: () => void;
  prefillDummyData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

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
      serviceRadius: '5 KM',
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
        updateData,
        updateBankDetails,
        updateDocuments,
        toggleService,
        toggleExpertise,
        resetData,
        prefillDummyData,
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
