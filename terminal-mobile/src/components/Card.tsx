import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  accentColor?: string;
  padding?: 'compact' | 'default' | 'spacious';
  style?: ViewStyle;
}

export function Card({ children, accentColor, padding = 'default', style }: CardProps) {
  const paddingValue = padding === 'compact' ? spacing.md : padding === 'spacious' ? spacing.lg : spacing.base;
  return (
    <View
      style={[
        styles.card,
        { padding: paddingValue },
        accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
  },
});
