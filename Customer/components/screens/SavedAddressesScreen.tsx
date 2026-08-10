import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, SafeAreaView, Modal, TouchableWithoutFeedback, Animated, Dimensions
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { addressService, UserAddress } from '../../services/addressService';

interface SavedAddressesScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  isActive?: boolean;
}

export default function SavedAddressesScreen({ onNavigate, isActive = true }: SavedAddressesScreenProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    fetchAddresses();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchAddresses();
    }
  }, [isActive]);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onNavigate('Profile');
    });
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getMyAddresses();
      const sorted = [...data].sort((a, b) => Number(b.defaultAddress) - Number(a.defaultAddress));
      setAddresses(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setOptionsVisible(false);
    if (selectedAddress) {
      onNavigate('AddAddress', { address: selectedAddress });
    }
  };

  const handleDelete = async () => {
    if (selectedAddress) {
      setOptionsVisible(false);
      setLoading(true);
      try {
        await addressService.deleteAddress(selectedAddress.id);
        await fetchAddresses();
      } catch (err: any) {
        alert('Failed to delete address.');
        setLoading(false);
      }
    }
  };

  const openOptions = (addr: UserAddress) => {
    setSelectedAddress(addr);
    setOptionsVisible(true);
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return 'home';
    if (l.includes('work') || l.includes('office')) return 'briefcase';
    return 'map-pin';
  };

  return (
    <Modal visible={true} transparent={true} animationType="none" onRequestClose={handleBack}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: slideAnim }], zIndex: 100, backgroundColor: '#f9fafb' }]}>
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addBtnContainer} onPress={() => onNavigate('AddAddress')}>
          <Feather name="plus" size={20} color="#db2777" style={{ marginRight: 12 }} />
          <Text style={styles.addBtnText}>Add New Address</Text>
          <View style={{ flex: 1 }} />
          <Feather name="chevron-right" size={20} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Saved Addresses</Text>

        {loading ? (
          <ActivityIndicator color="#db2777" size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => (
              <View key={addr.id} style={styles.addressCard}>
                <View style={styles.cardLeft}>
                  <Feather name={getAddressIcon(addr.label)} size={20} color="#111827" style={{ marginTop: 2 }} />
                </View>
                
                <View style={styles.cardCenter}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.defaultAddress && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressDetails} numberOfLines={2}>
                    {addr.houseNumber} {addr.buildingName ? addr.buildingName + ', ' : ''}
                    {addr.street}, {addr.city}
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <TouchableOpacity style={styles.actionIconBtn}>
                    <Feather name="share" size={20} color="#4b5563" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => openOptions(addr)}>
                    <MaterialIcons name="more-vert" size={24} color="#4b5563" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {addresses.length === 0 && (
              <Text style={styles.emptyText}>No saved addresses found.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Options Bottom Sheet */}
      <Modal visible={optionsVisible} transparent={true} animationType="slide" onRequestClose={() => setOptionsVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setOptionsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                {selectedAddress && (
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>{selectedAddress.label}</Text>
                    <Text style={styles.sheetSub} numberOfLines={1}>
                      {selectedAddress.houseNumber} {selectedAddress.street}, {selectedAddress.city}
                    </Text>
                  </View>
                )}
                
                <View style={styles.sheetActions}>
                  <TouchableOpacity style={styles.sheetOption} onPress={handleEdit}>
                    <Feather name="edit-2" size={20} color="#111827" style={{ marginRight: 16 }} />
                    <Text style={styles.sheetOptionText}>Edit</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity style={styles.sheetOption} onPress={handleDelete}>
                    <Feather name="trash-2" size={20} color="#dc2626" style={{ marginRight: 16 }} />
                    <Text style={[styles.sheetOptionText, { color: '#dc2626' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 16 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  addBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fce7f3',
    marginBottom: 24,
  },
  addBtnText: { color: '#db2777', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  addressList: { gap: 12 },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardLeft: { marginRight: 16 },
  cardCenter: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  addressLabel: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginRight: 8 },
  selectedBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  selectedBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: '600' },
  addressDetails: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  cardRight: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginLeft: 8 },
  actionIconBtn: { padding: 4 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: '#6b7280' },
  sheetActions: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#fff' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  sheetOptionText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 36 },
});
