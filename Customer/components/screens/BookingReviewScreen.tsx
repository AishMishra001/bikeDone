import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadServiceImages } from "../../services/imageUploadService";
import { vehicleService, CreateServiceRequestPayload } from "../../services/vehicleService";
import BackButton from "../ui/BackButton";
import PrimaryButton from "../ui/PrimaryButton";
import Toast, { ToastType } from "../ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewData {
  // Vehicle
  vehicleLabel: string; // "Honda Shine (DL 5S AB 1234)"

  // Location
  locationLabel: string; // "Home — 123, Sharma Market..." or "Current Location"

  // Request type
  requestTypeLabel: string; // "Routine Service"

  // Date / time
  serviceDate: string; // "2024-05-20" or "" for immediate
  serviceTime: string; // "09:00" or "" for immediate
  isImmediate: boolean;

  // Category & Issues
  categoryLabel: string; // "Engine" or ""
  issueLabels: string[]; // ["Oil leak", "Overheating"] or []

  // Description
  description: string;

  // Photos (local URIs before upload)
  photoUris: Array<{ uri: string; fileName?: string; mimeType?: string }>;

  // The actual payload to submit (imageUrls will be filled after upload)
  payload: CreateServiceRequestPayload;
}

interface BookingReviewScreenProps {
  reviewData: ReviewData;
  onConfirm: (requestNumber: string) => void;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (hhmm: string): string => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${suffix}`;
};

const formatDate = (yyyymmdd: string): string => {
  if (!yyyymmdd) return "";
  const [y, mo, d] = yyyymmdd.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d} ${months[mo - 1]} ${y}`;
};

// ─── Row ──────────────────────────────────────────────────────────────────────

function ReviewRow({
  label,
  value,
  onChangeTap,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeTap?: () => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text
          style={[styles.rowValue, multiline && { lineHeight: 20 }]}
          numberOfLines={multiline ? 0 : 2}
        >
          {value || "—"}
        </Text>
      </View>
      {onChangeTap && (
        <TouchableOpacity onPress={onChangeTap} style={styles.changeBtn}>
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingReviewScreen({
  reviewData,
  onConfirm,
  onBack,
  onNavigate,
}: BookingReviewScreenProps) {
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (message: string, type: ToastType = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      let imageUrls: string[] = [];

      // Step 1: Upload images if any
      if (reviewData.photoUris.length > 0) {
        try {
          imageUrls = await uploadServiceImages(reviewData.photoUris);
        } catch {
          showToast("Image upload failed. Submitting without photos.");
          // Non-fatal — continue without images
        }
      }

      // Step 2: Build final payload with uploaded URLs
      const finalPayload: CreateServiceRequestPayload = {
        ...reviewData.payload,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      // Step 3: Create service request
      const result = await vehicleService.createServiceRequest(finalPayload);

      if (result.requestNumber) {
        onConfirm(result.requestNumber);
        onNavigate("RequestSuccess");
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to submit request. Please try again.";
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  const {
    vehicleLabel,
    locationLabel,
    requestTypeLabel,
    serviceDate,
    serviceTime,
    isImmediate,
    categoryLabel,
    issueLabels,
    description,
    photoUris,
  } = reviewData;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backBtnOverride} onPress={onBack} />
        <Text style={styles.headerTitle}>Review & Confirm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary card ───────────────────────────────────────────── */}
        <View style={styles.card}>

          <ReviewRow
            label="Vehicle"
            value={vehicleLabel}
            onChangeTap={onBack}
          />
          <View style={styles.divider} />

          <ReviewRow
            label="Service Location"
            value={locationLabel}
            onChangeTap={onBack}
          />
          <View style={styles.divider} />

          <ReviewRow
            label="Service Type"
            value={requestTypeLabel}
            onChangeTap={onBack}
          />
          <View style={styles.divider} />

          <ReviewRow
            label="Date & Time"
            value={
              isImmediate
                ? "As soon as possible (Immediate)"
                : `${formatDate(serviceDate)}  ·  ${formatTime(serviceTime)}`
            }
            onChangeTap={onBack}
          />

          {(categoryLabel || issueLabels.length > 0) && (
            <>
              <View style={styles.divider} />
              <ReviewRow
                label="Category"
                value={categoryLabel}
                onChangeTap={onBack}
              />
            </>
          )}

          {issueLabels.length > 0 && (
            <>
              <View style={styles.divider} />
              <ReviewRow
                label="Issues"
                value={issueLabels.join(", ")}
                onChangeTap={onBack}
                multiline
              />
            </>
          )}

          {description.trim().length > 0 && (
            <>
              <View style={styles.divider} />
              <ReviewRow
                label="Description"
                value={description}
                onChangeTap={onBack}
                multiline
              />
            </>
          )}
        </View>

        {/* ── Photos preview ─────────────────────────────────────────── */}
        {photoUris.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosSectionTitle}>
              <Feather name="image" size={13} color="#6b7280" />
              {"  "}ATTACHED PHOTOS ({photoUris.length})
            </Text>
            <View style={styles.photoRow}>
              {photoUris.map((photo, idx) => (
                <Image
                  key={idx}
                  source={{ uri: photo.uri }}
                  style={styles.photoThumb}
                  resizeMode="cover"
                />
              ))}
            </View>
            <TouchableOpacity onPress={onBack} style={styles.changePhotosLink}>
              <Feather name="edit-2" size={13} color="#f97316" />
              <Text style={styles.changePhotosText}>Change photos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Note ───────────────────────────────────────────────────── */}
        <View style={styles.noteCard}>
          <Feather name="info" size={15} color="#2563eb" />
          <Text style={styles.noteText}>
            Once confirmed, our team will review your request and assign a mechanic. You can track the status in My Bookings.
          </Text>
        </View>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <View style={styles.submitSection}>
          <PrimaryButton
            title={submitting ? "Confirming..." : "Confirm Request"}
            onPress={handleConfirm}
            disabled={submitting}
            loading={submitting}
          />
        </View>
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  backBtnOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 0,
  },

  // Row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  rowValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#fff3eb",
    borderWidth: 1,
    borderColor: "#fed7aa",
    alignSelf: "flex-start",
  },
  changeBtnText: {
    fontSize: 12,
    color: "#f97316",
    fontWeight: "700",
  },

  // Photos
  photosSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 16,
  },
  photosSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  changePhotosLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  changePhotosText: {
    fontSize: 13,
    color: "#f97316",
    fontWeight: "700",
  },

  // Note
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 19,
  },

  // Submit
  submitSection: {
    marginBottom: 8,
  },
});
