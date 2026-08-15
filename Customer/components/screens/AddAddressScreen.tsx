import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { addressService, AddressPayload, emptyAddressPayload, UserAddress } from '../../services/addressService';

interface AddAddressScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
  onSaveSuccess?: () => void;
  initialAddress?: UserAddress | null;
}

const { width } = Dimensions.get('window');

export default function AddAddressScreen({
  onNavigate,
  onBack,
  onSaveSuccess,
  initialAddress,
}: AddAddressScreenProps) {
  const [addressForm, setAddressForm] = useState<AddressPayload>(
    initialAddress 
      ? {
          label: initialAddress.label || 'Home',
          houseNumber: initialAddress.houseNumber || '',
          buildingName: initialAddress.buildingName || '',
          street: initialAddress.street || '',
          landmark: initialAddress.landmark || '',
          city: initialAddress.city || 'Noida',
          state: initialAddress.state || 'Uttar Pradesh',
          country: initialAddress.country || 'India',
          pincode: initialAddress.pincode || '201301',
          latitude: initialAddress.latitude,
          longitude: initialAddress.longitude,
          receiverName: initialAddress.receiverName || '',
          receiverPhoneNumber: initialAddress.receiverPhoneNumber || '',
        }
      : { 
          ...emptyAddressPayload, 
          city: 'Noida', 
          state: 'Uttar Pradesh', 
          country: 'India',
          pincode: '201301',
        }
  );
  const [selectedTag, setSelectedTag] = useState<string>(initialAddress?.label || 'Home');
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('SavedAddresses');
      }
    });
  };

  const handleFieldChange = (field: keyof AddressPayload, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!addressForm.houseNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your Flat / House / Shop Number.');
      return;
    }
    if (!addressForm.pincode.trim() || addressForm.pincode.trim().length < 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Pincode (e.g. 201301).');
      return;
    }

    setSaving(true);
    try {
      const payload: AddressPayload = {
        ...addressForm,
        label: selectedTag,
        houseNumber: addressForm.houseNumber.trim(),
        buildingName: addressForm.buildingName?.trim() || '',
        landmark: addressForm.landmark?.trim() || '',
        street: addressForm.street?.trim() || addressForm.landmark?.trim() || 'Sector 62',
        city: addressForm.city?.trim() || 'Noida',
        state: addressForm.state?.trim() || 'Uttar Pradesh',
        country: 'India',
        pincode: addressForm.pincode.trim(),
        receiverName: addressForm.receiverName?.trim() || '',
        receiverPhoneNumber: addressForm.receiverPhoneNumber?.trim() || '',
      };

      if (initialAddress?.id) {
        await addressService.updateAddress(initialAddress.id, payload);
      } else {
        await addressService.createAddress(payload);
      }

      Animated.timing(slideAnim, {
        toValue: width,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else if (onNavigate) {
          onNavigate('SavedAddresses');
        }
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          {/* Top Header */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="chevron-left" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {initialAddress?.id ? 'Edit Address' : 'Add New Address'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Address Label Selector (Home, Work, Other) */}
            <Text style={styles.sectionTitle}>ADDRESS TYPE / LABEL</Text>
            <View style={styles.tagsContainer}>
              {['Home', 'Work', 'Other'].map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagBtn, isActive && styles.tagBtnActive]}
                    onPress={() => setSelectedTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={tag === 'Home' ? 'home' : tag === 'Work' ? 'briefcase' : 'map-pin'}
                      size={16}
                      color={isActive ? '#ea580c' : '#64748b'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.tagBtnText, isActive && styles.tagBtnTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Address Details Fields */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>HOUSE & LOCATION DETAILS</Text>

            <View style={styles.inputGroup}>
              <Feather name="home" size={18} color="#ea580c" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="House / Flat / Plot No. *"
                placeholderTextColor="#94a3b8"
                value={addressForm.houseNumber}
                onChangeText={(val) => handleFieldChange('houseNumber', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Feather name="layers" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Building / Apartment / Society Name (Optional)"
                placeholderTextColor="#94a3b8"
                value={addressForm.buildingName || ''}
                onChangeText={(val) => handleFieldChange('buildingName', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Feather name="map-pin" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Street / Sector / Area (e.g. Sector 62)"
                placeholderTextColor="#94a3b8"
                value={addressForm.street || ''}
                onChangeText={(val) => handleFieldChange('street', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Feather name="compass" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Landmark (Optional e.g. Near Metro / Park)"
                placeholderTextColor="#94a3b8"
                value={addressForm.landmark || ''}
                onChangeText={(val) => handleFieldChange('landmark', val)}
              />
            </View>

            {/* City & Pincode Row */}
            <View style={styles.twoColRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#94a3b8"
                  value={addressForm.city || 'Noida'}
                  onChangeText={(val) => handleFieldChange('city', val)}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Pincode *"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={addressForm.pincode}
                  onChangeText={(val) => handleFieldChange('pincode', val)}
                />
              </View>
            </View>

            {/* Contact Person Details */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>CONTACT PERSON DETAILS</Text>

            <View style={styles.inputGroup}>
              <Feather name="user" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Receiver / Contact Name"
                placeholderTextColor="#94a3b8"
                value={addressForm.receiverName || ''}
                onChangeText={(val) => handleFieldChange('receiverName', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.phonePrefix}>+91</Text>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.input, { flex: 1, paddingLeft: 0 }]}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
                value={addressForm.receiverPhoneNumber || ''}
                onChangeText={(val) => handleFieldChange('receiverPhoneNumber', val)}
              />
            </View>
          </ScrollView>

          {/* Bottom Save Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.submitBtn, 
                (!addressForm.houseNumber.trim() || saving) && styles.submitBtnDisabled
              ]} 
              onPress={handleSave} 
              disabled={saving || !addressForm.houseNumber.trim()}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <View style={styles.btnRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.submitBtnText}>
                    {initialAddress?.id ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafc',
    zIndex: 200,
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
  backBtn: { 
    width: 38, 
    height: 38, 
    justifyContent: 'center', 
    borderRadius: 19, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#0f172a',
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 110,
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b', 
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  tagsContainer: { 
    flexDirection: 'row', 
    gap: 10,
  },
  tagBtn: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tagBtnActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  tagBtnText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748b',
  },
  tagBtnTextActive: { 
    color: '#ea580c', 
    fontWeight: '800',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1, 
    fontSize: 14, 
    color: '#0f172a',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  phonePrefix: { 
    fontSize: 14, 
    color: '#0f172a', 
    fontWeight: '700',
    marginRight: 8,
  },
  phoneDivider: { 
    width: 1, 
    height: 20, 
    backgroundColor: '#e2e8f0', 
    marginRight: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#fdba74',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
