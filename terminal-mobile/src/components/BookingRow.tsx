import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { typeScale } from '../theme/typography';
import { spacing, radii } from '../theme/spacing';
import { Badge } from './Badge';
import { formatDateRange, formatCurrency } from '../utils/format';
import { BOOKING_STATUSES } from '../utils/constants';
import type { Booking } from '../api/types';

interface BookingRowProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

function getStatusBadgeVariant(status: Booking['status']): string {
  return BOOKING_STATUSES[status]?.badge ?? 'neutral';
}

function getLeftBorderColor(booking: Booking): string | undefined {
  if (booking.status === 'active') return colors.clear;
  if (booking.status === 'pending') return colors.forge;
  return undefined;
}

export function BookingRow({ booking, onPress }: BookingRowProps) {
  const isCancelled = booking.status === 'cancelled';
  const leftBorder = getLeftBorderColor(booking);
  const statusConfig = BOOKING_STATUSES[booking.status];

  return (
    <Pressable
      onPress={() => onPress(booking)}
      style={({ pressed }) => [
        styles.container,
        leftBorder ? { borderLeftWidth: 3, borderLeftColor: leftBorder } : null,
        isCancelled && styles.cancelled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, isCancelled && styles.strikethrough]}
          numberOfLines={1}
        >
          {booking.listing_title}
        </Text>
        <Badge
          label={statusConfig?.label ?? booking.status.toUpperCase()}
          variant={getStatusBadgeVariant(booking.status) as any}
        />
      </View>

      <Text style={styles.dates}>
        {formatDateRange(booking.start_date, booking.end_date)}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.amount}>
          {formatCurrency(parseFloat(booking.gross_amount))}
        </Text>

        {booking.status === 'confirmed' && booking.payment_status === 'unpaid' && (
          <View style={styles.paymentIndicator}>
            <View style={[styles.dot, { backgroundColor: colors.amber }]} />
            <Text style={styles.paymentText}>Awaiting payment</Text>
          </View>
        )}

        {booking.payment_status === 'simulated_paid' && (
          <View style={styles.paymentIndicator}>
            <Text style={styles.paidText}>✓ Paid</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  cancelled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typeScale.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  dates: {
    ...typeScale.mono2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    ...typeScale.mono1,
    color: colors.textPrimary,
  },
  paymentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paymentText: {
    ...typeScale.mono3,
    color: colors.amber,
  },
  paidText: {
    ...typeScale.mono3,
    color: colors.clear,
  },
});
