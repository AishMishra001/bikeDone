import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useUserLocation } from "../../hooks/useUserLocation";
import { addressService, UserAddress } from "../../services/addressService";
import {
    CreateServiceRequestPayload,
    CustomerVehicle,
    RequestType,
    ServiceCategory,
    ServiceIssue,
    ServiceSlot,
    vehicleService,
} from "../../services/vehicleService";
import BackButton from "../ui/BackButton";
import DatePickerField from "../ui/DatePickerField";
import DigitalTimePickerField from "../ui/DigitalTimePickerField";
import PrimaryButton from "../ui/PrimaryButton";
import Toast, { ToastType } from "../ui/Toast";
import { ReviewData } from "./BookingReviewScreen";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingScreenProps {
  onNavigate: (screen: string) => void;
  onRequestSuccess?: (requestNumber: string) => void;
  onReview?: (data: ReviewData) => void;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonLine({
  width = "100%",
  height = 14,
}: {
  width?: string | number;
  height?: number;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius: 8,
        backgroundColor: "#e5e7eb",
        opacity,
        marginBottom: 10,
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonLine width="60%" height={16} />
      <SkeletonLine width="40%" height={12} />
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ padding: 24 }}>
      <SkeletonLine width="40%" height={12} />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonLine width="40%" height={12} />
      <SkeletonCard />
      <SkeletonLine width="50%" height={12} />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <SkeletonLine width={100} height={36} />
        <SkeletonLine width={100} height={36} />
        <SkeletonLine width={80} height={36} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  step,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  step: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionStepBadge}>
        <Text style={styles.sectionStepText}>{step}</Text>
      </View>
      <Feather
        name={icon}
        size={15}
        color="#f97316"
        style={{ marginRight: 6 }}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingScreen({
  onNavigate,
  onRequestSuccess,
  onReview,
}: BookingScreenProps) {
  // ── API Data ────────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [serviceSlots, setServiceSlots] = useState<ServiceSlot[]>([]);
  const [serviceIssues, setServiceIssues] = useState<ServiceIssue[]>([]);

  // ── Selections ──────────────────────────────────────────────────────────────
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [selectedRequestTypeId, setSelectedRequestTypeId] = useState<
    number | null
  >(null);
  const [preferredServiceTime, setPreferredServiceTime] = useState("");
  const [isImmediate, setIsImmediate] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedIssueIds, setSelectedIssueIds] = useState<number[]>([]);
  const [preferredServiceDate, setPreferredServiceDate] = useState("");
  const [description, setDescription] = useState("");
  const [issueIdentified, setIssueIdentified] = useState(false);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  // ── Photos ──────────────────────────────────────────────────────────────────
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ uri: string; fileName?: string; mimeType?: string }>
  >([]);

  // ── Location ────────────────────────────────────────────────────────────────
  const {
    loading: locationLoading,
    location,
    errorType,
    refreshLocation,
  } = useUserLocation();

  // ── Derived ─────────────────────────────────────────────────────────────────
  const selectedRequestType = useMemo(
    () => requestTypes.find((rt) => rt.id === selectedRequestTypeId),
    [requestTypes, selectedRequestTypeId],
  );

  const isRoutine = selectedRequestType?.code === "ROUTINE_SERVICE";
  const isBreakdown = selectedRequestType?.code === "BREAKDOWN";
  const showIssueToggle = !!selectedRequestTypeId && !isRoutine; // Routine does not show the issue toggle
  const showCategorySection = issueIdentified && !isRoutine; // Routine never shows categories/issues
  const showDateAndTime = !isImmediate;

  // ── Set default date to today ───────────────────────────────────────────────
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setPreferredServiceDate(`${y}-${m}-${d}`);
  }, []);

  // ── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          vehiclesRes,
          addressesRes,
          requestTypesRes,
          categoriesRes,
          slotsRes,
        ] = await Promise.all([
          vehicleService.getMyVehicles(),
          addressService.getMyAddresses(),
          vehicleService.getRequestTypes(),
          vehicleService.getServiceCategories(),
          vehicleService.getServiceSlots(),
        ]);

        setVehicles(vehiclesRes);
        setAddresses(addressesRes);
        setRequestTypes(requestTypesRes);
        setServiceCategories(categoriesRes);
        setServiceSlots(slotsRes);

        // Auto-select defaults
        const defaultVehicle =
          vehiclesRes.find((v) => v.isDefault) || vehiclesRes[0];
        if (defaultVehicle) setSelectedVehicleId(defaultVehicle.id);

        const defaultAddress =
          addressesRes.find((a) => a.defaultAddress) || addressesRes[0];
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);

        // Service ranges are used to populate the exact-time picker.
      } catch (err) {
        console.warn("Booking data load failed", err);
        setError("Unable to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ── Load issues when category changes ──────────────────────────────────────
  useEffect(() => {
    const loadIssues = async () => {
      if (!issueIdentified || selectedCategoryId == null) {
        setServiceIssues([]);
        setSelectedIssueIds([]);
        return;
      }

      setIssuesLoading(true);
      try {
        const issues =
          await vehicleService.getServiceIssues(selectedCategoryId);
        setServiceIssues(issues);
        setSelectedIssueIds([]);
      } catch (err) {
        console.warn("Service issue load failed", err);
        showToast("Unable to load service issues.", "error");
      } finally {
        setIssuesLoading(false);
      }
    };

    loadIssues();
  }, [issueIdentified, selectedCategoryId]);

  // ── Reset issue-related state when request type changes ────────────────────
  useEffect(() => {
    setIsImmediate(isBreakdown);
    if (isRoutine) {
      setIssueIdentified(false);
      setSelectedCategoryId(null);
      setServiceIssues([]);
      setSelectedIssueIds([]);
    } else {
      // Reset issue state for non-routine types
      setIssueIdentified(false);
      setSelectedCategoryId(null);
      setServiceIssues([]);
      setSelectedIssueIds([]);
    }
  }, [selectedRequestTypeId, isRoutine, isBreakdown]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const canSubmit = useMemo(() => {
    const hasAddress = useCurrentLocation ? !!location : !!selectedAddressId;

    if (!selectedVehicleId || !hasAddress || !selectedRequestTypeId)
      return false;

    // Scheduled requests need a future date and an exact time.
    if (showDateAndTime) {
      if (!preferredServiceDate.trim() || !preferredServiceTime) return false;
    }

    if (showCategorySection) {
      if (!selectedCategoryId || selectedIssueIds.length === 0) return false;

      // If any selected issue is 'Other', description is mandatory
      const selectedIssues = serviceIssues.filter((s) =>
        selectedIssueIds.includes(s.id),
      );
      const requiresDescription = selectedIssues.some(
        (i) => i.code === "OTHER" || i.displayName.toLowerCase() === "other",
      );
      if (requiresDescription && !description.trim()) return false;
    }

    return true;
  }, [
    selectedVehicleId,
    selectedAddressId,
    selectedRequestTypeId,
    preferredServiceTime,
    preferredServiceDate,
    selectedCategoryId,
    selectedIssueIds,
    useCurrentLocation,
    location,
    description,
    serviceIssues,
    showCategorySection,
    showDateAndTime,
  ]);

  // Check if description is required (Other issue selected)
  const isDescriptionRequired = useMemo(() => {
    if (!issueIdentified) return false;
    const selectedIssues = serviceIssues.filter((s) =>
      selectedIssueIds.includes(s.id),
    );
    return selectedIssues.some(
      (i) => i.code === "OTHER" || i.displayName.toLowerCase() === "other",
    );
  }, [issueIdentified, serviceIssues, selectedIssueIds]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleIssueToggle = (value: boolean) => {
    setIssueIdentified(value);
    if (!value) {
      setSelectedCategoryId(null);
      setServiceIssues([]);
      setSelectedIssueIds([]);
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    // Issues will be loaded by the useEffect
  };

  const handleIssueSelect = (issueId: number) => {
    setSelectedIssueIds((current) =>
      current.includes(issueId)
        ? current.filter((id) => id !== issueId)
        : [...current, issueId],
    );
  };

  // ── Photo picker handlers ──────────────────────────────────────────────────

  const handlePickPhotos = async () => {
    if (selectedPhotos.length >= 5) {
      showToast("Maximum 5 photos allowed.", "warning");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Gallery permission is required to pick photos.", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - selectedPhotos.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos = result.assets.map((a) => ({
        uri: a.uri,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? "image/jpeg",
      }));
      setSelectedPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Review handler (replaces direct submit) ────────────────────────────────

  const handleReview = () => {
    if (!canSubmit) {
      showToast("Please fill all required fields before reviewing.", "warning");
      return;
    }

    // Build the payload
    const payload: CreateServiceRequestPayload = {
      customerVehicleId: selectedVehicleId,
      requestTypeId: selectedRequestTypeId!,
      isIssueIdentified: isRoutine ? false : issueIdentified,
      isImmediate,
      description: description.trim() || undefined,
    };

    if (useCurrentLocation && location) {
      payload.currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        note: location.fullAddress || location.shortAddress || undefined,
      };
    } else {
      payload.addressId = selectedAddressId;
      // Also fill address location columns from the saved address details
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        payload.addressLatitude = addr.latitude ?? undefined;
        payload.addressLongitude = addr.longitude ?? undefined;
        // Build formatted address: "123, Building, Street, Landmark, City, State - Pincode"
        const parts = [
          addr.houseNumber,
          addr.buildingName,
          addr.street,
          addr.landmark,
          addr.city,
          addr.state,
          addr.pincode ? `- ${addr.pincode}` : null,
        ].filter(Boolean);
        payload.addressNote = parts.join(", ");
      }
    }

    if (showDateAndTime) {
      payload.preferredServiceDate = preferredServiceDate.trim();
      payload.preferredServiceTime = preferredServiceTime;
    }

    if (!isRoutine && issueIdentified) {
      payload.serviceCategoryId = selectedCategoryId ?? undefined;
      payload.serviceIssueIds =
        selectedIssueIds.length > 0 ? selectedIssueIds : undefined;
    }

    // Build human-readable labels for review screen
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const vehicleLabel = vehicle
      ? `${vehicle.brandName} ${vehicle.modelName} (${vehicle.registrationNumber})`
      : selectedVehicleId;

    let locationLabel = "";
    if (useCurrentLocation && location) {
      locationLabel = `Current Location — ${location.shortAddress || location.fullAddress || "Detected"}`;
    } else {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        locationLabel = `${addr.label} — ${[addr.houseNumber, addr.street, addr.city].filter(Boolean).join(", ")}`;
      }
    }

    const requestType = requestTypes.find((r) => r.id === selectedRequestTypeId);
    const requestTypeLabel = requestType?.displayName ?? "";

    const category = serviceCategories.find((c) => c.id === selectedCategoryId);
    const categoryLabel = category?.displayName ?? "";

    const issueLabels = serviceIssues
      .filter((i) => selectedIssueIds.includes(i.id))
      .map((i) => i.displayName);

    const reviewData: ReviewData = {
      vehicleLabel,
      locationLabel,
      requestTypeLabel,
      serviceDate: preferredServiceDate,
      serviceTime: preferredServiceTime,
      isImmediate,
      categoryLabel,
      issueLabels,
      description,
      photoUris: selectedPhotos,
      payload,
    };

    if (onReview) {
      onReview(reviewData);
    }
  };

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // ── Icon for request type ──────────────────────────────────────────────────

  const getRequestTypeIcon = (code: string): keyof typeof Feather.glyphMap => {
    switch (code) {
      case "ROUTINE_SERVICE":
        return "settings";
      case "REPAIR":
        return "tool";
      case "INSPECTION":
        return "search";
      case "BREAKDOWN":
        return "alert-triangle";
      default:
        return "circle";
    }
  };

  const getCategoryIcon = (code: string): keyof typeof Feather.glyphMap => {
    switch (code) {
      case "ENGINE":
        return "cpu";
      case "BRAKES":
        return "disc";
      case "ELECTRICAL":
        return "zap";
      case "BATTERY":
        return "battery";
      case "TYRES":
        return "circle";
      case "SUSPENSION":
        return "activity";
      case "GENERAL":
        return "tool";
      default:
        return "circle";
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <BackButton
            style={styles.backButtonOverride}
            onPress={() => onNavigate("Home")}
          />
          <Text style={styles.headerTitle}>Book Service</Text>
          <View style={{ width: 40 }} />
        </View>
        <LoadingSkeleton />
      </View>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────

  if (error && !vehicles.length) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <BackButton
            style={styles.backButtonOverride}
            onPress={() => onNavigate("Home")}
          />
          <Text style={styles.headerTitle}>Book Service</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="wifi-off" size={48} color="#d1d5db" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <PrimaryButton
            title="Retry"
            onPress={() => onNavigate("Booking")}
            style={{ width: 160, marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton
          style={styles.backButtonOverride}
          onPress={() => onNavigate("Home")}
        />
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── STEP 1: Select Vehicle ──────────────────────────────────────── */}
        <SectionHeader icon="truck" title="SELECT VEHICLE" step={1} />

        {vehicles.length ? (
          vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.selectionCard,
                selectedVehicleId === vehicle.id && styles.selectionCardActive,
              ]}
              onPress={() => setSelectedVehicleId(vehicle.id)}
              activeOpacity={0.7}
            >
              <View style={styles.selectionCardLeft}>
                <View
                  style={[
                    styles.selectionIcon,
                    {
                      backgroundColor:
                        selectedVehicleId === vehicle.id
                          ? "#fff3eb"
                          : "#f3f4f6",
                    },
                  ]}
                >
                  <Feather
                    name="truck"
                    size={18}
                    color={
                      selectedVehicleId === vehicle.id ? "#f97316" : "#9ca3af"
                    }
                  />
                </View>
                <View>
                  <Text style={styles.selectionCardTitle}>
                    {vehicle.brandName} {vehicle.modelName}
                  </Text>
                  <Text style={styles.selectionCardSub}>
                    {vehicle.registrationNumber}
                  </Text>
                </View>
              </View>
              {selectedVehicleId === vehicle.id && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Feather name="plus-circle" size={32} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              No vehicles found. Add one to book a service.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => onNavigate("AddBike")}
            >
              <Feather name="plus" size={16} color="#ffffff" />
              <Text style={styles.emptyStateButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── STEP 2: Service Location ────────────────────────────────────── */}
        <SectionHeader icon="map-pin" title="SERVICE LOCATION" step={2} />

        {/* Current Location Toggle */}
        <View style={styles.locationToggle}>
          <View style={styles.locationToggleLeft}>
            <Feather
              name="navigation"
              size={16}
              color={useCurrentLocation ? "#f97316" : "#6b7280"}
            />
            <Text
              style={[
                styles.locationToggleText,
                useCurrentLocation && { color: "#f97316", fontWeight: "700" },
              ]}
            >
              Use current location
            </Text>
          </View>
          <Switch
            value={useCurrentLocation}
            onValueChange={(v) => {
              setUseCurrentLocation(v);
              if (v) {
                setSelectedAddressId("");
                refreshLocation();
              }
            }}
            thumbColor={useCurrentLocation ? "#f97316" : "#f3f4f6"}
            trackColor={{ false: "#d1d5db", true: "#fcd34d" }}
          />
        </View>

        {useCurrentLocation ? (
          <View style={[styles.selectionCard, styles.selectionCardActive]}>
            <View style={styles.selectionCardLeft}>
              <View
                style={[styles.selectionIcon, { backgroundColor: "#fff3eb" }]}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#f97316" />
                ) : (
                  <Feather name="crosshair" size={18} color="#f97316" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectionCardTitle}>
                  {locationLoading
                    ? "Detecting location..."
                    : "Current Location"}
                </Text>
                <Text style={styles.selectionCardSub} numberOfLines={2}>
                  {locationLoading
                    ? "Please wait..."
                    : location
                      ? location.shortAddress || location.fullAddress
                      : errorType === "DENIED"
                        ? "Location permission denied"
                        : errorType === "DISABLED"
                          ? "Location services disabled"
                          : "Unable to detect location"}
                </Text>
              </View>
            </View>
            {location && !locationLoading && (
              <View style={styles.checkCircle}>
                <Feather name="check" size={14} color="#ffffff" />
              </View>
            )}
          </View>
        ) : addresses.length ? (
          addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.selectionCard,
                selectedAddressId === address.id && styles.selectionCardActive,
              ]}
              onPress={() => setSelectedAddressId(address.id)}
              activeOpacity={0.7}
            >
              <View style={styles.selectionCardLeft}>
                <View
                  style={[
                    styles.selectionIcon,
                    {
                      backgroundColor:
                        selectedAddressId === address.id
                          ? "#fff3eb"
                          : "#f3f4f6",
                    },
                  ]}
                >
                  <Feather
                    name={
                      address.label?.toLowerCase() === "home"
                        ? "home"
                        : address.label?.toLowerCase() === "work"
                          ? "briefcase"
                          : "map-pin"
                    }
                    size={18}
                    color={
                      selectedAddressId === address.id ? "#f97316" : "#9ca3af"
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectionCardTitle}>{address.label}</Text>
                  <Text style={styles.selectionCardSub} numberOfLines={2}>
                    {[address.houseNumber, address.street, address.city]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              </View>
              {selectedAddressId === address.id && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Feather name="map" size={32} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              No saved addresses. Use current location or add one in Profile.
            </Text>
          </View>
        )}

        {/* ─── STEP 3: Service Type ────────────────────────────────────────── */}
        <SectionHeader icon="grid" title="SERVICE TYPE" step={3} />

        <View style={styles.requestTypeGrid}>
          {requestTypes.map((type) => {
            const isSelected = selectedRequestTypeId === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.requestTypeCard,
                  isSelected && styles.requestTypeCardActive,
                ]}
                onPress={() => setSelectedRequestTypeId(type.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.requestTypeIcon,
                    isSelected && styles.requestTypeIconActive,
                  ]}
                >
                  <Feather
                    name={getRequestTypeIcon(type.code)}
                    size={20}
                    color={isSelected ? "#f97316" : "#9ca3af"}
                  />
                </View>
                <Text
                  style={[
                    styles.requestTypeText,
                    isSelected && styles.requestTypeTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {type.displayName}
                </Text>
                {type.description ? (
                  <Text style={styles.requestTypeDesc} numberOfLines={2}>
                    {type.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── STEP 4: Dynamic Section ─────────────────────────────────────── */}
        {selectedRequestTypeId !== null && (
          <>
            {/* Issue Identified Toggle (not for Routine) */}
            {showIssueToggle && (
              <View style={styles.issueToggleCard}>
                <View style={styles.issueToggleLeft}>
                  <Feather name="help-circle" size={20} color="#f97316" />
                  <Text style={styles.issueToggleText}>
                    Do you know the issue?
                  </Text>
                </View>
                <View style={styles.issueToggleBtns}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      issueIdentified && styles.toggleBtnActive,
                    ]}
                    onPress={() => handleIssueToggle(true)}
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        issueIdentified && styles.toggleBtnTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      !issueIdentified && styles.toggleBtnNo,
                    ]}
                    onPress={() => handleIssueToggle(false)}
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        !issueIdentified && styles.toggleBtnTextNo,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Service Categories (only when issue is identified) */}
            {showCategorySection && (
              <>
                <SectionHeader
                  icon="layers"
                  title="SERVICE CATEGORY"
                  step={4}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  {serviceCategories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipActive,
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name={getCategoryIcon(category.code)}
                          size={16}
                          color={isSelected ? "#f97316" : "#6b7280"}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextActive,
                          ]}
                        >
                          {category.displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Service Issues */}
                {selectedCategoryId !== null && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.issuesSectionTitle}>
                      SELECT ISSUES{" "}
                      <Text style={styles.issuesSectionHint}>
                        (tap to select multiple)
                      </Text>
                    </Text>

                    {issuesLoading ? (
                      <View
                        style={{ flexDirection: "row", gap: 10, marginTop: 8 }}
                      >
                        <SkeletonLine width={100} height={36} />
                        <SkeletonLine width={120} height={36} />
                        <SkeletonLine width={80} height={36} />
                      </View>
                    ) : serviceIssues.length ? (
                      <View style={styles.issueGrid}>
                        {serviceIssues.map((issue) => {
                          const isSelected = selectedIssueIds.includes(
                            issue.id,
                          );
                          return (
                            <TouchableOpacity
                              key={issue.id}
                              style={[
                                styles.issueChip,
                                isSelected && styles.issueChipActive,
                              ]}
                              onPress={() => handleIssueSelect(issue.id)}
                              activeOpacity={0.7}
                            >
                              <Feather
                                name={isSelected ? "check-square" : "square"}
                                size={14}
                                color={isSelected ? "#f97316" : "#9ca3af"}
                              />
                              <Text
                                style={[
                                  styles.issueChipText,
                                  isSelected && styles.issueChipTextActive,
                                ]}
                              >
                                {issue.displayName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.noIssuesText}>
                        No issues found for this category.
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>
                DESCRIPTION{" "}
                <Text
                  style={
                    isDescriptionRequired
                      ? styles.requiredMark
                      : styles.optionalMark
                  }
                >
                  {isDescriptionRequired
                    ? "(Required - 'Other' issue selected)"
                    : "(Optional)"}
                </Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  isDescriptionRequired &&
                    !description.trim() &&
                    styles.textAreaError,
                ]}
                placeholder="Describe the issue or add more details for the mechanic..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Breakdown assistance is always dispatched immediately. */}
            {!isBreakdown && (
              <>
                <SectionHeader icon="zap" title="WHEN DO YOU NEED SERVICE?" step={showCategorySection ? 5 : 4} />
                <View style={styles.dispatchModeCard}>
              <TouchableOpacity
                style={[styles.dispatchModeButton, isImmediate && styles.dispatchModeButtonActive]}
                onPress={() => setIsImmediate(true)}
                activeOpacity={0.7}
              >
                <Feather name="zap" size={17} color={isImmediate ? "#ffffff" : "#f97316"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dispatchModeTitle, isImmediate && styles.dispatchModeTitleActive]}>Immediately</Text>
                  <Text style={[styles.dispatchModeHint, isImmediate && styles.dispatchModeHintActive]}>Send a mechanic as soon as possible</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dispatchModeButton, !isImmediate && styles.dispatchModeButtonActive]}
                onPress={() => setIsImmediate(false)}
                activeOpacity={0.7}
              >
                <Feather name="calendar" size={17} color={!isImmediate ? "#ffffff" : "#f97316"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dispatchModeTitle, !isImmediate && styles.dispatchModeTitleActive]}>Schedule a time</Text>
                  <Text style={[styles.dispatchModeHint, !isImmediate && styles.dispatchModeHintActive]}>Choose the date and exact time</Text>
                </View>
              </TouchableOpacity>
                </View>
              </>
            )}

            {isImmediate && (
              <View style={styles.immediateNotice}>
                <Feather name="info" size={16} color="#c2410c" />
                <Text style={styles.immediateNoticeText}>
                  {isBreakdown
                    ? "Breakdown assistance is sent immediately with the current date and time."
                    : "This request will be marked urgent and sent with the current date and time."}
                </Text>
              </View>
            )}

            {/* Date Picker */}
            {showDateAndTime && (
              <>
                <SectionHeader
                  icon="calendar"
                  title="PREFERRED DATE"
                  step={showCategorySection ? 6 : 5}
                />
                <DatePickerField
                  value={preferredServiceDate}
                  onChange={setPreferredServiceDate}
                  placeholder="Select preferred date"
                />
              </>
            )}

            {/* Exact digital time */}
            {showDateAndTime && (
              <>
                <SectionHeader
                  icon="clock"
                  title="PREFERRED TIME"
                  step={showCategorySection ? 7 : 6}
                />
                <DigitalTimePickerField
                  value={preferredServiceTime}
                  onChange={setPreferredServiceTime}
                  date={preferredServiceDate}
                  slots={serviceSlots}
                />
              </>
            )}

            {/* ─── Add Photos (Optional) ───────────────────────────────── */}
            <SectionHeader
              icon="camera"
              title="ADD PHOTOS (OPTIONAL)"
              step={showCategorySection ? (showDateAndTime ? 8 : 7) : (showDateAndTime ? 6 : 5)}
            />
            <View style={styles.photoPicker}>
              {/* Existing photo thumbnails */}
              {selectedPhotos.map((photo, idx) => (
                <View key={idx} style={styles.photoThumbWrap}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumb}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => handleRemovePhoto(idx)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="x" size={12} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add more button (shown if < 5 photos) */}
              {selectedPhotos.length < 5 && (
                <TouchableOpacity
                  style={styles.photoAddBtn}
                  onPress={handlePickPhotos}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={24} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            {selectedPhotos.length > 0 && (
              <Text style={styles.photoHint}>
                {selectedPhotos.length}/5 photo{selectedPhotos.length > 1 ? "s" : ""} added · Tap × to remove
              </Text>
            )}
            {selectedPhotos.length === 0 && (
              <Text style={styles.photoHint}>
                Add up to 5 photos to help the mechanic understand the issue
              </Text>
            )}

            {/* Submit → Review Button */}
            <View style={styles.submitSection}>
              <PrimaryButton
                title="Review Request"
                onPress={handleReview}
                disabled={!canSubmit}
              />
              {!canSubmit && selectedRequestTypeId !== null && (
                <Text style={styles.validationHint}>
                  {!selectedVehicleId
                    ? "Please select a vehicle"
                    : !selectedAddressId && !useCurrentLocation
                      ? "Please select an address"
                      : useCurrentLocation && !location
                        ? "Waiting for location..."
                        : showIssueToggle &&
                            issueIdentified &&
                            !selectedCategoryId
                          ? "Please select a service category"
                          : showIssueToggle &&
                              issueIdentified &&
                              selectedIssueIds.length === 0
                            ? "Please select at least one issue"
                            : isDescriptionRequired && !description.trim()
                              ? "Description is required for 'Other' issue"
                              : showDateAndTime && !preferredServiceDate
                                ? "Please select a date"
                                : showDateAndTime && !preferredServiceTime
                                  ? "Please select a time"
                                  : ""}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  backButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── Section Header ──────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },
  sectionStepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionStepText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
    letterSpacing: 0.8,
  },

  // ── Selection Card ──────────────────────────────────────────────────────
  selectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  selectionCardActive: {
    borderColor: "#f97316",
    backgroundColor: "#fffbf5",
    shadowColor: "#f97316",
    shadowOpacity: 0.08,
  },
  selectionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  selectionCardSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // ── Empty State ─────────────────────────────────────────────────────────
  emptyStateCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 14,
    textAlign: "center",
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Location Toggle ─────────────────────────────────────────────────────
  locationToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // ── Request Type Grid ───────────────────────────────────────────────────
  requestTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  requestTypeCard: {
    width: "48%" as any,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 2,
  },
  requestTypeCardActive: {
    borderColor: "#f97316",
    backgroundColor: "#fffbf5",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  requestTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  requestTypeIconActive: {
    backgroundColor: "#fff3eb",
  },
  requestTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  requestTypeTextActive: {
    color: "#ea580c",
  },
  requestTypeDesc: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },

  // ── Issue Toggle ────────────────────────────────────────────────────────
  issueToggleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffbf5",
    borderWidth: 1.5,
    borderColor: "#fed7aa",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  issueToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  issueToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  issueToggleBtns: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  toggleBtnActive: {
    borderColor: "#f97316",
    backgroundColor: "#f97316",
  },
  toggleBtnNo: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  toggleBtnTextActive: {
    color: "#ffffff",
  },
  toggleBtnTextNo: {
    color: "#6b7280",
  },

  // ── Category Chips ──────────────────────────────────────────────────────
  categoryScroll: {
    paddingVertical: 4,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  categoryChipActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff3eb",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  categoryChipTextActive: {
    color: "#ea580c",
    fontWeight: "700",
  },

  // ── Issues ──────────────────────────────────────────────────────────────
  issuesSection: {
    marginTop: 16,
  },
  issuesSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  issuesSectionHint: {
    fontWeight: "400",
    color: "#9ca3af",
    fontSize: 11,
  },
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  issueChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  issueChipActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff3eb",
  },
  issueChipText: {
    fontSize: 13,
    color: "#374151",
  },
  issueChipTextActive: {
    color: "#ea580c",
    fontWeight: "700",
  },
  noIssuesText: {
    color: "#9ca3af",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
  },

  // ── Description ─────────────────────────────────────────────────────────
  descriptionSection: {
    marginTop: 20,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  requiredMark: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 11,
  },
  optionalMark: {
    color: "#9ca3af",
    fontWeight: "400",
    fontSize: 11,
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    minHeight: 100,
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
  },
  textAreaError: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },

  // ── Dispatch mode ───────────────────────────────────────────────────────
  dispatchModeCard: {
    gap: 10,
  },
  dispatchModeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#fed7aa",
    borderRadius: 14,
    padding: 14,
  },
  dispatchModeButtonActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  dispatchModeTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  dispatchModeTitleActive: {
    color: "#ffffff",
  },
  dispatchModeHint: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
  dispatchModeHintActive: {
    color: "#ffedd5",
  },
  immediateNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  immediateNoticeText: {
    flex: 1,
    color: "#9a3412",
    fontSize: 12,
    lineHeight: 17,
  },

  // ── Slot Grid ───────────────────────────────────────────────────────────
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotCard: {
    width: "47%" as any,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 2,
  },
  slotCardActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff3eb",
  },
  slotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  slotTextActive: {
    color: "#ea580c",
    fontWeight: "700",
  },

  // ── Submit ──────────────────────────────────────────────────────────────
  submitSection: {
    marginTop: 28,
    marginBottom: 20,
  },
  validationHint: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 10,
  },

  // ── Photo picker ────────────────────────────────────────────────────────
  photoPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  photoThumbWrap: {
    position: "relative",
    width: 80,
    height: 80,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  photoAddBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  photoHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 8,
  },

  // ── Error State ─────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});
