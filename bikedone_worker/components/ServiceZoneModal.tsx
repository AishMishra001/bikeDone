import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { isWithinNoidaServiceZone, NOIDA_SECTORS_SUMMARY, LocationCoords } from '@/utils/geoUtils';
import { omsApi } from '@/services/api';

interface ServiceZoneModalProps {
  visible: boolean;
  coords: LocationCoords | null;
  onDismiss: () => void;
  onRefreshGps?: () => void;
}

export function ServiceZoneModal({
  visible,
  coords,
  onDismiss,
  onRefreshGps,
}: ServiceZoneModalProps) {
  const zoneStatus = isWithinNoidaServiceZone(coords);
  const [activeZones, setActiveZones] = useState<string[]>(NOIDA_SECTORS_SUMMARY);

  useEffect(() => {
    if (visible) {
      omsApi.get<any[]>('/serviceability/zones')
        .then((zones) => {
          if (Array.isArray(zones) && zones.length > 0) {
            const formatted = zones.map(
              (z) => `${z.areaName || z.city} (PIN: ${z.pincode})`
            );
            setActiveZones(formatted);
          }
        })
        .catch(() => {});
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={[styles.iconCircle, { backgroundColor: zoneStatus.isServiceable ? '#DCFCE7' : '#FEF3C7' }]}>
                <Ionicons
                  name={zoneStatus.isServiceable ? 'shield-checkmark' : 'alert-circle'}
                  size={22}
                  color={zoneStatus.isServiceable ? '#16A34A' : '#D97706'}
                />
              </View>
              <View>
                <Text style={styles.titleText}>MyKaarigar Service Zone</Text>
                <Text style={styles.subtitleText}>Noida & Greater Noida Region</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Current GPS Zone Status Card */}
            <View style={[styles.statusCard, zoneStatus.isServiceable ? styles.statusCardOnline : styles.statusCardOffline]}>
              <View style={styles.statusRow}>
                <Ionicons
                  name={zoneStatus.isServiceable ? 'checkmark-circle' : 'warning'}
                  size={20}
                  color={zoneStatus.isServiceable ? '#16A34A' : '#DC2626'}
                />
                <Text style={[styles.statusTitle, { color: zoneStatus.isServiceable ? '#16A34A' : '#DC2626' }]}>
                  {zoneStatus.isServiceable ? 'You are in Active Service Zone' : 'Outside Operational Zone'}
                </Text>
              </View>
              <Text style={styles.statusDesc}>
                {coords
                  ? `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} • ${zoneStatus.message}`
                  : 'Acquiring GPS location...'}
              </Text>
            </View>

            {/* Operational Zones Details */}
            <Text style={styles.sectionHeading}>Active Coverage Hubs</Text>
            <View style={styles.zonesList}>
              {NOIDA_SECTORS_SUMMARY.map((sec, idx) => (
                <View key={idx} style={styles.zoneItem}>
                  <View style={styles.zoneDot} />
                  <Text style={styles.zoneText}>{sec}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
              <Text style={styles.infoText}>
                Mechanics located within Noida & Greater Noida receive high-priority breakdown dispatches from nearby customers.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {onRefreshGps && (
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefreshGps}>
                <Ionicons name="refresh" size={18} color={Colors.primary} />
                <Text style={styles.refreshBtnText}>Sync GPS</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.primaryBtn} onPress={onDismiss}>
              <Text style={styles.primaryBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 14,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  bodyScroll: {
    marginBottom: 16,
  },
  statusCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  statusCardOnline: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusCardOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  zonesList: {
    gap: 8,
    marginBottom: 16,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  zoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
