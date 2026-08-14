import React from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = ({ children, coordinate }: any) => {
  return null; // Markers handled by iframe
};

export const MapView = ({ children, style, initialRegion }: any) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
  const lat = initialRegion?.latitude || 28.5813412;
  const lng = initialRegion?.longitude || 77.3399905;

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=14`}
      ></iframe>
    </View>
  );
};

export default MapView;
