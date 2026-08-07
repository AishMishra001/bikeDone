import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/theme';

interface MapPickerMockProps {
  onSelectLocation?: (address: string) => void;
  currentAddress?: string;
}

export const MapPickerMock: React.FC<MapPickerMockProps> = ({
  currentAddress = '123, Sharma Market, Laxmi Nagar, Delhi - 110092',
}) => {
  const [selected, setSelected] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select on Map</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelected(!selected)}
        style={styles.mapCard}
      >
        <Image
          source={{
            uri: 'https://maps.googleapis.com/maps/api/staticmap?center=28.6304,77.2777&zoom=14&size=600x300&sensor=false&key=AIzaSyA',
          }}
          style={styles.mapImage}
          defaultSource={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
          }}
        />

        {/* Central Red Marker Pin matching step 7 screenshot */}
        <View style={styles.pinOverlay}>
          <View style={[styles.pinBadge, Shadows.medium]}>
            <Ionicons name="location" size={28} color="#EF4444" />
          </View>
        </View>

        <View style={styles.addressTag}>
          <Ionicons name="compass-outline" size={16} color={Colors.primary} />
          <Text style={styles.addressTagText} numberOfLines={1}>
            {currentAddress}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  mapCard: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
});
