import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
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
import PrimaryButton from "../ui/PrimaryButton";
import Toast, { ToastType } from "../ui/Toast";

interface BookingScreenProps {
  onNavigate: (screen: string) => void;
}

export default function BookingScreen({ onNavigate }: BookingScreenProps) {
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [serviceSlots, setServiceSlots] = useState<ServiceSlot[]>([]);
  const [serviceIssues, setServiceIssues] = useState<ServiceIssue[]>([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedRequestTypeId, setSelectedRequestTypeId] = useState<
    number | null
  >(null);
  const [selectedServiceSlotId, setSelectedServiceSlotId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedIssueIds, setSelectedIssueIds] = useState<number[]>([]);
  const [preferredServiceDate, setPreferredServiceDate] = useState("");
  const [description, setDescription] = useState("");
  const [issueIdentified, setIssueIdentified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const {
    loading: locationLoading,
    location,
    errorType,
    refreshLocation,
  } = useUserLocation();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          vehiclesResponse,
          addressesResponse,
          requestTypesResponse,
          categoryResponse,
          slotsResponse,
        ] = await Promise.all([
          vehicleService.getMyVehicles(),
          addressService.getMyAddresses(),
          vehicleService.getRequestTypes(),
          vehicleService.getServiceCategories(),
          vehicleService.getServiceSlots(),
        ]);

        setVehicles(vehiclesResponse);
        setAddresses(addressesResponse);
        setRequestTypes(requestTypesResponse);
        setServiceCategories(categoryResponse);
        setServiceSlots(slotsResponse);

        if (vehiclesResponse.length) {
          setSelectedVehicleId(vehiclesResponse[0].id);
        }
        if (addressesResponse.length) {
          setSelectedAddressId(addressesResponse[0].id);
        }
        if (requestTypesResponse.length) {
          setSelectedRequestTypeId(requestTypesResponse[0].id);
        }
        if (slotsResponse.length) {
          setSelectedServiceSlotId(slotsResponse[0].id);
        }
        if (categoryResponse.length) {
          setSelectedCategoryId(categoryResponse[0].id);
        }
      } catch (err) {
        console.warn("Booking data load failed", err);
        setError("Unable to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadIssues = async () => {
      if (!issueIdentified || selectedCategoryId == null) {
        setServiceIssues([]);
        setSelectedIssueIds([]);
        return;
      }

      try {
        const issues =
          await vehicleService.getServiceIssues(selectedCategoryId);
        setServiceIssues(issues);
        setSelectedIssueIds([]);
      } catch (err) {
        console.warn("Service issue load failed", err);
        setError("Unable to load service issues. Please try again.");
      }
    };

    loadIssues();
  }, [issueIdentified, selectedCategoryId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [vehicles, selectedVehicleId],
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const canSubmit = useMemo(() => {
    if (
      !selectedVehicleId ||
      !selectedAddressId ||
      !selectedRequestTypeId ||
      !selectedServiceSlotId ||
      !preferredServiceDate.trim()
    ) {
      return false;
    }
    if (
      issueIdentified &&
      (!selectedCategoryId || selectedIssueIds.length === 0)
    ) {
      return false;
    }
    return true;
  }, [
    selectedVehicleId,
    selectedAddressId,
    selectedRequestTypeId,
    selectedServiceSlotId,
    preferredServiceDate,
    issueIdentified,
    selectedCategoryId,
    selectedIssueIds,
  ]);

  const handleIssueToggle = (value: boolean) => {
    setIssueIdentified(value);
    if (!value) {
      setSelectedCategoryId(serviceCategories[0]?.id ?? null);
      setServiceIssues([]);
      setSelectedIssueIds([]);
    }
  };

  const handleIssueSelect = (issueId: number) => {
    setSelectedIssueIds((current) =>
      current.includes(issueId)
        ? current.filter((id) => id !== issueId)
        : [...current, issueId],
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Please fill all required fields before booking.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (preferredServiceDate.trim() < todayStr) {
      setError("Booking date cannot be in the past. Please select today or a future date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateServiceRequestPayload = {
        customerVehicleId: selectedVehicleId,
        addressId: selectedAddressId,
        requestTypeId: selectedRequestTypeId!,
        preferredServiceDate: preferredServiceDate.trim(),
        serviceSlotId: selectedServiceSlotId,
        isIssueIdentified: issueIdentified,
        description: description.trim() || undefined,
        serviceCategoryId: issueIdentified
          ? (selectedCategoryId ?? undefined)
          : undefined,
        serviceIssueIds: issueIdentified ? selectedIssueIds : undefined,
      };

      await vehicleService.createServiceRequest(payload);

      showToast(
        "Service request created successfully. Our team will contact you shortly.",
        "success",
      );
      setTimeout(() => onNavigate("Home"), 1800);
    } catch (err: any) {
      console.warn("Create service request failed", err);
      const message =
        err?.message || "Unable to place service request. Please try again.";
      setError(message);
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleAddBike = () => {
    onNavigate("AddBike");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.bookingHeader}>
        <BackButton
          style={styles.backButtonOverride}
          onPress={() => onNavigate("Home")}
        />
        <Text style={styles.bookingTitle}>Book Service</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>SELECT VEHICLE</Text>
        {vehicles.length ? (
          vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.optionCard,
                selectedVehicleId === vehicle.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedVehicleId(vehicle.id)}
            >
              <View>
                <Text style={styles.optionTitle}>
                  {vehicle.brandName} {vehicle.modelName}
                </Text>
                <Text style={styles.optionSubtitle}>
                  {vehicle.registrationNumber}
                </Text>
              </View>
              {selectedVehicleId === vehicle.id && (
                <Feather name="check" size={18} color="#10b981" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              No bikes found. Add one to book a service.
            </Text>
            <TouchableOpacity
              onPress={handleAddBike}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>Add Bike</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>SERVICE LOCATION</Text>
        {addresses.length ? (
          addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.optionCard,
                selectedAddressId === address.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedAddressId(address.id)}
            >
              <View>
                <Text style={styles.optionTitle}>{address.label}</Text>
                <Text style={styles.optionSubtitle}>
                  {address.houseNumber}, {address.street}
                </Text>
              </View>
              {selectedAddressId === address.id && (
                <Feather name="check" size={18} color="#10b981" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              No saved addresses found. Add an address in profile.
            </Text>
          </View>
        )}

        <Text style={styles.label}>BOOKING DATE</Text>
        <DatePickerField
          value={preferredServiceDate}
          onChange={setPreferredServiceDate}
          placeholder="Select booking date"
        />

        <Text style={styles.label}>SERVICE TYPE</Text>
        <View style={styles.optionGrid}>
          {requestTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.smallOption,
                selectedRequestTypeId === type.id && styles.smallOptionSelected,
              ]}
              onPress={() => setSelectedRequestTypeId(type.id)}
            >
              <Text
                style={[
                  styles.smallOptionText,
                  selectedRequestTypeId === type.id &&
                    styles.smallOptionTextSelected,
                ]}
              >
                {type.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>SERVICE SLOT</Text>
        <View style={styles.optionGrid}>
          {serviceSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.smallOption,
                selectedServiceSlotId === slot.id && styles.smallOptionSelected,
              ]}
              onPress={() => setSelectedServiceSlotId(slot.id)}
            >
              <Text
                style={[
                  styles.smallOptionText,
                  selectedServiceSlotId === slot.id &&
                    styles.smallOptionTextSelected,
                ]}
              >
                {slot.slotName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.issueToggleRow}>
          <Text style={styles.label}>Issue identified?</Text>
          <Switch
            value={issueIdentified}
            onValueChange={handleIssueToggle}
            thumbColor={issueIdentified ? "#f97316" : "#f3f4f6"}
            trackColor={{ false: "#d1d5db", true: "#fcd34d" }}
          />
        </View>

        {issueIdentified && (
          <>
            <Text style={styles.label}>SERVICE CATEGORY</Text>
            <View style={styles.optionGrid}>
              {serviceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.smallOption,
                    selectedCategoryId === category.id &&
                      styles.smallOptionSelected,
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <Text
                    style={[
                      styles.smallOptionText,
                      selectedCategoryId === category.id &&
                        styles.smallOptionTextSelected,
                    ]}
                  >
                    {category.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {serviceIssues.length ? (
              <>
                <Text style={styles.label}>SERVICE ISSUES</Text>
                <View style={styles.issueGrid}>
                  {serviceIssues.map((issue) => (
                    <TouchableOpacity
                      key={issue.id}
                      style={[
                        styles.issueItem,
                        selectedIssueIds.includes(issue.id) &&
                          styles.issueItemSelected,
                      ]}
                      onPress={() => handleIssueSelect(issue.id)}
                    >
                      <Text
                        style={[
                          styles.issueText,
                          selectedIssueIds.includes(issue.id) &&
                            styles.issueTextSelected,
                        ]}
                      >
                        {issue.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.helpText}>
                Choose a category to see matching issues.
              </Text>
            )}
          </>
        )}

        <Text style={[styles.label, { marginTop: 24 }]}>MORE DETAILS</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add more details for the mechanic (optional)"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <PrimaryButton
          title={submitting ? "Requesting..." : "Request Mechanic Now"}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        />
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

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 16,
  },
  backButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 12,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyStateCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  emptyStateText: {
    color: "#1e3a8a",
    fontSize: 13,
    marginBottom: 10,
  },
  emptyStateButton: {
    backgroundColor: "#f97316",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    color: "#111827",
    fontSize: 14,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  smallOption: {
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
    marginRight: 10,
  },
  smallOptionSelected: {
    backgroundColor: "#fff3eb",
    borderColor: "#f97316",
  },
  smallOptionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  smallOptionTextSelected: {
    color: "#b45309",
  },
  issueToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  issueItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    marginRight: 10,
    marginBottom: 10,
  },
  issueItemSelected: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  issueText: {
    color: "#374151",
    fontSize: 13,
  },
  issueTextSelected: {
    color: "#b45309",
    fontWeight: "700",
  },
  helpText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },
});
