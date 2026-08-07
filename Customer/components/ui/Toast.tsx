import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number; // ms, default 3500
  onHide: () => void;
}

// ─── Config per type ────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { bg: string; border: string; icon: keyof typeof Feather.glyphMap; iconColor: string; textColor: string }> = {
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: 'check-circle',
    iconColor: '#16a34a',
    textColor: '#166534',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    textColor: '#991b1b',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    icon: 'alert-triangle',
    iconColor: '#f59e0b',
    textColor: '#92400e',
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: 'info',
    iconColor: '#2563eb',
    textColor: '#1e40af',
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function Toast({
  visible,
  message,
  type = 'error',
  duration = 3500,
  onHide,
}: ToastProps) {
  const translateX = useRef(new Animated.Value(400)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<any>(null);

  const config = CONFIG[type];

  const slideIn = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  useEffect(() => {
    if (visible) {
      // Reset position
      translateX.setValue(400);
      opacity.setValue(0);

      slideIn();

      // Auto hide after duration
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        slideOut();
      }, duration);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, message]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateX }],
          opacity,
        },
      ]}
    >
      <Feather name={config.icon} size={18} color={config.iconColor} style={styles.icon} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity onPress={slideOut} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={16} color={config.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginRight: 8,
  },
});
