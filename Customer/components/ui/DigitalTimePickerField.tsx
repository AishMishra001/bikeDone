import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ServiceSlot } from "../../services/vehicleService";

interface DigitalTimePickerFieldProps {
  value: string;      // HH:mm 24-hour, e.g. "09:00"
  onChange: (time: string) => void;
  date: string;       // YYYY-MM-DD
  slots: ServiceSlot[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

/** Format a 24-hour "HH:mm" string to a readable "9:00 AM" label */
const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${pad(m)} ${suffix}`;
};

const toDateTime = (date: string, time: string): Date | null => {
  if (!date || !time) return null;
  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);
  if (dateParts.length < 3 || timeParts.length < 2) return null;
  const [y, mo, d] = dateParts;
  const [h, m] = timeParts;
  return new Date(y, mo - 1, d, h, m, 0, 0);
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Time picker that renders slots exactly as returned by the API.
 * No client-side interval generation — the server owns the slot list.
 * Slots that are less than 30 minutes from now are shown as disabled.
 */
export default function DigitalTimePickerField({
  value,
  onChange,
  date,
  slots,
}: DigitalTimePickerFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Earliest allowed booking time: now + 30 minutes
  const earliestAllowed = useMemo(
    () => new Date(Date.now() + 30 * 60 * 1000),
    // Recalculate when the modal opens so it stays fresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalVisible],
  );

  const isDisabled = (slotTime: string | undefined): boolean => {
    if (!date || !slotTime) return true;
    const dt = toDateTime(date, slotTime);
    if (!dt) return true;
    return dt.getTime() < earliestAllowed.getTime();
  };

  const handleSelect = (slotTime: string) => {
    if (isDisabled(slotTime)) return;
    onChange(slotTime);
    setModalVisible(false);
  };

  const displayLabel = value ? formatTime(value) : null;

  return (
    <View>
      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.inputButton, !!value && styles.inputButtonActive]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={value ? styles.inputText : styles.placeholderText}>
            {displayLabel ?? "Select preferred time"}
          </Text>
          <Text style={styles.helperText}>
            {slots.length} time slots available · tap to pick
          </Text>
        </View>
        <Feather
          name="clock"
          size={19}
          color={value ? "#f97316" : "#9ca3af"}
        />
      </TouchableOpacity>

      {/* ── Bottom-sheet modal ──────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          {/* Stop propagation so tapping inside the card doesn't close it */}
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Choose a time</Text>
                <Text style={styles.subtitle}>
                  {date
                    ? "Times earlier than 30 min from now are unavailable"
                    : "Please select a date first"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Slot grid */}
            <ScrollView
              contentContainerStyle={styles.timeGrid}
              showsVerticalScrollIndicator={false}
            >
              {slots.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="clock" size={32} color="#d1d5db" />
                  <Text style={styles.emptyText}>No slots available</Text>
                </View>
              ) : (
                slots.map((slot) => {
                  const disabled = isDisabled(slot.slotTime);
                  const selected = value === slot.slotTime;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={disabled}
                      style={[
                        styles.timeOption,
                        selected && styles.timeOptionSelected,
                        disabled && styles.timeOptionDisabled,
                      ]}
                      onPress={() => handleSelect(slot.slotTime)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selected && styles.timeTextSelected,
                          disabled && styles.timeTextDisabled,
                        ]}
                      >
                        {slot.slotName}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Trigger
  inputButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 15,
  },
  inputButtonActive: {
    borderColor: "#f97316",
    backgroundColor: "#fffbf5",
  },
  inputText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  helperText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 3,
  },

  // Modal backdrop
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "flex-end",
  },

  // Bottom sheet card
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: "78%",
  },

  // Header row
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },

  // Slot grid (3-per-row wrap)
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 12,
  },

  // Individual slot pill
  timeOption: {
    width: "30%" as any,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  timeOptionSelected: {
    borderColor: "#f97316",
    backgroundColor: "#fff3eb",
  },
  timeOptionDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  timeText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  timeTextSelected: {
    color: "#ea580c",
  },
  timeTextDisabled: {
    color: "#d1d5db",
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});
