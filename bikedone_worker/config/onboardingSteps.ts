/**
 * Configurable Onboarding Steps Registry & Orchestrator
 * 
 * This registry acts as the single source of truth for all Mechanic onboarding steps.
 * It is fully configurable: adding a new step or changing step order in the backend
 * automatically synchronizes across the entire frontend app!
 */

export interface ServerStepDetail {
  stepCode: string;
  displayName: string;
  stepOrder: number;
  isMandatory: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | string;
  remarks?: string | null;
}

export interface StepDefinition {
  code: string;
  route: string;
  title: string;
  subtitle: string;
  icon: string;
  isMandatory: boolean;
  stepOrder: number;
}

export const MASTER_STEPS_REGISTRY: Record<string, StepDefinition> = {
  BASIC_DETAILS: {
    code: 'BASIC_DETAILS',
    route: '/onboarding/basic-details',
    title: 'Basic Details',
    subtitle: 'Provide your name, experience & profile photo',
    icon: 'person-outline',
    isMandatory: true,
    stepOrder: 1,
  },
  SHOP_DETAILS: {
    code: 'SHOP_DETAILS',
    route: '/onboarding/shop-info',
    title: 'Shop / Garage Details',
    subtitle: 'Provide workshop details for Bike, Scooty & Car servicing (Compulsory)',
    icon: 'storefront-outline',
    isMandatory: true,
    stepOrder: 2,
  },
  SERVICE_CATEGORIES: {
    code: 'SERVICE_CATEGORIES',
    route: '/onboarding/services',
    title: 'Services Offered',
    subtitle: 'Choose bike repair & servicing services you provide',
    icon: 'construct-outline',
    isMandatory: true,
    stepOrder: 3,
  },
  SERVICE_RADIUS: {
    code: 'SERVICE_RADIUS',
    route: '/onboarding/radius',
    title: 'Service Radius',
    subtitle: 'Set maximum travel distance for doorstep requests',
    icon: 'navigate-outline',
    isMandatory: true,
    stepOrder: 4,
  },
  DOCUMENTS: {
    code: 'DOCUMENTS',
    route: '/onboarding/documents',
    title: 'Documents & KYC',
    subtitle: 'Upload Aadhaar, PAN, and Driving License',
    icon: 'document-text-outline',
    isMandatory: true,
    stepOrder: 5,
  },
  BANK_DETAILS: {
    code: 'BANK_DETAILS',
    route: '/onboarding/bank-details',
    title: 'Bank & Payouts',
    subtitle: 'Add bank account details for direct payout settlements',
    icon: 'card-outline',
    isMandatory: true,
    stepOrder: 6,
  },
  TRAINING_SOP: {
    code: 'TRAINING_SOP',
    route: '/onboarding/training-sop',
    title: 'Quality & SOP Training',
    subtitle: 'MyKaarigar Partner standard & safety quality pledge',
    icon: 'ribbon-outline',
    isMandatory: true,
    stepOrder: 7,
  },
  MANUAL_VERIFICATION: {
    code: 'MANUAL_VERIFICATION',
    route: '/onboarding/review',
    title: 'Review & Submit',
    subtitle: 'Review application and submit for verification',
    icon: 'checkmark-done-circle-outline',
    isMandatory: false,
    stepOrder: 8,
  },
};

/**
 * Fallback default ordered steps list
 */
export const DEFAULT_ORDERED_STEPS: StepDefinition[] = Object.values(MASTER_STEPS_REGISTRY).sort(
  (a, b) => a.stepOrder - b.stepOrder
);

/**
 * Resolves active steps dynamically by merging server response with client registry.
 * If new steps are added in backend, they are automatically ordered and handled.
 */
export const resolveActiveSteps = (serverSteps?: ServerStepDetail[]): StepDefinition[] => {
  if (!serverSteps || serverSteps.length === 0) {
    return DEFAULT_ORDERED_STEPS;
  }

  const result: StepDefinition[] = [];

  for (const sStep of serverSteps) {
    const localDef = MASTER_STEPS_REGISTRY[sStep.stepCode];
    if (localDef) {
      result.push({
        ...localDef,
        title: sStep.displayName || localDef.title,
        stepOrder: sStep.stepOrder,
        isMandatory: sStep.isMandatory,
      });
    } else {
      // In case a completely new custom step is introduced by admin
      result.push({
        code: sStep.stepCode,
        route: `/onboarding/${sStep.stepCode.toLowerCase().replace(/_/g, '-')}`,
        title: sStep.displayName,
        subtitle: `Complete ${sStep.displayName}`,
        icon: 'ellipse-outline',
        isMandatory: sStep.isMandatory,
        stepOrder: sStep.stepOrder,
      });
    }
  }

  return result.sort((a, b) => a.stepOrder - b.stepOrder);
};

/**
 * Gets step definition by code
 */
export const getStepByCode = (stepCode: string): StepDefinition | undefined => {
  return MASTER_STEPS_REGISTRY[stepCode];
};

/**
 * Calculates dynamic metrics (current step index, total steps, progress percentage)
 */
export const getStepMetrics = (currentStepCode: string, serverSteps?: ServerStepDetail[]) => {
  const activeSteps = resolveActiveSteps(serverSteps);
  const index = activeSteps.findIndex((s) => s.code === currentStepCode);
  const stepIndex = index >= 0 ? index + 1 : 1;
  const totalSteps = activeSteps.length;
  const progressPercent = Math.min(100, Math.round((stepIndex / totalSteps) * 100));

  return {
    stepIndex,
    totalSteps,
    progressPercent,
    isFirst: index === 0,
    isLast: index === activeSteps.length - 1,
    currentStep: activeSteps[index] || activeSteps[0],
  };
};

/**
 * Returns the next step route dynamically
 */
export const getNextStepRoute = (currentStepCode: string, serverSteps?: ServerStepDetail[]): string => {
  const activeSteps = resolveActiveSteps(serverSteps);
  const currentIndex = activeSteps.findIndex((s) => s.code === currentStepCode);

  if (currentIndex >= 0 && currentIndex < activeSteps.length - 1) {
    return activeSteps[currentIndex + 1].route;
  }

  return '/onboarding/approval';
};

/**
 * Returns the previous step route dynamically
 */
export const getPrevStepRoute = (currentStepCode: string, serverSteps?: ServerStepDetail[]): string | null => {
  const activeSteps = resolveActiveSteps(serverSteps);
  const currentIndex = activeSteps.findIndex((s) => s.code === currentStepCode);

  if (currentIndex > 0) {
    return activeSteps[currentIndex - 1].route;
  }

  return null;
};
