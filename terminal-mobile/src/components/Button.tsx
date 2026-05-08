import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, radii } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? colors.white : colors.textSecondary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantTextStyles[variant], sizeTextStyles[size]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.default,
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.forge },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderActive },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.alert },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: colors.white },
  secondary: { color: colors.textPrimary },
  ghost: { color: colors.textSecondary },
  danger: { color: colors.white },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 32, paddingHorizontal: 12 },
  md: { height: 44, paddingHorizontal: 18 },
  lg: { height: 52, paddingHorizontal: 28 },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 12 },
  md: { fontSize: 13 },
  lg: { fontSize: 15 },
};
