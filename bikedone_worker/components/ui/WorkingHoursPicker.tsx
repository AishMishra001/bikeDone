import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/theme';

interface WorkingHoursPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

const START_TIMES = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '12:00 PM',
];

const END_TIMES = [
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
  '11:30 PM',
];

const PRESETS = [
  { label: '09:00 AM To 08:30 PM (Mon - Sat)', open: '09:00 AM', close: '08:30 PM', days: 'Mon - Sat' },
  { label: '10:00 AM To 08:00 PM (Mon - Sat)', open: '10:00 AM', close: '08:00 PM', days: 'Mon - Sat' },
  { label: '08:00 AM To 09:00 PM (All 7 Days)', open: '08:00 AM', close: '09:00 PM', days: 'All Days' },
  { label: '24 Hours Open (Emergency)', open: '12:00 AM', close: '11:59 PM', days: 'All Days' },
];

const DAYS_OPTIONS = [
  { id: 'Mon - Sat', label: 'Mon - Sat (6 Days)' },
  { id: 'All Days', label: 'All 7 Days' },
  { id: 'Mon - Fri', label: 'Mon - Fri (5 Days)' },
];

export const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({
  value = '09:00 AM To 08:30 PM (Mon - Sat)',
  onChange,
}) => {
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('08:30 PM');
  const [selectedDays, setSelectedDays] = useState('Mon - Sat');
  const [modalType, setModalType] = useState<'open' | 'close' | null>(null);

  // Initialize or sync from string
  useEffect(() => {
    if (value) {
      if (value.includes('24 Hours')) {
        setOpenTime('12:00 AM');
        setCloseTime('11:59 PM');
        setSelectedDays('All Days');
        return;
      }
      const match = value.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:To|-)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      if (match) {
        setOpenTime(match[1].trim());
        setCloseTime(match[2].trim());
      }
      if (value.includes('All Days') || value.includes('All 7')) {
        setSelectedDays('All Days');
      } else if (value.includes('Mon - Fri')) {
        setSelectedDays('Mon - Fri');
      } else {
        setSelectedDays('Mon - Sat');
      }
    }
  }, []);

  const updateWorkingHours = (newOpen: string, newClose: string, newDays: string) => {
    let formatted = `${newOpen} To ${newClose} (${newDays})`;
    if (newOpen === '12:00 AM' && newClose === '11:59 PM') {
      formatted = '24 Hours Open (All Days)';
    }
    onChange(formatted);
  };

  const handleSelectOpenTime = (time: string) => {
    setOpenTime(time);
    setModalType(null);
    updateWorkingHours(time, closeTime, selectedDays);
  };

  const handleSelectCloseTime = (time: string) => {
    setCloseTime(time);
    setModalType(null);
    updateWorkingHours(openTime, time, selectedDays);
  };

  const handleSelectDays = (days: string) => {
    setSelectedDays(days);
    updateWorkingHours(openTime, closeTime, days);
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setOpenTime(preset.open);
    setCloseTime(preset.close);
    setSelectedDays(preset.days);
    onChange(preset.label);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Garage Working Hours *</Text>
      <Text style={styles.subLabel}>Tap opening & closing time slots or select a preset</Text>

      {/* Selected Time Display Card */}
      <View style={[styles.card, Shadows.small]}>
        <View style={styles.timeRow}>
          {/* Open Time Selector */}
          <TouchableOpacity
            style={styles.timeBox}
            activeOpacity={0.8}
            onPress={() => setModalType('open')}
          >
            <View style={styles.timeHeader}>
              <Ionicons name="sunny-outline" size={16} color={Colors.primary} />
              <Text style={styles.timeBoxLabel}>Opening Time</Text>
            </View>
            <View style={styles.timeValWrapper}>
              <Text style={styles.timeValText}>{openTime}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.dividerArrow}>
            <Ionicons name="arrow-forward" size={18} color={Colors.gray400} />
          </View>

          {/* Close Time Selector */}
          <TouchableOpacity
            style={styles.timeBox}
            activeOpacity={0.8}
            onPress={() => setModalType('close')}
          >
            <View style={styles.timeHeader}>
              <Ionicons name="moon-outline" size={16} color="#6366f1" />
              <Text style={styles.timeBoxLabel}>Closing Time</Text>
            </View>
            <View style={styles.timeValWrapper}>
              <Text style={styles.timeValText}>{closeTime}</Text>
              <Ionicons name="chevron-down" size={16} color="#6366f1" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Working Days Row */}
        <View style={styles.daysSection}>
          <Text style={styles.daysSectionTitle}>Working Days:</Text>
          <View style={styles.daysRow}>
            {DAYS_OPTIONS.map((d) => {
              const active = selectedDays === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => handleSelectDays(d.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Presets */}
        <View style={styles.presetSection}>
          <Text style={styles.presetTitle}>Quick Select Presets:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetScroll}
          >
            {PRESETS.map((p, idx) => {
              const isActive = openTime === p.open && closeTime === p.close && selectedDays === p.days;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => handleApplyPreset(p)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isActive ? 'checkmark-circle' : 'time-outline'}
                    size={14}
                    color={isActive ? Colors.primaryDark : Colors.gray600}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>
                    {p.open} - {p.close} ({p.days})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={modalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <TouchableWithoutFeedback onPress={() => setModalType(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={modalType === 'open' ? 'sunny-outline' : 'moon-outline'}
                      size={22}
                      color={modalType === 'open' ? Colors.primary : '#6366f1'}
                    />
                    <Text style={styles.modalTitle}>
                      Select {modalType === 'open' ? 'Opening' : 'Closing'} Time
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalType(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={Colors.textDark} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.slotGrid}>
                    {(modalType === 'open' ? START_TIMES : END_TIMES).map((time) => {
                      const isCurrent = modalType === 'open' ? openTime === time : closeTime === time;
                      return (
                        <TouchableOpacity
                          key={time}
                          style={[styles.slotItem, isCurrent && styles.slotItemActive]}
                          onPress={() =>
                            modalType === 'open' ? handleSelectOpenTime(time) : handleSelectCloseTime(time)
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={isCurrent ? Colors.primary : Colors.gray500}
                          />
                          <Text style={[styles.slotItemText, isCurrent && styles.slotItemTextActive]}>
                            {time}
                          </Text>
                          {isCurrent ? (
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBox: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  timeBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray600,
    textTransform: 'uppercase',
  },
  timeValWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeValText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  dividerArrow: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  daysSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  dayChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
  dayChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  presetSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray600,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  presetScroll: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  presetChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    color: Colors.gray700,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  slotGrid: {
    gap: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.lightBackground,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  slotItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  slotItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginLeft: 10,
  },
  slotItemTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
