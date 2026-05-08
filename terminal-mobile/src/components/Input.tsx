import React from 'react';
import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import { colors, radii } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export function Input({ label, error, prefix, style, ...props }: InputProps) {
  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {prefix}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  inputWrap: {
    height: 44,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputError: {
    borderColor: colors.alert,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: colors.alertSoft,
  },
});
