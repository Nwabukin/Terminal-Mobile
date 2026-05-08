import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

interface BookingRowProps {
  title: string;
  dates: string;
  amount: string;
  status: string;
  accentColor?: string;
}

export function BookingRow({ title, dates, amount, accentColor }: BookingRowProps) {
  return (
    <View style={[styles.row, accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.meta}>
        <Text style={styles.dates}>{dates}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 14,
  },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  dates: { fontSize: 13, color: colors.textSecondary, fontFamily: 'IBMPlexMono_400Regular' },
  amount: { fontSize: 13, color: colors.textPrimary, fontFamily: 'IBMPlexMono_400Regular' },
});
