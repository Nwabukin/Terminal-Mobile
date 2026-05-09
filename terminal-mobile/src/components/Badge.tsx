import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typeScale } from '../theme/typography';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.clearDim, text: colors.clearSoft },
  info: { bg: colors.signalDim, text: colors.signalSoft },
  warning: { bg: colors.amberDim, text: colors.amber },
  danger: { bg: colors.alertDim, text: colors.alertSoft },
  neutral: { bg: colors.surfaceElevated, text: colors.textSecondary },
  accent: { bg: colors.forgeDim, text: colors.forgeLight },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View style={[
      styles.badge,
      { backgroundColor: variantStyle.bg },
      size === 'md' && styles.badgeMd,
    ]}>
      <Text style={[
        styles.label,
        { color: variantStyle.text },
        size === 'md' && styles.labelMd,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: typeScale.caption.fontFamily,
    fontSize: typeScale.caption.fontSize,
    lineHeight: typeScale.caption.lineHeight,
    letterSpacing: typeScale.caption.letterSpacing,
    textTransform: 'uppercase',
  },
  labelMd: {
    fontSize: 13,
    lineHeight: 18,
  },
});
