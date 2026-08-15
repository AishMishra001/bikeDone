import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { addressService, UserAddress } from '../../services/addressService';

interface SavedAddressesScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
  onAddAddress?: () => void;
  onEditAddress?: (address: UserAddress) => void;
  isActive?: boolean;
  refreshTrigger?: number;
}

const { width } = Dimensions.get('window');

export default function SavedAddressesScreen({
  onNavigate,
  onBack,
  onAddAddress,
  onEditAddress,
  isActive = true,
  refreshTrigger = 0,
}: SavedAddressesScreenProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [deleting, setDeleting] = useState(false);

  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    fetchAddresses();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchAddresses();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (isActive) {
      fetchAddresses();
    }
  }, [isActive]);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('Profile');
      }
    });
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getMyAddresses();
      const sorted = [...data].sort((a, b) => Number(b.defaultAddress) - Number(a.defaultAddress));
      setAddresses(sorted);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    if (onAddAddress) {
      onAddAddress();
    } else if (onNavigate) {
      onNavigate('AddAddress');
    }
  };

  const handleEdit = () => {
    setOptionsVisible(false);
    if (selectedAddress) {
      if (onEditAddress) {
        onEditAddress(selectedAddress);
      } else if (onNavigate) {
        onNavigate('AddAddress', { address: selectedAddress });
      }
    }
  };

  const handleDeletePress = () => {
    setOptionsVisible(false);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAddress) return;
    setDeleting(true);
    try {
      await addressService.deleteAddress(selectedAddress.id);
      setDeleteModalVisible(false);
      setSelectedAddress(null);
      await fetchAddresses();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to delete address. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    try {
      await addressService.setDefaultAddress(addr.id);
      await fetchAddresses();
    } catch (e) {
      console.warn('Failed to set default address:', e);
    }
  };

  const openOptions = (addr: UserAddress) => {
    setSelectedAddress(addr);
    setOptionsVisible(true);
  };

  const getAddressIcon = (label: string) => {
    const l = (label || '').toLowerCase();
    if (l.includes('home')) return 'home';
    if (l.includes('work') || l.includes('office')) return 'briefcase';
    return 'map-pin';
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="chevron-left" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Addresses</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Add New Address Action Card */}
          <TouchableOpacity 
            style={styles.addBtnContainer} 
            onPress={handleAddNew}
            activeOpacity={0.8}
          >
            <View style={styles.addIconCircle}>
              <Feather name="plus" size={18} color="#ea580c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addBtnTitle}>Add New Address</Text>
              <Text style={styles.addBtnSub}>Save a home, work or breakdown spot</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ea580c" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>YOUR SAVED LOCATIONS</Text>

          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator color="#ea580c" size="large" />
              <Text style={styles.loaderText}>Loading addresses...</Text>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => (
                <View key={addr.id} style={styles.addressCard}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.addressIconBox, addr.defaultAddress && styles.addressIconBoxDefault]}>
                      <Feather 
                        name={getAddressIcon(addr.label)} 
                        size={18} 
                        color={addr.defaultAddress ? '#ea580c' : '#64748b'} 
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.cardCenter} 
                    onPress={() => handleSetDefault(addr)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.labelRow}>
                      <Text style={styles.addressLabel}>{addr.label || 'Saved Location'}</Text>
                      {addr.defaultAddress && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressDetails} numberOfLines={2}>
                      {addr.houseNumber ? `${addr.houseNumber}, ` : ''}
                      {addr.buildingName ? `${addr.buildingName}, ` : ''}
                      {addr.street ? `${addr.street}, ` : ''}
                      {addr.city || 'Noida'} {addr.pincode ? `- ${addr.pincode}` : ''}
                    </Text>
                    {addr.receiverPhoneNumber ? (
                      <Text style={styles.phoneText}>📞 {addr.receiverPhoneNumber}</Text>
                    ) : null}
                  </TouchableOpacity>

                  <View style={styles.cardRight}>
                    <TouchableOpacity 
                      style={styles.actionIconBtn} 
                      onPress={() => openOptions(addr)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="more-vert" size={22} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {addresses.length === 0 && (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="map-pin" size={28} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                  <Text style={styles.emptySub}>
                    Add your delivery or garage address for fast 1-tap bookings.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* 3-Dots Options Bottom Sheet */}
        <Modal 
          visible={optionsVisible} 
          transparent={true} 
          animationType="fade" 
          onRequestClose={() => setOptionsVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setOptionsVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.bottomSheet}>
                  <View style={styles.sheetHandle} />
                  {selectedAddress && (
                    <View style={styles.sheetHeader}>
                      <Text style={styles.sheetTitle}>{selectedAddress.label}</Text>
                      <Text style={styles.sheetSub} numberOfLines={1}>
                        {selectedAddress.houseNumber} {selectedAddress.street}, {selectedAddress.city}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetOption} onPress={handleEdit} activeOpacity={0.7}>
                      <View style={[styles.sheetIconBox, { backgroundColor: '#f0fdf4' }]}>
                        <Feather name="edit-2" size={18} color="#16a34a" />
                      </View>
                      <Text style={styles.sheetOptionText}>Edit Address Details</Text>
                      <Feather name="chevron-right" size={18} color="#94a3b8" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.sheetOption} onPress={handleDeletePress} activeOpacity={0.7}>
                      <View style={[styles.sheetIconBox, { backgroundColor: '#fee2e2' }]}>
                        <Feather name="trash-2" size={18} color="#dc2626" />
                      </View>
                      <Text style={[styles.sheetOptionText, { color: '#dc2626' }]}>Delete Address</Text>
                      <Feather name="chevron-right" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Delete Confirmation Modal Popup */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmCard}>
              <View style={styles.confirmIconCircle}>
                <Feather name="trash-2" size={28} color="#dc2626" />
              </View>
              <Text style={styles.confirmTitle}>Delete Address?</Text>
              <Text style={styles.confirmSub}>
                Are you sure you want to remove "{selectedAddress?.label || 'this address'}" from your saved locations?
              </Text>

              <View style={styles.confirmBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={deleting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteConfirmBtn}
                  onPress={handleConfirmDelete}
                  disabled={deleting}
                  activeOpacity={0.8}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.deleteConfirmBtnText}>Yes, Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafc',
    zIndex: 100,
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#0f172a',
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 40,
  },
  addBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 20,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnTitle: { 
    color: '#ea580c', 
    fontSize: 15, 
    fontWeight: '800',
  },
  addBtnSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b', 
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  addressList: { 
    gap: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: { 
    marginRight: 12,
  },
  addressIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressIconBoxDefault: {
    backgroundColor: '#fff7ed',
  },
  cardCenter: { 
    flex: 1,
  },
  labelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#0f172a',
  },
  defaultBadge: { 
    backgroundColor: '#dcfce7', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  defaultBadgeText: { 
    color: '#16a34a', 
    fontSize: 10, 
    fontWeight: '800',
  },
  addressDetails: { 
    fontSize: 12, 
    color: '#64748b', 
    lineHeight: 18,
  },
  phoneText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  cardRight: { 
    marginLeft: 8,
  },
  actionIconBtn: { 
    padding: 6,
  },
  loaderBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f172a', 
    marginBottom: 2,
  },
  sheetSub: { 
    fontSize: 12, 
    color: '#64748b',
  },
  sheetActions: { 
    paddingHorizontal: 20, 
    paddingTop: 10,
  },
  sheetOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12,
    gap: 12,
  },
  sheetIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionText: { 
    flex: 1,
    fontSize: 14, 
    fontWeight: '700', 
    color: '#0f172a',
  },
  divider: { 
    height: 1, 
    backgroundColor: '#f1f5f9', 
    marginLeft: 46,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  confirmSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  deleteConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
