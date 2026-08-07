import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/theme';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  subtitle,
  selected,
  onSelect,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      style={[
        styles.card,
        selected && styles.selectedCard,
        selected && Shadows.small,
      ]}
    >
      <View style={styles.leftContent}>
        {icon ? (
          <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
            <Ionicons
              name={icon}
              size={24}
              color={selected ? Colors.primary : Colors.gray500}
            />
          </View>
        ) : null}
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.selectedTitle]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(242, 86, 29, 0.15)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  selectedTitle: {
    color: Colors.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray500,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});
