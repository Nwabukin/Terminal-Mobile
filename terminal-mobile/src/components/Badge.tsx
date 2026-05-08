import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radii } from '../theme';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'neutral';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantConfig: Record<BadgeVariant, { bg: string; fg: string; border: string }> = {
  success: { bg: colors.clearDim, fg: colors.clearSoft, border: '#16A34A44' },
  info: { bg: colors.signalDim, fg: colors.signalSoft, border: '#3B82F644' },
  warning: { bg: colors.amberDim, fg: colors.amber, border: '#F5A62344' },
  danger: { bg: colors.alertDim, fg: colors.alertSoft, border: '#EF444444' },
  accent: { bg: colors.forgeDim, fg: colors.forgeLight, border: '#E8750A44' },
  neutral: { bg: colors.surfaceHigh, fg: colors.textSecondary, border: colors.border },
};

export function Badge({ label, variant }: BadgeProps) {
  const config = variantConfig[variant];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, { color: config.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.66,
    textTransform: 'uppercase',
  },
});
