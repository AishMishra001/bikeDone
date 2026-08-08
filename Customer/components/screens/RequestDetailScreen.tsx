import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MyServiceRequest, vehicleService } from "../../services/vehicleService";
import BackButton from "../ui/BackButton";
import DatePickerField from "../ui/DatePickerField";
import DigitalTimePickerField from "../ui/DigitalTimePickerField";
import Toast, { ToastType } from "../ui/Toast";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RequestDetailScreenProps {
  requestId: string;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

// ─── Business Logic Guards ────────────────────────────────────────────────────

const CANCELLABLE_STATUSES = ["REQUEST_CREATED", "MECHANIC_ASSIGNED"];
const RESCHEDULABLE_STATUSES = ["REQUEST_CREATED", "MECHANIC_ASSIGNED"];
const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED"];

function canCancel(request: MyServiceRequest): boolean {
  return CANCELLABLE_STATUSES.includes(request.status);
}

function canReschedule(request: MyServiceRequest): boolean {
  if (request.isImmediate) return false;
  return RESCHEDULABLE_STATUSES.includes(request.status);
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  bg: string; color: string; icon: keyof typeof Feather.glyphMap; label: string;
}> = {
  REQUEST_CREATED:   { bg: "#eff6ff", color: "#2563eb", icon: "clock",       label: "Request Created" },
  MECHANIC_ASSIGNED: { bg: "#f0fdf4", color: "#16a34a", icon: "user-check",  label: "Mechanic Assigned" },
  ON_THE_WAY:        { bg: "#fff7ed", color: "#ea580c", icon: "navigation",  label: "On The Way" },
  ARRIVED:           { bg: "#fff7ed", color: "#d97706", icon: "map-pin",     label: "Arrived" },
  INSPECTION_STARTED:{ bg: "#fefce8", color: "#ca8a04", icon: "search",      label: "Inspection Started" },
  ESTIMATE_PREPARED: { bg: "#fefce8", color: "#92400e", icon: "file-text",   label: "Estimate Prepared" },
  CUSTOMER_APPROVED: { bg: "#f0fdf4", color: "#15803d", icon: "thumbs-up",   label: "Approved" },
  WORK_STARTED:      { bg: "#fff7ed", color: "#ea580c", icon: "tool",        label: "Work In Progress" },
  WORK_COMPLETED:    { bg: "#f0fdf4", color: "#16a34a", icon: "check-circle",label: "Work Completed" },
  COMPLETED:         { bg: "#f0fdf4", color: "#16a34a", icon: "check-circle",label: "Completed" },
  CANCELLED:         { bg: "#fef2f2", color: "#dc2626", icon: "x-circle",    label: "Cancelled" },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { bg: "#f3f4f6", color: "#6b7280", icon: "circle" as keyof typeof Feather.glyphMap, label: status };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

function formatTime(hhmm: string | null): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const [y, mo, d] = dateStr.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[mo - 1]} ${y}`;
}

const CANCEL_REASONS = [
  "Booked by mistake",
  "Not required anymore",
  "Found another service",
  "Rescheduling to a different time",
  "Other",
];

// ─── Section Row ──────────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: {
  icon: keyof typeof Feather.glyphMap; label: string; value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={15} color="#f97316" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RequestDetailScreen({
  requestId, onBack, onNavigate,
}: RequestDetailScreenProps) {

  const [request, setRequest] = useState<MyServiceRequest | null>(null);
  const [slots, setSlots] = useState<Array<{ id: string; slotName: string; slotTime: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel flow state
  const [cancelStep, setCancelStep] = useState<"idle" | "reason" | "confirm" | "done">("idle");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOtherText, setCancelOtherText] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule flow state
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "error") => {
    setToastMessage(msg); setToastType(type); setToastVisible(true);
  };

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [req, slotsRes] = await Promise.all([
          vehicleService.getServiceRequestById(requestId),
          vehicleService.getServiceSlots(),
        ]);
        setRequest(req);
        setSlots(slotsRes);
        // Pre-fill reschedule with current date/time
        if (req.preferredServiceDate) setRescheduleDate(req.preferredServiceDate);
        if (req.preferredServiceTime) setRescheduleTime(req.preferredServiceTime.slice(0, 5));
      } catch (e: any) {
        setError(e?.message || "Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  // ── Cancel handlers ─────────────────────────────────────────────────────────
  const handleCancelSubmit = async () => {
    const finalReason = cancelReason === "Other"
      ? (cancelOtherText.trim() || "Other")
      : cancelReason;
    if (!finalReason) { showToast("Please select a reason."); return; }

    setCancelLoading(true);
    try {
      await vehicleService.cancelServiceRequest(requestId, finalReason);
      setCancelStep("done");
      setRequest(prev => prev ? { ...prev, status: "CANCELLED" } : prev);
    } catch (e: any) {
      showToast(e?.message || "Failed to cancel request.");
      setCancelStep("idle");
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Reschedule handlers ─────────────────────────────────────────────────────
  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      showToast("Please select date and time."); return;
    }
    setRescheduleLoading(true);
    try {
      await vehicleService.rescheduleServiceRequest(requestId, rescheduleDate, rescheduleTime);
      setRequest(prev => prev ? {
        ...prev,
        preferredServiceDate: rescheduleDate,
        preferredServiceTime: rescheduleTime,
      } : prev);
      setRescheduleVisible(false);
      showToast("Request rescheduled successfully!", "success");
    } catch (e: any) {
      showToast(e?.message || "Failed to reschedule request.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton style={styles.backOverride} onPress={onBack} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton style={styles.backOverride} onPress={onBack} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerBox}>
          <Feather name="alert-circle" size={48} color="#fca5a5" />
          <Text style={styles.errorText}>{error || "Request not found."}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onBack}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusCfg = getStatusConfig(request.status);
  const showCancel = canCancel(request);
  const showReschedule = canReschedule(request);
  const isTerminal = TERMINAL_STATUSES.includes(request.status);

  // ── Cancel Done Screen ──────────────────────────────────────────────────────
  if (cancelStep === "done") {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <View style={styles.doneIcon}>
          <Feather name="x-circle" size={56} color="#dc2626" />
        </View>
        <Text style={styles.doneTitle}>Request Cancelled</Text>
        <Text style={styles.doneSubtitle}>
          Your request {request.requestNumber} has been cancelled successfully.
        </Text>
        <TouchableOpacity style={styles.donePrimaryBtn} onPress={() => onNavigate("MyRequests")}>
          <Text style={styles.donePrimaryText}>Back to My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneSecondaryBtn} onPress={() => onNavigate("Home")}>
          <Text style={styles.doneSecondaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backOverride} onPress={onBack} />
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Status Badge + Request Number ──────────────────────────── */}
        <View style={styles.topCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Feather name={statusCfg.icon} size={14} color={statusCfg.color} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <Text style={styles.reqNumber}>{request.requestNumber}</Text>
          <Text style={styles.reqType}>{request.requestType}</Text>
          {request.vehicleName ? (
            <View style={styles.vehicleChip}>
              <Feather name="truck" size={13} color="#f97316" />
              <Text style={styles.vehicleChipText}>
                {request.vehicleName}
                {request.vehicleRegistrationNumber ? ` (${request.vehicleRegistrationNumber})` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Details Card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <DetailRow icon="calendar" label="Date"
            value={request.isImmediate ? "Immediate (ASAP)"
              : request.preferredServiceDate ? formatDate(request.preferredServiceDate) : "—"} />
          <View style={styles.rowDivider} />
          <DetailRow icon="clock" label="Time"
            value={request.isImmediate ? "Dispatched immediately"
              : request.preferredServiceTime ? formatTime(request.preferredServiceTime.slice(0, 5)) : "—"} />
          {request.serviceSlot && (<>
            <View style={styles.rowDivider} />
            <DetailRow icon="layers" label="Slot" value={request.serviceSlot} />
          </>)}
          {request.serviceAddress ? (<>
            <View style={styles.rowDivider} />
            <DetailRow icon="map-pin" label="Service Address" value={request.serviceAddress} />
          </>) : null}
        </View>

        {/* ── Issue Description ──────────────────────────────────────── */}
        {request.description ? (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>
              <Feather name="file-text" size={13} color="#9ca3af" />{"  "}ISSUE DESCRIPTION
            </Text>
            <Text style={styles.descriptionText}>{request.description}</Text>
          </View>
        ) : null}

        {/* ── Photos ─────────────────────────────────────────────────── */}
        {request.imageUrls && request.imageUrls.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>
              <Feather name="image" size={13} color="#9ca3af" />{"  "}PHOTOS
            </Text>
            <View style={styles.photoRow}>
              {request.imageUrls.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={styles.photoThumb} resizeMode="cover" />
              ))}
            </View>
          </View>
        )}

        {/* ── Action Buttons ──────────────────────────────────────────── */}
        {!isTerminal && (
          <View style={styles.actionsRow}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCancelStep("reason")}
                activeOpacity={0.8}
              >
                <Feather name="x-circle" size={16} color="#dc2626" />
                <Text style={styles.cancelBtnText}>Cancel Request</Text>
              </TouchableOpacity>
            )}
            {showReschedule && (
              <TouchableOpacity
                style={styles.rescheduleBtn}
                onPress={() => setRescheduleVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="calendar" size={16} color="#ffffff" />
                <Text style={styles.rescheduleBtnText}>Reschedule</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Immediate notice — can't reschedule */}
        {request.isImmediate && !isTerminal && (
          <View style={styles.infoNote}>
            <Feather name="info" size={14} color="#2563eb" />
            <Text style={styles.infoNoteText}>
              Immediate requests cannot be rescheduled.
            </Text>
          </View>
        )}

        {/* Status-based hint */}
        {!showCancel && !isTerminal && (
          <View style={styles.infoNote}>
            <Feather name="info" size={14} color="#d97706" />
            <Text style={[styles.infoNoteText, { color: "#92400e" }]}>
              This request cannot be cancelled or rescheduled once the mechanic is on the way.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* ── Cancel Modal: Choose Reason ────────────────────────────────── */}
      <Modal visible={cancelStep === "reason"} transparent animationType="slide"
        onRequestClose={() => setCancelStep("idle")}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Why do you want to cancel?</Text>
              <TouchableOpacity onPress={() => setCancelStep("idle")}>
                <Feather name="x" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {CANCEL_REASONS.map((r) => (
              <TouchableOpacity key={r} style={styles.reasonRow}
                onPress={() => { setCancelReason(r); if (r !== "Other") setCancelOtherText(""); }}>
                <View style={[styles.radio, cancelReason === r && styles.radioActive]}>
                  {cancelReason === r && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.reasonText}>{r}</Text>
              </TouchableOpacity>
            ))}
            {cancelReason === "Other" && (
              <TextInput
                style={styles.otherInput}
                placeholder="Additional comments (Optional)"
                placeholderTextColor="#9ca3af"
                value={cancelOtherText}
                onChangeText={setCancelOtherText}
                multiline
              />
            )}
            <TouchableOpacity
              style={[styles.modalSubmitBtn, !cancelReason && { opacity: 0.5 }]}
              onPress={() => cancelReason && setCancelStep("confirm")}
              disabled={!cancelReason}
            >
              <Text style={styles.modalSubmitText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Cancel Modal: Confirm ──────────────────────────────────────── */}
      <Modal visible={cancelStep === "confirm"} transparent animationType="fade"
        onRequestClose={() => setCancelStep("reason")}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: "center" }]}>
            <View style={styles.confirmTrash}>
              <Feather name="trash-2" size={40} color="#dc2626" />
            </View>
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmSubtitle}>
              This action cannot be undone. Your request {request.requestNumber} will be cancelled.
            </Text>
            <TouchableOpacity
              style={[styles.confirmYesBtn, cancelLoading && { opacity: 0.7 }]}
              onPress={handleCancelSubmit}
              disabled={cancelLoading}
            >
              {cancelLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.confirmYesText}>Yes, Cancel Request</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmNoBtn}
              onPress={() => setCancelStep("reason")}>
              <Text style={styles.confirmNoText}>No, Keep It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Reschedule Bottom Sheet ────────────────────────────────────── */}
      <Modal visible={rescheduleVisible} transparent animationType="slide"
        onRequestClose={() => setRescheduleVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rescheduleCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reschedule Request</Text>
                <Text style={styles.modalSubtitle}>Pick a new date and time</Text>
              </View>
              <TouchableOpacity onPress={() => setRescheduleVisible(false)}>
                <Feather name="x" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>NEW DATE</Text>
            <DatePickerField
              value={rescheduleDate}
              onChange={setRescheduleDate}
              placeholder="Select new date"
              minDate={new Date()}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>NEW TIME</Text>
            <DigitalTimePickerField
              value={rescheduleTime}
              onChange={setRescheduleTime}
              date={rescheduleDate}
              slots={slots}
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { marginTop: 20 },
                (!rescheduleDate || !rescheduleTime || rescheduleLoading) && { opacity: 0.5 }]}
              onPress={handleRescheduleSubmit}
              disabled={!rescheduleDate || !rescheduleTime || rescheduleLoading}
            >
              {rescheduleLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalSubmitText}>Confirm Reschedule</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast visible={toastVisible} message={toastMessage} type={toastType}
        onHide={() => setToastVisible(false)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  backOverride: { marginTop: 0, marginBottom: 0 },
  scroll: { padding: 20, paddingBottom: 48 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },

  // Top card
  topCard: {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1.5, borderColor: "#e5e7eb", alignItems: "flex-start",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, marginBottom: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  reqNumber: { fontSize: 22, fontWeight: "bold", color: "#111827", letterSpacing: 0.5 },
  reqType: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  // Card
  card: {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1.5, borderColor: "#e5e7eb",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  cardSectionTitle: {
    fontSize: 11, fontWeight: "700", color: "#9ca3af",
    letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12,
  },
  rowDivider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 },

  // Detail row
  detailRow: { flexDirection: "row", alignItems: "flex-start" },
  detailIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: "#fff3eb",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: "700", color: "#9ca3af", letterSpacing: 0.4, marginBottom: 3 },
  detailValue: { fontSize: 14, color: "#111827", fontWeight: "600" },

  // Photos
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#f3f4f6" },

  // Action buttons
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  cancelBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#fca5a5", backgroundColor: "#fff",
  },
  cancelBtnText: { color: "#dc2626", fontWeight: "700", fontSize: 14 },
  rescheduleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: "#f97316",
    elevation: 3, shadowColor: "#f97316", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6,
  },
  rescheduleBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },

  // Info note
  infoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12,
    backgroundColor: "#eff6ff", borderRadius: 12, borderWidth: 1,
    borderColor: "#bfdbfe", marginBottom: 14,
  },
  infoNoteText: { flex: 1, fontSize: 13, color: "#1e40af", lineHeight: 18 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(17,24,39,0.5)", justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  rescheduleCard: {
    backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  // Cancel reasons
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: "#d1d5db", justifyContent: "center", alignItems: "center",
  },
  radioActive: { borderColor: "#f97316" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f97316" },
  reasonText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  otherInput: {
    borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14,
    minHeight: 80, textAlignVertical: "top", color: "#111827",
    fontSize: 14, marginTop: 8, marginBottom: 4,
  },
  modalSubmitBtn: {
    backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 16,
  },
  modalSubmitText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  // Cancel confirm
  confirmTrash: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: "#fef2f2",
    justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  confirmTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  confirmSubtitle: {
    fontSize: 14, color: "#6b7280", textAlign: "center",
    lineHeight: 21, marginBottom: 24,
  },
  confirmYesBtn: {
    width: "100%", backgroundColor: "#dc2626", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginBottom: 12,
  },
  confirmYesText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  confirmNoBtn: {
    width: "100%", borderWidth: 1.5, borderColor: "#e5e7eb",
    borderRadius: 14, paddingVertical: 14, alignItems: "center",
  },
  confirmNoText: { color: "#f97316", fontSize: 15, fontWeight: "700" },

  // Reschedule field label
  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: "#6b7280",
    letterSpacing: 0.5, marginBottom: 8,
  },

  // Done screen
  doneIcon: { marginBottom: 20 },
  doneTitle: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 10 },
  doneSubtitle: {
    fontSize: 14, color: "#6b7280", textAlign: "center",
    lineHeight: 21, marginBottom: 32, paddingHorizontal: 24,
  },
  donePrimaryBtn: {
    width: "80%", backgroundColor: "#f97316", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginBottom: 12,
    elevation: 4, shadowColor: "#f97316", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6,
  },
  donePrimaryText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  doneSecondaryBtn: {
    width: "80%", borderWidth: 1.5, borderColor: "#f97316",
    borderRadius: 14, paddingVertical: 14, alignItems: "center",
  },
  doneSecondaryText: { color: "#f97316", fontSize: 15, fontWeight: "700" },

  // Error
  errorText: { fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 12, marginBottom: 20 },
  retryBtn: {
    backgroundColor: "#f97316", paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12,
  },
  retryBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },

  vehicleChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(249, 115, 22, 0.1)", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 10, marginTop: 8,
  },
  vehicleChipText: { fontSize: 13, fontWeight: "600", color: "#f97316" },
  descriptionText: { fontSize: 14, color: "#374151", lineHeight: 21, marginTop: 8 },
});
