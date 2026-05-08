import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme';

interface BottomSheetProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BottomSheet({ children, style }: BottomSheetProps) {
  return (
    <View style={[styles.sheet, style]}>
      <View style={styles.handle} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderActive,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 12,
  },
  body: {
    paddingHorizontal: 20,
  },
});
