import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ChipTagProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'checkbox' | 'pill';
}

export const ChipTag: React.FC<ChipTagProps> = ({
  label,
  selected,
  onPress,
  icon,
  variant = 'pill',
}) => {
  if (variant === 'checkbox') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.checkboxRow, selected && styles.checkboxRowSelected]}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <Ionicons name="checkmark" size={14} color={Colors.textWhite} /> : null}
        </View>
        <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.pill, selected ? styles.pillSelected : styles.pillUnselected]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? Colors.textWhite : Colors.gray600}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Pill styles (Screen 9 Expertise)
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },
  pillUnselected: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.gray200,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextUnselected: {
    color: Colors.gray700,
  },
  pillTextSelected: {
    color: Colors.textWhite,
  },

  // Checkbox styles (Screen 8 Services)
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
    marginBottom: 10,
  },
  checkboxRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  checkboxLabelSelected: {
    color: Colors.primaryDark,
  },
});
