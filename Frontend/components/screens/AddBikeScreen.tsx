import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { vehicleService, VehicleBrand, VehicleModel } from '../../services/vehicleService';
import InputField from '../ui/InputField';
import PrimaryButton from '../ui/PrimaryButton';
import BackButton from '../ui/BackButton';
import Toast, { ToastType } from '../ui/Toast';

interface AddBikeScreenProps {
  onNavigate: (screen: string) => void;
}

// ─── Step indicator constants ────────────────────────────────────────────────
const STEPS = ['Brand', 'Model', 'Details'];

export default function AddBikeScreen({ onNavigate }: AddBikeScreenProps) {
  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0); // 0=Brand, 1=Model, 2=Details

  // ── Data state ──────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState('');
  const [color, setColor] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // ── Loading / error state ───────────────────────────────────────────────────
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [brandsError, setBrandsError] = useState('');
  const [modelsError, setModelsError] = useState('');

  // ── Validation errors ───────────────────────────────────────────────────────
  const [regError, setRegError] = useState('');
  const [odometerError, setOdometerError] = useState('');
  const [yearError, setYearError] = useState('');

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('error');

  const showToast = (message: string, type: ToastType = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // ── Fetch brands on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      setBrandsError('');
      try {
        const data = await vehicleService.getAllBrands();
        setBrands(data);
      } catch {
        setBrandsError('Could not load brands. Tap to retry.');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // ── Fetch models when brand changes ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedBrand) return;
    const fetchModels = async () => {
      setLoadingModels(true);
      setModelsError('');
      setModels([]);
      setSelectedModel(null);
      try {
        const data = await vehicleService.getModelsByBrand(selectedBrand.id);
        setModels(data);
      } catch {
        setModelsError('Could not load models. Tap to retry.');
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [selectedBrand]);

  // ── Brand select ────────────────────────────────────────────────────────────
  const handleBrandSelect = useCallback((brand: VehicleBrand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setCurrentStep(1);
  }, []);

  // ── Model select ────────────────────────────────────────────────────────────
  const handleModelSelect = useCallback((model: VehicleModel) => {
    setSelectedModel(model);
    setCurrentStep(2);
  }, []);

  // ── Back between steps ──────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 0) {
      onNavigate('Home');
    } else if (currentStep === 1) {
      setSelectedBrand(null);
      setModels([]);
      setCurrentStep(0);
    } else {
      setCurrentStep(1);
    }
  };

  // ── Inline validation ───────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    let valid = true;

    const regTrimmed = registrationNumber.trim().toUpperCase();
    if (!regTrimmed) {
      setRegError('Registration number is required.');
      valid = false;
    } else if (!/^[A-Z0-9\s-]{4,20}$/.test(regTrimmed)) {
      setRegError('Enter a valid registration number (e.g. UP32AB1234).');
      valid = false;
    } else {
      setRegError('');
    }

    const odoNum = parseInt(odometerKm, 10);
    if (!odometerKm.trim()) {
      setOdometerError('Odometer reading is required.');
      valid = false;
    } else if (isNaN(odoNum) || odoNum < 0) {
      setOdometerError('Enter a valid odometer value (0 or more).');
      valid = false;
    } else {
      setOdometerError('');
    }

    if (manufacturingYear.trim()) {
      const yr = parseInt(manufacturingYear, 10);
      if (isNaN(yr) || yr < 1950 || yr > new Date().getFullYear()) {
        setYearError(`Enter a valid year between 1950 and ${new Date().getFullYear()}.`);
        valid = false;
      } else {
        setYearError('');
      }
    } else {
      setYearError('');
    }

    return valid;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!selectedBrand || !selectedModel) return;

    setSubmitting(true);
    try {
      await vehicleService.addBike({
        brandId: selectedBrand.id,
        modelId: selectedModel.id,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        manufacturingYear: manufacturingYear.trim()
          ? parseInt(manufacturingYear, 10)
          : null,
        color: color.trim(),
        engineNumber: engineNumber.trim(),
        chassisNumber: chassisNumber.trim(),
        odometerKm: parseInt(odometerKm, 10),
        isDefault,
      });
      showToast(
        `🏍️ ${selectedBrand.brandName} ${selectedModel.modelName} registered successfully!`,
        'success'
      );
      // Navigate after toast is visible briefly
      setTimeout(() => onNavigate('Home'), 1800);
    } catch (err: any) {
      showToast(
        err?.message || 'Something went wrong. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  //  RENDER HELPERS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Step Indicator ──────────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {STEPS.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isActive && styles.stepCircleActive,
                ]}
              >
                {isCompleted ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                ]}
              >
                {label}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  index < currentStep && styles.stepConnectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ── Step 0: Brand Selection ─────────────────────────────────────────────────
  const renderBrandStep = () => (
    <View>
      <Text style={styles.stepTitle}>Select Brand</Text>
      <Text style={styles.stepSubtitle}>Choose your bike manufacturer</Text>

      {loadingBrands ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loaderText}>Loading brands...</Text>
        </View>
      ) : brandsError ? (
        <TouchableOpacity
          style={styles.errorRetryBox}
          onPress={() => {
            setBrandsError('');
            setLoadingBrands(true);
            vehicleService
              .getAllBrands()
              .then(setBrands)
              .catch(() => setBrandsError('Could not load brands. Tap to retry.'))
              .finally(() => setLoadingBrands(false));
          }}
        >
          <Feather name="refresh-cw" size={20} color="#ef4444" />
          <Text style={styles.errorRetryText}>{brandsError}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.brandGrid}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={styles.brandCard}
              onPress={() => handleBrandSelect(brand)}
              activeOpacity={0.75}
            >
              <View style={styles.brandIconCircle}>
                <Feather name="zap" size={22} color="#f97316" />
              </View>
              <Text style={styles.brandName}>{brand.brandName}</Text>
              <Text style={styles.brandCode}>{brand.brandCode}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // ── Step 1: Model Selection ─────────────────────────────────────────────────
  const renderModelStep = () => (
    <View>
      {/* Selected brand pill */}
      <View style={styles.selectedPill}>
        <Feather name="check-circle" size={14} color="#f97316" />
        <Text style={styles.selectedPillText}>{selectedBrand?.brandName}</Text>
        <TouchableOpacity onPress={() => { setCurrentStep(0); setSelectedBrand(null); }}>
          <Feather name="x" size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <Text style={styles.stepTitle}>Select Model</Text>
      <Text style={styles.stepSubtitle}>Pick the model of your bike</Text>

      {loadingModels ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loaderText}>Loading models...</Text>
        </View>
      ) : modelsError ? (
        <TouchableOpacity
          style={styles.errorRetryBox}
          onPress={() => {
            if (!selectedBrand) return;
            setModelsError('');
            setLoadingModels(true);
            vehicleService
              .getModelsByBrand(selectedBrand.id)
              .then(setModels)
              .catch(() => setModelsError('Could not load models. Tap to retry.'))
              .finally(() => setLoadingModels(false));
          }}
        >
          <Feather name="refresh-cw" size={20} color="#ef4444" />
          <Text style={styles.errorRetryText}>{modelsError}</Text>
        </TouchableOpacity>
      ) : models.length === 0 ? (
        <View style={styles.emptyBox}>
          <Feather name="inbox" size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>No models found for this brand.</Text>
        </View>
      ) : (
        <View style={styles.modelList}>
          {models.map((model) => (
            <TouchableOpacity
              key={model.id}
              style={styles.modelCard}
              onPress={() => handleModelSelect(model)}
              activeOpacity={0.75}
            >
              <View style={styles.modelCardLeft}>
                <View style={styles.modelIconCircle}>
                  <Feather name="cpu" size={18} color="#f97316" />
                </View>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelName}>{model.modelName}</Text>
                  <View style={styles.modelBadgeRow}>
                    {model.fuelType ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{model.fuelType}</Text>
                      </View>
                    ) : null}
                    {model.transmissionType ? (
                      <View style={[styles.badge, styles.badgeBlue]}>
                        <Text style={[styles.badgeText, styles.badgeTextBlue]}>
                          {model.transmissionType}
                        </Text>
                      </View>
                    ) : null}
                    {model.engineCapacityCc ? (
                      <View style={[styles.badge, styles.badgeGray]}>
                        <Text style={[styles.badgeText, styles.badgeTextGray]}>
                          {model.engineCapacityCc}cc
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // ── Step 2: Bike Details ────────────────────────────────────────────────────
  const renderDetailsStep = () => (
    <View>
      {/* Selected summary pill row */}
      <View style={styles.summaryRow}>
        <View style={styles.selectedPill}>
          <Feather name="check-circle" size={14} color="#f97316" />
          <Text style={styles.selectedPillText}>{selectedBrand?.brandName}</Text>
        </View>
        <View style={styles.selectedPill}>
          <Feather name="check-circle" size={14} color="#f97316" />
          <Text style={styles.selectedPillText}>{selectedModel?.modelName}</Text>
        </View>
      </View>

      <Text style={styles.stepTitle}>Bike Details</Text>
      <Text style={styles.stepSubtitle}>Fill in your vehicle information</Text>

      {/* Registration Number */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Registration Number</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <InputField
          iconName="hash"
          placeholder="e.g. UP32AB1234"
          value={registrationNumber}
          onChangeText={(t) => { setRegistrationNumber(t); setRegError(''); }}
          autoCapitalize="characters"
        />
        {regError ? (
          <View style={styles.inlineError}>
            <Feather name="alert-circle" size={12} color="#ef4444" />
            <Text style={styles.inlineErrorText}>{regError}</Text>
          </View>
        ) : null}
      </View>

      {/* Odometer */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Odometer Reading (km)</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <InputField
          iconName="activity"
          placeholder="e.g. 12000"
          value={odometerKm}
          onChangeText={(t) => { setOdometerKm(t); setOdometerError(''); }}
          keyboardType="numeric"
        />
        {odometerError ? (
          <View style={styles.inlineError}>
            <Feather name="alert-circle" size={12} color="#ef4444" />
            <Text style={styles.inlineErrorText}>{odometerError}</Text>
          </View>
        ) : null}
      </View>

      {/* Manufacturing Year */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Manufacturing Year</Text>
        <InputField
          iconName="calendar"
          placeholder="e.g. 2022"
          value={manufacturingYear}
          onChangeText={(t) => { setManufacturingYear(t); setYearError(''); }}
          keyboardType="numeric"
          maxLength={4}
        />
        {yearError ? (
          <View style={styles.inlineError}>
            <Feather name="alert-circle" size={12} color="#ef4444" />
            <Text style={styles.inlineErrorText}>{yearError}</Text>
          </View>
        ) : null}
      </View>

      {/* Color */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Color <Text style={styles.optionalLabel}>(Optional)</Text></Text>
        <InputField
          iconName="droplet"
          placeholder="e.g. Matte Black"
          value={color}
          onChangeText={setColor}
        />
      </View>

      {/* Engine Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Engine Number <Text style={styles.optionalLabel}>(Optional)</Text></Text>
        <InputField
          iconName="settings"
          placeholder="As on RC book"
          value={engineNumber}
          onChangeText={setEngineNumber}
          autoCapitalize="characters"
        />
      </View>

      {/* Chassis Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Chassis Number <Text style={styles.optionalLabel}>(Optional)</Text></Text>
        <InputField
          iconName="layers"
          placeholder="17-character VIN / Chassis"
          value={chassisNumber}
          onChangeText={setChassisNumber}
          autoCapitalize="characters"
        />
      </View>

      {/* Set as Default toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleLeft}>
          <Feather name="star" size={18} color="#f97316" />
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleTitle}>Set as Default Bike</Text>
            <Text style={styles.toggleSubtitle}>Used for quick bookings and service requests</Text>
          </View>
        </View>
        <Switch
          value={isDefault}
          onValueChange={setIsDefault}
          trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
          thumbColor={isDefault ? '#f97316' : '#9ca3af'}
        />
      </View>

      {/* Submit Button */}
      <PrimaryButton
        title="Add Bike"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitButton}
      />

      <Text style={styles.footerNote}>
        Fields marked <Text style={{ color: '#ef4444' }}>*</Text> are required
      </Text>
    </View>
  );

  // ════════════════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      {/* ── Orange Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={handleBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Add Your Bike</Text>
          <Text style={styles.headerSub}>
            Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]}
          </Text>
        </View>
        <View style={styles.headerBikeIcon}>
          <Feather name="zap" size={22} color="#ffffff" />
        </View>
      </View>

      {/* ── Step Progress Bar ──────────────────────────────────────────────── */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Step Indicator Dots ──────────────────────────────────────────── */}
        {renderStepIndicator()}

        {/* ── Step Content ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          {currentStep === 0 && renderBrandStep()}
          {currentStep === 1 && renderModelStep()}
          {currentStep === 2 && renderDetailsStep()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: 48,
    backgroundColor: '#f9fafb',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#f97316',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBack: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSub: {
    color: '#fff7ed',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  headerBikeIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Progress bar ─────────────────────────────────────────────────────────
  progressBarTrack: {
    height: 4,
    backgroundColor: '#ffedd5',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#f97316',
  },

  // ── Step indicator ────────────────────────────────────────────────────────
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  stepCircleCompleted: {
    backgroundColor: '#16a34a',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#f97316',
  },
  stepLabelCompleted: {
    color: '#16a34a',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  stepConnectorCompleted: {
    backgroundColor: '#16a34a',
  },

  // ── Step titles ───────────────────────────────────────────────────────────
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },

  // ── Loader / Error / Empty ────────────────────────────────────────────────
  loaderBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorRetryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  errorRetryText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },

  // ── Brand Grid ────────────────────────────────────────────────────────────
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandCard: {
    width: '47%',
    backgroundColor: '#fff9f5',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  brandIconCircle: {
    width: 48,
    height: 48,
    backgroundColor: '#fff3eb',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  brandCode: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
  },

  // ── Model List ────────────────────────────────────────────────────────────
  modelList: {
    gap: 10,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f5',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 14,
    padding: 14,
  },
  modelCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelIconCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#fff3eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  modelBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#fff3eb',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  badgeBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ea580c',
  },
  badgeTextBlue: {
    color: '#2563eb',
  },
  badgeTextGray: {
    color: '#6b7280',
  },

  // ── Selected pills ────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff3eb',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  selectedPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea580c',
  },

  // ── Details form ──────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
  },
  required: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#ef4444',
  },

  // ── Default toggle ────────────────────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f5',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitButton: {
    marginBottom: 12,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
});
