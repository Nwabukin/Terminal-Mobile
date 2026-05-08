import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';
import { typeScale } from '../theme/typography';
import { spacing, radii } from '../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, prefix, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            error ? styles.inputWrapperError : undefined,
          ]}
        >
          {prefix && <Text style={styles.prefix}>{prefix}</Text>}
          <TextInput
            ref={ref}
            style={[styles.input, prefix ? styles.inputWithPrefix : undefined, style]}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.forge}
            cursorColor={colors.forge}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typeScale.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    height: 48,
    paddingHorizontal: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.forge,
  },
  inputWrapperError: {
    borderColor: colors.alert,
  },
  prefix: {
    ...typeScale.body1,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typeScale.body1,
    color: colors.textPrimary,
    height: '100%' as any,
    padding: 0,
  },
  inputWithPrefix: {
    paddingLeft: 0,
  },
  error: {
    ...typeScale.body2,
    color: colors.alert,
    marginTop: spacing.xs,
  },
});
