import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { colors } from '../../theme/colors';
import { typeScale } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { getBookingDetail, acceptBooking, declineBooking } from '../../api/bookings';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/Badge';
import { formatCurrency } from '../../utils/format';
import { BOOKING_STATUSES } from '../../utils/constants';
import type { Booking } from '../../api/types';

function getStatusVariant(status: Booking['status']): string {
  return BOOKING_STATUSES[status]?.badge ?? 'neutral';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const bookingId: string = route.params?.bookingId;

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingDetail(bookingId),
    enabled: !!bookingId,
  });

  const booking: Booking | undefined = data?.data;
  const isOwner = user?.is_owner ?? false;
  const isPending = booking?.status === 'pending';

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [queryClient, bookingId]);

  const acceptMutation = useMutation({
    mutationFn: () => acceptBooking(bookingId),
    onSuccess: () => {
      invalidateQueries();
      Alert.alert('Booking accepted', 'The renter has been notified.');
    },
    onError: () => {
      Alert.alert('Error', 'Could not accept this booking. Try again.');
    },
  });

  const declineMutation = useMutation({
    mutationFn: (reason: string) => declineBooking(bookingId, reason),
    onSuccess: () => {
      invalidateQueries();
      Alert.alert('Booking declined', 'The renter has been notified.');
    },
    onError: () => {
      Alert.alert('Error', 'Could not decline this booking. Try again.');
    },
  });

  const handleAccept = () => {
    Alert.alert('Accept this request?', 'You are confirming availability for the requested dates.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => acceptMutation.mutate() },
    ]);
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline this request',
      'Are you sure you want to decline?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => declineMutation.mutate(''),
        },
      ],
    );
  };

  if (isLoading || !booking) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator color={colors.forge} size="large" />
      </View>
    );
  }

  const grossAmount = parseFloat(booking.gross_amount);
  const commissionAmount = parseFloat(booking.commission_amount);
  const payoutAmount = parseFloat(booking.owner_payout_amount);
  const durationDays = booking.duration_days;
  const startFormatted = format(new Date(booking.start_date), 'MMM d, yyyy');
  const endFormatted = format(new Date(booking.end_date), 'MMM d, yyyy');

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backArrow}>{'\u2190'}</Text>
          </Pressable>
          <View style={s.headerInfo}>
            <Text style={s.bookingRef}>Request \u00B7 BK-{booking.id.slice(0, 8)}</Text>
            <Text style={s.renterName}>{booking.renter.full_name}</Text>
          </View>
          <Badge
            label={BOOKING_STATUSES[booking.status]?.label ?? booking.status.toUpperCase()}
            variant={getStatusVariant(booking.status) as any}
            size="md"
          />
        </View>

        {/* Asset card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>ASSET</Text>
          <Text style={s.cardTitle}>{booking.listing_title}</Text>
        </View>

        {/* Schedule card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>SCHEDULE</Text>
          <View style={s.scheduleRow}>
            <View style={s.scheduleCol}>
              <Text style={s.scheduleFieldLabel}>Start</Text>
              <Text style={s.scheduleMono}>{startFormatted}</Text>
            </View>
            <View style={s.scheduleCol}>
              <Text style={s.scheduleFieldLabel}>End</Text>
              <Text style={s.scheduleMono}>{endFormatted}</Text>
            </View>
          </View>
          <Text style={s.scheduleDuration}>
            {durationDays} days \u00B7 {booking.duration_type}
          </Text>
        </View>

        {/* Renter note card */}
        {booking.renter_note ? (
          <View style={s.card}>
            <Text style={s.cardLabel}>NOTE FROM RENTER</Text>
            <View style={s.noteRow}>
              <View style={s.quoteLine} />
              <Text style={s.noteText}>{booking.renter_note}</Text>
            </View>
          </View>
        ) : null}

        {/* Financials card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>FINANCIALS</Text>
          <View style={s.finRow}>
            <Text style={s.finLabel}>Gross amount</Text>
            <Text style={s.finMono}>{formatCurrency(grossAmount)}</Text>
          </View>
          <View style={s.finRow}>
            <Text style={s.finLabel}>Platform fee (10%)</Text>
            <Text style={s.finMono}>-{formatCurrency(commissionAmount)}</Text>
          </View>
          <View style={s.finSeparator} />
          <View style={s.finRow}>
            <Text style={s.finPayoutLabel}>Your payout</Text>
            <Text style={s.finPayoutValue}>{formatCurrency(payoutAmount)}</Text>
          </View>
        </View>

        {/* Renter card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>RENTER</Text>
          <View style={s.renterRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{getInitials(booking.renter.full_name)}</Text>
            </View>
            <View style={s.renterInfo}>
              <Text style={s.renterInfoName}>{booking.renter.full_name}</Text>
              {booking.renter.phone ? (
                <Text style={s.renterInfoPhone}>{booking.renter.phone}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom actions */}
      {isPending && isOwner && (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + spacing.base }]}>
          <Pressable
            style={s.declineBtn}
            onPress={handleDecline}
            disabled={declineMutation.isPending}
          >
            <Text style={s.declineBtnText}>
              {declineMutation.isPending ? 'Declining...' : 'Decline'}
            </Text>
          </Pressable>
          <Pressable
            style={s.acceptBtn}
            onPress={handleAccept}
            disabled={acceptMutation.isPending}
          >
            <Text style={s.acceptBtnText}>
              {acceptMutation.isPending ? 'Accepting...' : 'Accept request'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.abyss,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backArrow: {
    ...typeScale.h1,
    color: colors.textPrimary,
  },
  headerInfo: {
    flex: 1,
  },
  bookingRef: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  renterName: {
    ...typeScale.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  scheduleCol: {},
  scheduleFieldLabel: {
    ...typeScale.mono3,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  scheduleMono: {
    ...typeScale.mono2,
    color: colors.textPrimary,
  },
  scheduleDuration: {
    ...typeScale.mono3,
    color: colors.textSecondary,
  },

  // Note
  noteRow: {
    flexDirection: 'row',
  },
  quoteLine: {
    width: 3,
    backgroundColor: colors.forge,
    borderRadius: 1.5,
    marginRight: spacing.md,
  },
  noteText: {
    ...typeScale.body2,
    color: colors.textSecondary,
    flex: 1,
  },

  // Financials
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  finLabel: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  finMono: {
    ...typeScale.mono2,
    color: colors.textPrimary,
  },
  finSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  finPayoutLabel: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  finPayoutValue: {
    ...typeScale.mono1,
    color: colors.forge,
  },

  // Renter
  renterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.forgeDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typeScale.caption,
    color: colors.forgeLight,
  },
  renterInfo: {},
  renterInfoName: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  renterInfoPhone: {
    ...typeScale.mono3,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.abyss,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  declineBtnText: {
    ...typeScale.h2,
    color: colors.textPrimary,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.forge,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  acceptBtnText: {
    ...typeScale.h2,
    color: colors.textOnAccent,
  },
});
