import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

interface ListingCardProps {
  title: string;
  subtitle: string;
  price: string;
  priceSuffix?: string;
  available?: boolean;
}

export function ListingCard({ title, subtitle, price, priceSuffix = '/day', available = true }: ListingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.sub}>
          <View style={[styles.dot, { backgroundColor: available ? colors.clearSoft : colors.textTertiary }]} />
          <Text style={styles.subText}>{subtitle}</Text>
        </View>
        <View style={styles.foot}>
          <Text style={styles.price}>{price}<Text style={styles.suffix}> {priceSuffix}</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  body: { padding: 14 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 999 },
  subText: { fontSize: 13, color: colors.textSecondary },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 15, color: colors.forge, fontFamily: 'IBMPlexMono_400Regular' },
  suffix: { fontSize: 12, color: colors.textTertiary },
});
