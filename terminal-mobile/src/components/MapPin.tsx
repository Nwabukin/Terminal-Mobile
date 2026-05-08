import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface MapPinProps {
  price: string;
  selected?: boolean;
  icon?: React.ReactNode;
}

export function MapPin({ price, selected = false, icon }: MapPinProps) {
  return (
    <View style={[styles.pin, selected && styles.selected]}>
      {icon}
      <Text style={[styles.text, selected && styles.selectedText]}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selected: {
    backgroundColor: colors.forge,
    borderWidth: 2,
    borderColor: colors.forgeLight,
    transform: [{ scale: 1.1 }],
  },
  text: {
    fontSize: 11,
    color: colors.textPrimary,
    fontFamily: 'IBMPlexMono_400Regular',
  },
  selectedText: {
    color: colors.white,
  },
});
