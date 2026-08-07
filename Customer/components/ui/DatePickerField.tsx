import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DatePickerFieldProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: Date;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DatePickerField({
  value,
  onChange,
  placeholder = "Select booking date",
  minDate,
}: DatePickerFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Normalized minimum date (default: today at 00:00:00)
  const today = useMemo(() => {
    const d = minDate ? new Date(minDate) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  // Initial view month based on selected value or today
  const initialViewDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date(today);
  }, [value, today]);

  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  const handleOpen = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        setViewYear(date.getFullYear());
        setViewMonth(date.getMonth());
      }
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    // Prevent navigating to months prior to minDate's month
    if (
      viewYear < today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth <= today.getMonth())
    ) {
      return;
    }
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const canGoPrev = useMemo(() => {
    return (
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth())
    );
  }, [viewYear, viewMonth, today]);

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number | null;
      dateStr: string | null;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Leading empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        isDisabled: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Days of the month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      const y = cellDate.getFullYear();
      const m = String(cellDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const formatted = `${y}-${m}-${dayStr}`;

      const isDisabled = cellDate.getTime() < today.getTime();
      const isToday = cellDate.getTime() === today.getTime();
      const isSelected = value === formatted;

      days.push({
        dayNumber: d,
        dateStr: formatted,
        isDisabled,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, today, value]);

  const selectDate = (dateStr: string) => {
    onChange(dateStr);
    setModalVisible(false);
  };

  const handleSelectQuickDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${dayStr}`;
    selectDate(formatted);
  };

  // Format display text
  const displayFormattedDate = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
    const [y, m, d] = value.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return value;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [value]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.inputButton, value ? styles.inputButtonActive : null]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.inputText : styles.placeholderText}>
          {value ? displayFormattedDate : placeholder}
        </Text>
        <Feather
          name="calendar"
          size={18}
          color={value ? "#f97316" : "#9ca3af"}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select Booking Date</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Quick Select Pills */}
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickPill}
                onPress={() => handleSelectQuickDate(0)}
              >
                <Text style={styles.quickPillText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPill}
                onPress={() => handleSelectQuickDate(1)}
              >
                <Text style={styles.quickPillText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPill}
                onPress={() => handleSelectQuickDate(2)}
              >
                <Text style={styles.quickPillText}>In 2 Days</Text>
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                disabled={!canGoPrev}
                style={[
                  styles.navBtn,
                  !canGoPrev && styles.navBtnDisabled,
                ]}
              >
                <Feather
                  name="chevron-left"
                  size={20}
                  color={canGoPrev ? "#111827" : "#d1d5db"}
                />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                <Feather name="chevron-right" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View style={styles.weekHeader}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (!item.dayNumber) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    style={[
                      styles.dayCell,
                      item.isSelected && styles.dayCellSelected,
                      item.isToday && !item.isSelected && styles.dayCellToday,
                    ]}
                    disabled={item.isDisabled}
                    onPress={() => item.dateStr && selectDate(item.dateStr)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        item.isDisabled && styles.dayTextDisabled,
                        item.isSelected && styles.dayTextSelected,
                        item.isToday && !item.isSelected && styles.dayTextToday,
                      ]}
                    >
                      {item.dayNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Notice */}
            <View style={styles.footerNote}>
              <Feather name="info" size={13} color="#9ca3af" />
              <Text style={styles.footerNoteText}>
                Past dates are disabled for service booking.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputButtonActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  inputText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  placeholderText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  navBtnDisabled: {
    backgroundColor: "#f3f4f6",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    borderRadius: 999,
  },
  dayCellSelected: {
    backgroundColor: "#f97316",
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: "#f97316",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
  },
  dayTextDisabled: {
    color: "#d1d5db",
    textDecorationLine: "line-through",
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  dayTextToday: {
    color: "#ea580c",
    fontWeight: "700",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  footerNoteText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
