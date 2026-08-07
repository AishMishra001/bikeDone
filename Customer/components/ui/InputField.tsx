import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  TextInputProps
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  iconName?: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export default function InputField({
  iconName,
  isPassword,
  style,
  ...rest
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      {iconName && (
        <Feather
          name={iconName}
          size={20}
          color="#9ca3af"
          style={styles.inputIcon}
        />
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#9ca3af"
        secureTextEntry={isPassword ? !showPassword : false}
        {...rest}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 14,
  },
  eyeIcon: {
    padding: 4,
  },
});
