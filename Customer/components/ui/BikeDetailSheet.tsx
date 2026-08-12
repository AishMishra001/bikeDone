import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { vehicleService, CustomerVehicle, UpdateBikePayload } from '../../services/vehicleService';
import InputField from './InputField';
import PrimaryButton from './PrimaryButton';
import Toast, { ToastType } from './Toast';
import ConfirmModal from './ConfirmModal';

// ─── Props ────────────────────────────────────────────────────────────────────
interface BikeDetailSheetProps {
  bike: CustomerVehicle | null;
  visible: boolean;
  onClose: () => void;
  onUpdated: (updated: CustomerVehicle) => void;
  onDeleted: (vehicleId: string) => void;
}

type SheetMode = 'view' | 'edit';

export default function BikeDetailSheet({
  bike,
  visible,
  onClose,
  onUpdated,
  onDeleted,
}: BikeDetailSheetProps) {
  const slideAnim = useRef(new Animated.Value(600)).current;

  // ── Sheet mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<SheetMode>('view');

  // ── Edit fields ─────────────────────────────────────────────────────────────
  const [color, setColor] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState('');
  const [odometerKm, setOdometerKm] = useState('');

  // ── Validation ──────────────────────────────────────────────────────────────
  const [yearError, setYearError] = useState('');
  const [odometerError, setOdometerError] = useState('');

  // ── Loading ─────────────────────────────────────────────────────────────────
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Delete confirm modal ─────────────────────────────────────────────────────
  const [confirmVisible, setConfirmVisible] = useState(false);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('error');

  const showToast = (msg: string, type: ToastType = 'error') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // ── Populate fields when bike changes ───────────────────────────────────────
  useEffect(() => {
    if (bike) {
      setColor(bike.color ?? '');
      setManufacturingYear(bike.manufacturingYear ? String(bike.manufacturingYear) : '');
      setOdometerKm(String(bike.odometerKm));
      setMode('view');
      setYearError('');
      setOdometerError('');
    }
  }, [bike]);

  // ── Slide animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ── Validate edit form ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;

    const odoNum = parseInt(odometerKm, 10);
    if (!odometerKm.trim() || isNaN(odoNum) || odoNum < 0) {
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
      setYearError('Manufacturing year is required.');
      valid = false;
    }

    return valid;
  };

  // ── Save update ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!bike || !validate()) return;
    setSavingUpdate(true);
    try {
      const payload: UpdateBikePayload = {
        color: color.trim(),
        manufacturingYear: parseInt(manufacturingYear, 10),
        odometerKm: parseInt(odometerKm, 10),
      };
      const updated = await vehicleService.updateVehicle(bike.id, payload);
      onUpdated(updated);
      showToast('Bike details updated successfully!', 'success');
      setMode('view');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update bike. Please try again.', 'error');
    } finally {
      setSavingUpdate(false);
    }
  };

  // ── Set default ─────────────────────────────────────────────────────────────
  const handleSetDefault = async () => {
    if (!bike || bike.isDefault) return;
    setSettingDefault(true);
    try {
      const updated = await vehicleService.setDefaultVehicle(bike.id);
      onUpdated(updated);
      showToast(`${bike.brandName} ${bike.modelName} set as default bike!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to set default bike.', 'error');
    } finally {
      setSettingDefault(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!bike) return;
    setConfirmVisible(false);
    setDeleting(true);
    try {
      await vehicleService.deleteVehicle(bike.id);
      onDeleted(bike.id);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove bike.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!bike) return null;

  const vehicleLabel = bike.itemCode === 'CAR' ? 'Car' : bike.itemCode === 'SCOOTY' ? 'Scooty' : 'Bike';
  const vehicleEmoji = bike.itemCode === 'CAR' ? '🚗' : bike.itemCode === 'SCOOTY' ? '🛵' : '🏍️';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Toast sits above everything */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        visible={confirmVisible}
        title={`Remove ${vehicleLabel}?`}
        message={`Are you sure you want to remove ${bike.brandName} ${bike.modelName} (${bike.registrationNumber})? This action cannot be undone.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        confirmDestructive
        icon="trash-2"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />

      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.bikeIconCircle}>
              <Text style={{ fontSize: 20 }}>{vehicleEmoji}</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{bike.brandName} {bike.modelName}</Text>
              <Text style={styles.headerReg}>{bike.registrationNumber}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Default badge */}
        {bike.isDefault && (
          <View style={styles.defaultBanner}>
            <Feather name="star" size={13} color="#f97316" />
            <Text style={styles.defaultBannerText}>This is your default {vehicleLabel.toLowerCase()}</Text>
          </View>
        )}

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'view' ? (
            /* ── VIEW MODE ─────────────────────────────────────────────────── */
            <>
              {/* Info rows */}
              <View style={styles.infoCard}>
                {[
                  { label: 'Type', value: vehicleLabel, icon: 'shield' },
                  { label: 'Brand', value: bike.brandName, icon: 'tag' },
                  { label: 'Model', value: bike.modelName, icon: 'cpu' },
                  { label: 'Color', value: bike.color || '—', icon: 'droplet' },
                  { label: 'Year', value: bike.manufacturingYear ? String(bike.manufacturingYear) : '—', icon: 'calendar' },
                  { label: 'Odometer', value: `${bike.odometerKm.toLocaleString()} km`, icon: 'activity' },
                ].map((row, i, arr) => (
                  <View key={row.label} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
                    <Feather name={row.icon as any} size={15} color="#9ca3af" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <TouchableOpacity style={styles.actionBtn} onPress={() => setMode('edit')}>
                <Feather name="edit-2" size={16} color="#f97316" />
                <Text style={styles.actionBtnText}>Edit {vehicleLabel} Details</Text>
                <Feather name="chevron-right" size={16} color="#d1d5db" />
              </TouchableOpacity>

              {!bike.isDefault && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleSetDefault}
                  disabled={settingDefault}
                >
                  {settingDefault ? (
                    <ActivityIndicator size="small" color="#f97316" />
                  ) : (
                    <Feather name="star" size={16} color="#f97316" />
                  )}
                  <Text style={styles.actionBtnText}>Set as Default {vehicleLabel}</Text>
                  <Feather name="chevron-right" size={16} color="#d1d5db" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Feather name="trash-2" size={16} color="#ef4444" />
                )}
                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Remove {vehicleLabel}</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── EDIT MODE ─────────────────────────────────────────────────── */
            <>
              <Text style={styles.editHeading}>Edit {vehicleLabel} Details</Text>

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Manufacturing Year</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <InputField
                  iconName="calendar"
                  placeholder="e.g. 2022"
                  value={manufacturingYear}
                  onChangeText={(t) => { setManufacturingYear(t); setYearError(''); }}
                  keyboardType="numeric"
                  maxLength={4}
                />
                {yearError ? <Text style={styles.fieldError}>{yearError}</Text> : null}
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Odometer (km)</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <InputField
                  iconName="activity"
                  placeholder="e.g. 15000"
                  value={odometerKm}
                  onChangeText={(t) => { setOdometerKm(t); setOdometerError(''); }}
                  keyboardType="numeric"
                />
                {odometerError ? <Text style={styles.fieldError}>{odometerError}</Text> : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Color <Text style={styles.optional}>(Optional)</Text>
                </Text>
                <InputField
                  iconName="droplet"
                  placeholder="e.g. Matte Black"
                  value={color}
                  onChangeText={setColor}
                />
              </View>

              <PrimaryButton title="Save Changes" onPress={handleSave} loading={savingUpdate} />

              <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setMode('view')}>
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bikeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff3eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerReg: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Default banner ───────────────────────────────────────────────────────────
  defaultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff3eb',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  defaultBannerText: {
    fontSize: 12,
    color: '#ea580c',
    fontWeight: '600',
  },

  // ── Body ─────────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 8,
  },

  // ── Info card (view mode) ────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoIcon: {
    marginRight: 10,
    width: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  // ── Action buttons (view mode) ───────────────────────────────────────────────
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff9f5',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  actionBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  deleteBtn: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
    marginTop: 4,
  },
  deleteBtnText: {
    color: '#ef4444',
  },

  // ── Edit mode ────────────────────────────────────────────────────────────────
  editHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
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
  optional: {
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
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cancelEditBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelEditText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
});
