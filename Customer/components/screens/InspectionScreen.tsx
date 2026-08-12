import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../ui/BackButton';
import Toast, { ToastType } from '../ui/Toast';
import DatePickerField from '../ui/DatePickerField';
import DigitalTimePickerField from '../ui/DigitalTimePickerField';
import { useUserLocation } from '../../hooks/useUserLocation';
import { addressService, UserAddress } from '../../services/addressService';
import {
  vehicleService,
  CustomerVehicle,
  RequestType,
  ServiceSlot,
  CreateServiceRequestPayload,
} from '../../services/vehicleService';
import { ReviewData } from './BookingReviewScreen';

interface InspectionScreenProps {
  onNavigate: (screen: string) => void;
  onRequestSuccess?: (requestNumber: string, requestId?: string) => void;
  onReview?: (data: ReviewData) => void;
  serviceTypeLabel?: string;
  isEmergency?: boolean;
}

export default function InspectionScreen({
  onNavigate,
  onRequestSuccess,
  onReview,
  serviceTypeLabel = 'Inspection',
  isEmergency = false,
}: InspectionScreenProps) {
  // ── State ────────────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [serviceSlots, setServiceSlots] = useState<ServiceSlot[]>([]);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    uri: string;
    fileName?: string;
    mimeType?: string;
  } | null>(null);

  // Dispatch / Schedule state (Emergency is always immediate)
  const [isImmediate, setIsImmediate] = useState<boolean>(true);
  const [preferredServiceDate, setPreferredServiceDate] = useState<string>('');
  const [preferredServiceTime, setPreferredServiceTime] = useState<string>('');

  // Modals & UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [bikeModalVisible, setBikeModalVisible] = useState<boolean>(false);
  const [addressModalVisible, setAddressModalVisible] = useState<boolean>(false);
  const [photoOptionModalVisible, setPhotoOptionModalVisible] = useState<boolean>(false);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>('success');

  // ── Location Hook ────────────────────────────────────────────────────────────
  const {
    loading: locationLoading,
    location,
    errorType,
    refreshLocation,
  } = useUserLocation();

  // ── Set Default Date to Today ────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setPreferredServiceDate(`${y}-${m}-${d}`);
  }, []);

  // Force isImmediate to true when isEmergency is active
  useEffect(() => {
    if (isEmergency) {
      setIsImmediate(true);
    }
  }, [isEmergency]);

  // ── Load Initial Data ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [vehiclesRes, addressesRes, requestTypesRes, slotsRes] = await Promise.all([
          vehicleService.getMyVehicles().catch(() => []),
          addressService.getMyAddresses().catch(() => []),
          vehicleService.getRequestTypes().catch(() => []),
          vehicleService.getServiceSlots().catch(() => []),
        ]);

        setVehicles(vehiclesRes);
        setAddresses(addressesRes);
        setRequestTypes(requestTypesRes);
        setServiceSlots(slotsRes);

        // Auto select default bike if available
        const defaultVehicle = vehiclesRes.find((v) => v.isDefault) || vehiclesRes[0];
        if (defaultVehicle) {
          setSelectedVehicleId(defaultVehicle.id);
        }

        // Auto select default address if available
        const defaultAddr = addressesRes.find((a) => a.defaultAddress) || addressesRes[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.warn('Failed to load inspection screen data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const showToast = (message: string, type: ToastType = 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // ── Derived Selected Vehicle ─────────────────────────────────────────────────
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  // ── Derived Selected Address ─────────────────────────────────────────────────
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  // ── Derived Target Request Type ──────────────────────────────────────────────
  const targetRequestType = useMemo(() => {
    if (isEmergency) {
      return (
        requestTypes.find(
          (rt) =>
            rt.code?.toUpperCase() === 'BREAKDOWN' ||
            rt.code?.toUpperCase() === 'EMERGENCY' ||
            rt.displayName?.toLowerCase().includes('breakdown') ||
            rt.displayName?.toLowerCase().includes('emergency')
        ) || requestTypes[0]
      );
    }
    return (
      requestTypes.find(
        (rt) =>
          rt.code?.toUpperCase() === serviceTypeLabel.toUpperCase() ||
          rt.displayName?.toLowerCase().includes(serviceTypeLabel.toLowerCase())
      ) || requestTypes[0]
    );
  }, [requestTypes, serviceTypeLabel, isEmergency]);

  // ── Photo Upload Handlers ─────────────────────────────────────────────────────
  const handleOpenPhotoOptions = () => {
    setPhotoOptionModalVisible(true);
  };

  const handlePickFromGallery = async () => {
    setPhotoOptionModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Gallery permission is required to select photo.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleTakePhoto = async () => {
    setPhotoOptionModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera permission is required to take photo.', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
  };

  // ── Live Location Action ─────────────────────────────────────────────────────
  const handleFetchLiveLocation = async () => {
    setUseCurrentLocation(true);
    setSelectedAddressId('');
    await refreshLocation();
    showToast('Live location updated successfully!', 'success');
  };

  // ── Submit / Review Action ───────────────────────────────────────────────────
  const handleReviewRequest = () => {
    if (!selectedVehicleId) {
      showToast('Please select a bike from your garage.', 'warning');
      setBikeModalVisible(true);
      return;
    }

    const hasLocation = useCurrentLocation ? !!location : !!selectedAddressId;
    if (!hasLocation) {
      showToast('Please set your current or saved service location.', 'warning');
      return;
    }

    const effectiveIsImmediate = isEmergency ? true : isImmediate;

    if (!effectiveIsImmediate) {
      if (!preferredServiceDate.trim()) {
        showToast('Please select a preferred date for scheduled service.', 'warning');
        return;
      }
      if (!preferredServiceTime) {
        showToast('Please select a preferred time slot for scheduled service.', 'warning');
        return;
      }
    }

    // Build payload
    const payload: CreateServiceRequestPayload = {
      customerVehicleId: selectedVehicleId,
      requestTypeId: targetRequestType ? targetRequestType.id : 1,
      isIssueIdentified: false,
      isImmediate: effectiveIsImmediate,
      preferredServiceDate: !effectiveIsImmediate ? preferredServiceDate.trim() : undefined,
      preferredServiceTime: !effectiveIsImmediate ? preferredServiceTime : undefined,
      description: description.trim() || undefined,
    };

    if (useCurrentLocation && location) {
      payload.currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        note: location.fullAddress || location.shortAddress || undefined,
      };
    } else if (selectedAddress) {
      payload.addressId = selectedAddress.id;
      payload.addressLatitude = selectedAddress.latitude ?? undefined;
      payload.addressLongitude = selectedAddress.longitude ?? undefined;
      const parts = [
        selectedAddress.houseNumber,
        selectedAddress.buildingName,
        selectedAddress.street,
        selectedAddress.landmark,
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.pincode ? `- ${selectedAddress.pincode}` : null,
      ].filter(Boolean);
      payload.addressNote = parts.join(', ');
    }

    const vehicleLabel = selectedVehicle
      ? `${selectedVehicle.brandName} ${selectedVehicle.modelName} (${selectedVehicle.registrationNumber})`
      : 'Selected Bike';

    let locationLabel = 'Location Not Set';
    if (useCurrentLocation && location) {
      locationLabel = `Live Location — ${location.shortAddress || location.fullAddress || 'Current Location'}`;
    } else if (selectedAddress) {
      locationLabel = `${selectedAddress.label} — ${[
        selectedAddress.houseNumber,
        selectedAddress.street,
        selectedAddress.city,
      ]
        .filter(Boolean)
        .join(', ')}`;
    }

    const reviewData: ReviewData = {
      vehicleLabel,
      locationLabel,
      requestTypeLabel: serviceTypeLabel,
      serviceDate: effectiveIsImmediate ? '' : preferredServiceDate,
      serviceTime: effectiveIsImmediate ? '' : preferredServiceTime,
      isImmediate: effectiveIsImmediate,
      categoryLabel: '',
      issueLabels: [],
      description,
      photoUris: selectedPhoto ? [selectedPhoto] : [],
      payload,
      itemId: selectedVehicle?.itemId,
      requestTypeId: targetRequestType?.id,
    };

    if (onReview) {
      onReview(reviewData);
    }
  };

  // ── Render Location Text Helper ──────────────────────────────────────────────
  const renderLocationDisplay = () => {
    if (useCurrentLocation) {
      if (locationLoading) {
        return <Text style={styles.locationSubText}>Detecting live location...</Text>;
      }
      if (location) {
        return (
          <Text style={styles.locationMainText} numberOfLines={2}>
            {location.fullAddress || location.shortAddress || 'Live GPS Location Detected'}
          </Text>
        );
      }
      if (errorType === 'DISABLED') {
        return <Text style={styles.locationSubText}>Location services are disabled on your device</Text>;
      }
      if (errorType === 'DENIED') {
        return <Text style={styles.locationSubText}>Location permission denied. Tap to retry.</Text>;
      }
      return <Text style={styles.locationSubText}>Tap "Use Live Location" to fetch location</Text>;
    }

    if (selectedAddress) {
      return (
        <Text style={styles.locationMainText} numberOfLines={2}>
          {[selectedAddress.houseNumber, selectedAddress.street, selectedAddress.city]
            .filter(Boolean)
            .join(', ')}
        </Text>
      );
    }

    return <Text style={styles.locationSubText}>No address selected. Tap to choose.</Text>;
  };

  return (
    <View style={styles.container}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <BackButton onPress={() => onNavigate('Home')} style={styles.backBtn} />
        <Text style={styles.headerTitle}>
          {isEmergency
            ? `${serviceTypeLabel} - Immediate Request`
            : `${serviceTypeLabel} ${isImmediate ? '- Immediate Request' : '- Scheduled Request'}`}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Service Badge Pill & Title Description ─────────────────────────── */}
        <View style={styles.topInfoSection}>
          <View style={[styles.badgePill, isEmergency && styles.badgePillEmergency]}>
            <Text style={[styles.badgePillText, isEmergency && styles.badgePillTextEmergency]}>
              {serviceTypeLabel}
            </Text>
          </View>
          <Text style={styles.subInstructionText}>
            {isEmergency
              ? 'Emergency assistance will be dispatched immediately to your location.'
              : 'Please provide the details below so our mechanics can arrive prepared.'}
          </Text>
        </View>

        {/* ── 1. ADD VEHICLE PHOTO (OPTIONAL) ─────────────────────────────────── */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTitle}>Add Vehicle Photo</Text>
          
          {selectedPhoto ? (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.photoPreviewImage} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={handleRemovePhoto}
                activeOpacity={0.8}
              >
                <Feather name="x" size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.changePhotoBadge}
                onPress={handleOpenPhotoOptions}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={12} color="#ffffff" />
                <Text style={styles.changePhotoBadgeText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadDashedBox}
              onPress={handleOpenPhotoOptions}
              activeOpacity={0.7}
            >
              <View style={styles.cameraIconCircle}>
                <Feather name="camera" size={26} color="#854d0e" />
              </View>
              <Text style={styles.uploadTitleText}>Tap to upload or take a photo</Text>
              <Text style={styles.uploadSubtitleText}>JPEG or PNG up to 5MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 2. VEHICLE DETAILS (DROPDOWN) ───────────────────────────────────── */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTitle}>Vehicle Details</Text>
          <Text style={styles.fieldLabel}>Select Your Vehicle</Text>

          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setBikeModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownLeft}>
              {selectedVehicle ? (
                <Text style={{ fontSize: 18, marginRight: 10 }}>
                  {selectedVehicle.itemCode === 'CAR' ? '🚗' : selectedVehicle.itemCode === 'SCOOTY' ? '🛵' : '🏍️'}
                </Text>
              ) : (
                <Feather name="disc" size={18} color="#ea580c" style={{ marginRight: 10 }} />
              )}
              <Text
                style={[
                  styles.dropdownText,
                  selectedVehicle && styles.dropdownTextSelected,
                ]}
                numberOfLines={1}
              >
                {selectedVehicle
                  ? `${selectedVehicle.brandName} ${selectedVehicle.modelName} (${selectedVehicle.registrationNumber})`
                  : 'Choose a vehicle'}
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* ── 3. ISSUE DESCRIPTION (OPTIONAL) ──────────────────────────────── */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Issue Description</Text>
            <Text style={styles.optionalTagText}>Optional</Text>
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Briefly describe what needs fixing (e.g., flat rear tire, chain slipping)..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* ── 4. LOCATION (LIVE LOCATION & SAVED ADDRESS) ──────────────────── */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTitle}>Location</Text>

          {/* Graphic Map Box */}
          <View style={styles.mapGraphicBox}>
            <View style={styles.mapGridPattern}>
              <View style={styles.mapRoadHorizontal} />
              <View style={styles.mapRoadVertical} />
              <View style={styles.mapCoastArea} />
            </View>
            <View style={styles.mapPinBadge}>
              <Feather name="map-pin" size={24} color="#ea580c" />
            </View>
          </View>

          {/* Address Info Display */}
          <View style={styles.locationDetailsBox}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.currentLocationHeader}>Current Location</Text>
              {useCurrentLocation ? (
                <View style={styles.locationTagPill}>
                  <Feather name="navigation" size={10} color="#ea580c" />
                  <Text style={styles.locationTagText}>Live Location</Text>
                </View>
              ) : selectedAddress ? (
                <View style={styles.locationTagPill}>
                  <Feather name="bookmark" size={10} color="#ea580c" />
                  <Text style={styles.locationTagText}>Saved as '{selectedAddress.label}'</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.addressDisplayRow}>
              {locationLoading && useCurrentLocation ? (
                <ActivityIndicator size="small" color="#ea580c" style={{ marginRight: 8 }} />
              ) : null}
              {renderLocationDisplay()}
            </View>

            {/* Action Buttons for Location */}
            <View style={styles.locationActionButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.locationActionBtn,
                  useCurrentLocation && styles.locationActionBtnActive,
                ]}
                onPress={handleFetchLiveLocation}
                activeOpacity={0.7}
              >
                <Feather
                  name="crosshair"
                  size={14}
                  color={useCurrentLocation ? '#ea580c' : '#4b5563'}
                />
                <Text
                  style={[
                    styles.locationActionBtnText,
                    useCurrentLocation && styles.locationActionBtnTextActive,
                  ]}
                >
                  Use Live Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationActionBtnSecondary}
                onPress={() => setAddressModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.locationActionBtnSecondaryText}>
                  Change or Select Saved Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 5. WHEN DO YOU NEED SERVICE? (Not shown for Emergency as it's always Immediate) ── */}
        {!isEmergency && (
          <View style={styles.cardContainer}>
            <Text style={styles.cardSectionTitle}>When do you need service?</Text>

            <View style={styles.dispatchModeButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.dispatchModeBtn,
                  isImmediate ? styles.dispatchModeBtnActive : styles.dispatchModeBtnInactive,
                ]}
                onPress={() => setIsImmediate(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dispatchModeBtnText,
                    isImmediate ? styles.dispatchModeBtnTextActive : styles.dispatchModeBtnTextInactive,
                  ]}
                >
                  Immediately
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dispatchModeBtn,
                  !isImmediate ? styles.dispatchModeBtnScheduleActive : styles.dispatchModeBtnInactive,
                ]}
                onPress={() => setIsImmediate(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dispatchModeBtnText,
                    !isImmediate ? styles.dispatchModeBtnScheduleTextActive : styles.dispatchModeBtnTextInactive,
                  ]}
                >
                  Schedule a Time
                </Text>
              </TouchableOpacity>
            </View>

            {/* Render Preferred Date & Preferred Time fields ONLY when Schedule a Time is selected */}
            {!isImmediate && (
              <View style={styles.dateTimeFieldsRow}>
                <View style={styles.dateTimeFieldCol}>
                  <Text style={styles.fieldLabel}>Preferred Date</Text>
                  <DatePickerField
                    value={preferredServiceDate}
                    onChange={setPreferredServiceDate}
                    placeholder="dd/mm/yyyy"
                  />
                </View>

                <View style={styles.dateTimeFieldCol}>
                  <Text style={styles.fieldLabel}>Preferred Time</Text>
                  <DigitalTimePickerField
                    value={preferredServiceTime}
                    onChange={setPreferredServiceTime}
                    date={preferredServiceDate}
                    slots={serviceSlots}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Sticky/Bottom Review Button ──────────────────────────────────── */}
        <View style={styles.reviewButtonWrapper}>
          <TouchableOpacity
            style={[styles.reviewRequestBtn, isEmergency && styles.reviewRequestBtnEmergency]}
            onPress={handleReviewRequest}
            activeOpacity={0.85}
          >
            <Text style={styles.reviewRequestBtnText}>
              {isEmergency ? 'Review & Submit Emergency SOS' : 'Review & Submit Request'}
            </Text>
            <Feather name="arrow-right" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── MODAL 1: SELECT VEHICLE DROPDOWN ────────────────────────────────────── */}
      <Modal
        visible={bikeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBikeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Vehicle</Text>
              <TouchableOpacity onPress={() => setBikeModalVisible(false)}>
                <Feather name="x" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {vehicles.length === 0 ? (
              <View style={styles.modalEmptyState}>
                <Feather name="disc" size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
                <Text style={styles.modalEmptyText}>No vehicles found in your garage.</Text>
                <TouchableOpacity
                  style={styles.addBikeModalBtn}
                  onPress={() => {
                    setBikeModalVisible(false);
                    onNavigate('AddBike');
                  }}
                >
                  <Feather name="plus" size={16} color="#ffffff" />
                  <Text style={styles.addBikeModalBtnText}>Add Vehicle to My Garage</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedVehicleId;
                  const emoji = item.itemCode === 'CAR' ? '🚗' : item.itemCode === 'SCOOTY' ? '🛵' : '🏍️';
                  const tagLabel = item.itemCode === 'CAR' ? 'Car' : item.itemCode === 'SCOOTY' ? 'Scooty' : 'Bike';
                  const tagBg = item.itemCode === 'CAR' ? '#eff6ff' : item.itemCode === 'SCOOTY' ? '#fdf4ff' : '#fff7ed';
                  const tagColor = item.itemCode === 'CAR' ? '#1d4ed8' : item.itemCode === 'SCOOTY' ? '#a21caf' : '#c2410c';

                  return (
                    <TouchableOpacity
                      style={[
                        styles.bikeSelectItem,
                        isSelected && styles.bikeSelectItemActive,
                      ]}
                      onPress={() => {
                        setSelectedVehicleId(item.id);
                        setBikeModalVisible(false);
                      }}
                    >
                      <View style={styles.bikeSelectItemLeft}>
                        <View style={styles.bikeIconContainer}>
                          <Text style={{ fontSize: 18 }}>{emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.bikeSelectTitle}>
                              {item.brandName} {item.modelName}
                            </Text>
                            <View style={{
                              backgroundColor: tagBg,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6,
                            }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: tagColor }}>
                                {tagLabel}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.bikeSelectSub}>
                            Reg: {item.registrationNumber} {item.color ? `· ${item.color}` : ''}
                          </Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkCircle}>
                          <Feather name="check" size={14} color="#ffffff" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ListFooterComponent={
                  <TouchableOpacity
                    style={styles.addBikeFooterLink}
                    onPress={() => {
                      setBikeModalVisible(false);
                      onNavigate('AddBike');
                    }}
                  >
                    <Feather name="plus-circle" size={16} color="#ea580c" />
                    <Text style={styles.addBikeFooterLinkText}>Add New Vehicle (Bike, Scooty, Car)</Text>
                  </TouchableOpacity>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: ADDRESS SELECTION ────────────────────────────────────────── */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Feather name="x" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.bikeSelectItem,
                useCurrentLocation && styles.bikeSelectItemActive,
              ]}
              onPress={() => {
                handleFetchLiveLocation();
                setAddressModalVisible(false);
              }}
            >
              <View style={styles.bikeSelectItemLeft}>
                <View style={[styles.bikeIconContainer, { backgroundColor: '#fff3eb' }]}>
                  <Feather name="crosshair" size={18} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bikeSelectTitle}>Use Current Live Location</Text>
                  <Text style={styles.bikeSelectSub} numberOfLines={1}>
                    {location
                      ? location.shortAddress || location.fullAddress
                      : 'Fetch live location via GPS'}
                  </Text>
                </View>
              </View>
              {useCurrentLocation && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.modalSubHeader}>Saved Addresses</Text>

            {addresses.length === 0 ? (
              <Text style={styles.noAddressText}>No saved addresses found.</Text>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = !useCurrentLocation && item.id === selectedAddressId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.bikeSelectItem,
                        isSelected && styles.bikeSelectItemActive,
                      ]}
                      onPress={() => {
                        setSelectedAddressId(item.id);
                        setUseCurrentLocation(false);
                        setAddressModalVisible(false);
                      }}
                    >
                      <View style={styles.bikeSelectItemLeft}>
                        <View style={styles.bikeIconContainer}>
                          <Feather
                            name={
                              item.label?.toLowerCase() === 'home'
                                ? 'home'
                                : item.label?.toLowerCase() === 'work'
                                ? 'briefcase'
                                : 'map-pin'
                            }
                            size={18}
                            color="#ea580c"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bikeSelectTitle}>{item.label}</Text>
                          <Text style={styles.bikeSelectSub} numberOfLines={2}>
                            {[item.houseNumber, item.street, item.city]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Feather name="check" size={14} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: PHOTO SOURCE SELECTOR (CAMERA vs GALLERY) ────────────────── */}
      <Modal
        visible={photoOptionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPhotoOptionModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPhotoOptionModalVisible(false)}
        >
          <View style={styles.photoChoiceModalContent}>
            <Text style={styles.photoChoiceTitle}>Add Bike Photo</Text>

            <TouchableOpacity
              style={styles.photoChoiceOption}
              onPress={handleTakePhoto}
            >
              <Feather name="camera" size={20} color="#ea580c" style={{ marginRight: 14 }} />
              <Text style={styles.photoChoiceOptionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoChoiceOption}
              onPress={handlePickFromGallery}
            >
              <Feather name="image" size={20} color="#ea580c" style={{ marginRight: 14 }} />
              <Text style={styles.photoChoiceOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoChoiceCancelBtn}
              onPress={() => setPhotoOptionModalVisible(false)}
            >
              <Text style={styles.photoChoiceCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  backBtn: {
    marginTop: 0,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Top Info Badge Section
  topInfoSection: {
    marginBottom: 20,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgePillEmergency: {
    backgroundColor: '#fee2e2',
  },
  badgePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  badgePillTextEmergency: {
    color: '#dc2626',
  },
  subInstructionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // General Card Container
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionalTagText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Photo Upload Dashed Box
  uploadDashedBox: {
    borderWidth: 1.5,
    borderColor: '#fdba74',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#fffcf9',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  uploadSubtitleText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  photoPreviewWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePhotoBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Dropdown Selector
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#94a3b8',
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#0f172a',
    fontWeight: '600',
  },

  // Description Input
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    color: '#0f172a',
  },

  // Location Component
  mapGraphicBox: {
    height: 110,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f9ff',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#ffffff',
  },
  mapRoadVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#ffffff',
  },
  mapCoastArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#bae6fd',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  mapPinBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  locationDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentLocationHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  locationTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  addressDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationMainText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  locationSubText: {
    fontSize: 12,
    color: '#64748b',
  },
  locationActionButtonsRow: {
    gap: 8,
  },
  locationActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
  },
  locationActionBtnActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff3eb',
  },
  locationActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  locationActionBtnTextActive: {
    color: '#ea580c',
  },
  locationActionBtnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  locationActionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  // When do you need service Buttons
  dispatchModeButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dispatchModeBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchModeBtnActive: {
    backgroundColor: '#ea580c',
    borderWidth: 1.5,
    borderColor: '#ea580c',
  },
  dispatchModeBtnScheduleActive: {
    backgroundColor: '#fff3eb',
    borderWidth: 1.5,
    borderColor: '#fdba74',
  },
  dispatchModeBtnInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  dispatchModeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dispatchModeBtnTextActive: {
    color: '#ffffff',
  },
  dispatchModeBtnScheduleTextActive: {
    color: '#ea580c',
  },
  dispatchModeBtnTextInactive: {
    color: '#475569',
  },
  dateTimeFieldsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dateTimeFieldCol: {
    flex: 1,
  },

  // Review Request Button
  reviewButtonWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  reviewRequestBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewRequestBtnEmergency: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  reviewRequestBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 10,
  },
  bikeSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    marginBottom: 10,
  },
  bikeSelectItemActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff3eb',
  },
  bikeSelectItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bikeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bikeSelectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  bikeSelectSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addBikeFooterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  addBikeFooterLinkText: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '700',
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalEmptyText: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 16,
  },
  addBikeModalBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBikeModalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  noAddressText: {
    color: '#94a3b8',
    fontSize: 13,
    marginVertical: 10,
  },

  // Photo Choice Modal
  photoChoiceModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    padding: 20,
    alignSelf: 'stretch',
  },
  photoChoiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  photoChoiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  photoChoiceOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  photoChoiceCancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  photoChoiceCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
});
