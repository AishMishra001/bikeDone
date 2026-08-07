import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  prefixText?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  prefixText,
  error,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.focusedWrapper,
          Boolean(error) && styles.errorWrapper,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.primary : Colors.gray400}
            style={styles.icon}
          />
        ) : null}

        {prefixText ? <Text style={styles.prefixText}>{prefixText}</Text> : null}

        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          {...props}
        />

        {value && onChangeText && !multiline ? (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 14,
  },
  multilineWrapper: {
    height: 'auto',
    minHeight: 90,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  focusedWrapper: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  errorWrapper: {
    borderColor: '#EF4444',
  },
  icon: {
    marginRight: 10,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDark,
    padding: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});
