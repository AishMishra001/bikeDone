import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BackButton({ style, ...rest }: TouchableOpacityProps) {
  return (
    <TouchableOpacity style={[styles.backButton, style]} {...rest}>
      <Feather name="arrow-left" size={24} color="#374151" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
});
