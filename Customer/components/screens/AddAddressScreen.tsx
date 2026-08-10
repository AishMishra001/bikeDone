import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Animated, Dimensions, Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { addressService, AddressPayload, emptyAddressPayload, UserAddress } from '../../services/addressService';

interface AddAddressScreenProps {
  onNavigate: (screen: string) => void;
  initialAddress?: UserAddress | null;
}

export default function AddAddressScreen({ onNavigate, initialAddress }: AddAddressScreenProps) {
  const [addressForm, setAddressForm] = useState<AddressPayload>(
    initialAddress 
      ? { ...initialAddress, buildingName: initialAddress.buildingName || '', landmark: initialAddress.landmark || '' }
      : { ...emptyAddressPayload, country: 'India' }
  );
  const [selectedTag, setSelectedTag] = useState(initialAddress?.label || 'Home');
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onNavigate('SavedAddresses');
    });
  };

  const handleFieldChange = (field: keyof AddressPayload, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!addressForm.houseNumber.trim()) { alert('Please enter House/Flat Number'); return; }
    if (!addressForm.pincode.trim()) { alert('Please enter Pincode'); return; }
    
    setSaving(true);
    try {
      const payload: AddressPayload = {
        ...addressForm,
        label: selectedTag,
        city: addressForm.city || 'Seattle', // mock city if empty
        state: addressForm.state || 'WA',
        street: addressForm.street || 'Main Street',
      };
      
      if (initialAddress?.id) {
        await addressService.updateAddress(initialAddress.id, payload);
      } else {
        await addressService.createAddress(payload);
      }
      onNavigate('SavedAddresses');
    } catch (err: any) {
      alert('Failed to save address: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={true} transparent={true} animationType="none" onRequestClose={handleBack}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: slideAnim }], zIndex: 200, backgroundColor: '#fff' }]}>
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Address Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.addressPreviewBar}>
          <Text style={styles.addressPreviewText} numberOfLines={1}>
            {addressForm.street || 'Select location on map...'}
          </Text>
        </View>
        <View style={styles.dividerLine} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Add address</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="House No. & Floor"
              value={addressForm.houseNumber}
              onChangeText={(val) => handleFieldChange('houseNumber', val)}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Building & Block No. (Optional)"
              value={addressForm.buildingName}
              onChangeText={(val) => handleFieldChange('buildingName', val)}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Landmark & Area Name (Optional)"
              value={addressForm.landmark}
              onChangeText={(val) => handleFieldChange('landmark', val)}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Add address label</Text>
          <View style={styles.tagsContainer}>
            {['Home', 'Work', 'Other'].map(tag => {
              const isActive = selectedTag === tag;
              return (
                <TouchableOpacity 
                  key={tag} 
                  style={styles.tagBtn}
                  onPress={() => setSelectedTag(tag)}
                >
                  <Feather 
                    name={tag === 'Home' ? 'home' : tag === 'Work' ? 'briefcase' : 'map-pin'} 
                    size={16} 
                    color={isActive ? '#111827' : '#9ca3af'} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.tagBtnText, isActive && styles.tagBtnTextActive]}>{tag}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Receiver details</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Receiver's Name"
              value={addressForm.receiverName || ''}
              onChangeText={(val) => handleFieldChange('receiverName', val)}
              placeholderTextColor="#9ca3af"
            />
            <Feather name="book-open" size={18} color="#111827" />
          </View>

          <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={styles.phonePrefix}>+91</Text>
            <View style={styles.phoneDivider} />
            <TextInput
              style={[styles.input, { flex: 1, paddingLeft: 0, borderWidth: 0 }]}
              placeholder="Receiver's Phone Number"
              value={addressForm.receiverPhoneNumber || ''}
              onChangeText={(val) => handleFieldChange('receiverPhoneNumber', val)}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.submitBtn, (!addressForm.houseNumber.trim() || saving) && styles.submitBtnDisabled]} onPress={handleSave} disabled={saving || !addressForm.houseNumber.trim()}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>SAVE ADDRESS</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827' },
  addressPreviewBar: { paddingHorizontal: 20, paddingBottom: 16 },
  addressPreviewText: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  dividerLine: { height: 1, backgroundColor: '#e5e7eb', borderStyle: 'dashed', borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: 20 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#fff',
  },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  tagsContainer: { flexDirection: 'row', gap: 12 },
  tagBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tagBtnText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tagBtnTextActive: { color: '#111827', fontWeight: '700' },
  phonePrefix: { fontSize: 14, color: '#111827', fontWeight: '500' },
  phoneDivider: { width: 1, height: 20, backgroundColor: '#e5e7eb', marginHorizontal: 12 },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: '#f3e8ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#f3f4f6',
  },
  submitBtnText: { color: '#9333ea', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});
