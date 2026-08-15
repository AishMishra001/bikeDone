import React from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = ({ children, coordinate, title }: any) => {
  return <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
};

export const Polyline = ({ coordinates, strokeColor = '#f97316', strokeWidth = 4, lineDashPattern }: any) => {
  return null; // Rendered by MapView SVG layer
};

export const MapView = ({ children, style, initialRegion, region }: any) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
  const currentRegion = region || initialRegion;
  const centerLat = currentRegion?.latitude || 28.5813412;
  const centerLng = currentRegion?.longitude || 77.3399905;
  const latDelta = currentRegion?.latitudeDelta || 0.02;
  const lngDelta = currentRegion?.longitudeDelta || 0.02;

  const childArray = React.Children.toArray(children);
  const polylines = childArray.filter((c: any) => React.isValidElement(c) && (c.type === Polyline || (c.props as any)?.coordinates));
  const markers = childArray.filter((c: any) => React.isValidElement(c) && (c.type === Marker || (c.props as any)?.coordinate));

  return (
    <View style={[style, { overflow: 'hidden', position: 'relative' }]}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, pointerEvents: 'none' }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${centerLat},${centerLng}&zoom=14`}
      />

      {/* SVG Polyline Route Layer */}
      {polylines.map((poly: any, idx: number) => {
        const coords = (poly.props as any)?.coordinates || [];
        if (!Array.isArray(coords) || coords.length < 2) return null;

        const strokeColor = (poly.props as any)?.strokeColor || '#f97316';
        const strokeWidth = (poly.props as any)?.strokeWidth || 4;
        const lineDash = (poly.props as any)?.lineDashPattern ? (poly.props as any).lineDashPattern.join(',') : undefined;

        const points = coords.map((c: any) => {
          const xOffset = ((Number(c.longitude) - centerLng) / lngDelta) * 50;
          const yOffset = -((Number(c.latitude) - centerLat) / latDelta) * 50;
          const leftPercent = Math.min(Math.max(50 + xOffset, 2), 98);
          const topPercent = Math.min(Math.max(50 + yOffset, 2), 98);
          return `${leftPercent}%,${topPercent}%`;
        }).join(' ');

        return (
          <svg
            key={`poly-${idx}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Glow / background road stroke */}
            <polyline
              points={points}
              fill="none"
              stroke="rgba(249, 115, 22, 0.25)"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main vibrant route line */}
            <polyline
              points={points}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={lineDash}
            />
          </svg>
        );
      })}

      {/* Markers Layer */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'box-none',
        }}
      >
        {markers.map((child: any, idx: number) => {
          if (!React.isValidElement(child)) return null;
          const { coordinate, title } = (child.props as any) || {};
          if (!coordinate || coordinate.latitude == null || coordinate.longitude == null) {
            return child;
          }

          const xOffset = ((Number(coordinate.longitude) - centerLng) / lngDelta) * 50;
          const yOffset = -((Number(coordinate.latitude) - centerLat) / latDelta) * 50;

          const leftPercent = Math.min(Math.max(50 + xOffset, 5), 95);
          const topPercent = Math.min(Math.max(50 + yOffset, 5), 95);

          return (
            <View
              key={child.key || `marker-${idx}-${coordinate.latitude}-${coordinate.longitude}`}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: [{ translateX: -16 }, { translateY: -16 }],
                zIndex: 20,
              }}
              accessibilityLabel={title}
            >
              {child}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default MapView;

