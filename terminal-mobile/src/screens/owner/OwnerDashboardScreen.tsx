import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { IconBell } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typeScale, fontFamilies } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import apiClient from '../../api/client';
import { extractPagedCount, extractPagedItems } from '../../api/pagination';
import { useAuthStore } from '../../store/authStore';
import { LoadingSkeleton } from '../../components';
import { EmptyState } from '../../components';
import { formatCurrency, formatDateRange, formatRelativeTime } from '../../utils/format';
import type { Booking, Listing, PaginatedResponse, ApiResponse } from '../../api/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getFleetStatusDot(listing: Listing): string {
  if (listing.status === 'paused') return colors.amber;
  if (listing.status === 'active' && listing.is_available) return colors.clear;
  if (listing.status === 'active') return colors.forge;
  return colors.textTertiary;
}

function getFleetStatusLabel(listing: Listing): string {
  if (listing.status === 'paused') return 'Maintenance';
  if (listing.status === 'active' && listing.is_available) return 'Available';
  if (listing.status === 'active') return 'Active';
  return listing.status;
}

export default function OwnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.first_name ?? '';

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
    isRefetching: bookingsRefetching,
    isError: bookingsError,
  } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>('/bookings/?role=owner');
      const items = extractPagedItems<Booking>(data);
      return {
        success: true,
        count: extractPagedCount(data) ?? items.length,
        data: items,
      } satisfies PaginatedResponse<Booking>;
    },
  });

  const {
    data: listingsData,
    isLoading: listingsLoading,
    refetch: refetchListings,
    isRefetching: listingsRefetching,
    isError: listingsError,
  } = useQuery({
    queryKey: ['owner-listings'],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>('/listings/?own=true');
      const items = extractPagedItems<Listing>(data);
      return { success: true as const, data: items } satisfies ApiResponse<Listing[]>;
    },
  });

  const bookings: Booking[] = bookingsData?.data ?? [];
  const listings: Listing[] = listingsData?.data ?? [];

  const isLoading = bookingsLoading || listingsLoading;
  const isRefreshing = bookingsRefetching || listingsRefetching;
  const hasError = bookingsError || listingsError;

  const kpi = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status === 'active').length;
    const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
    const activeFleet = listings.filter((l) => l.status === 'active').length;
    const revenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.owner_payout_amount), 0);
    return { activeBookings, pendingRequests, activeFleet, revenue };
  }, [bookings, listings]);

  const pendingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'pending')
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [bookings],
  );

  const handleRefresh = useCallback(() => {
    refetchBookings();
    refetchListings();
  }, [refetchBookings, refetchListings]);

  const handleRequestPress = useCallback(
    (booking: Booking) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('BookingDetail', { bookingId: booking.id });
    },
    [navigation],
  );

  const handleFleetPress = useCallback(
    (listing: Listing) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('ListingDetail', { listingId: listing.id });
    },
    [navigation],
  );

  const isNewRequest = (booking: Booking) => {
    const created = new Date(booking.created_at).getTime();
    const now = Date.now();
    return now - created < 24 * 60 * 60 * 1000;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.caption}>{firstName.toUpperCase()}</Text>
            <Text style={s.h1}>Yard overview</Text>
          </View>
        </View>
        <LoadingSkeleton count={4} height={80} />
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.caption}>{firstName.toUpperCase()}</Text>
            <Text style={s.h1}>Yard overview</Text>
          </View>
        </View>
        <EmptyState
          title="Failed to load dashboard"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.forge}
          />
        }
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerText}>
            <Text style={s.caption}>{firstName.toUpperCase()}</Text>
            <Text style={s.h1}>Yard overview</Text>
          </View>
          <Pressable style={s.bellContainer}>
            <IconBell size={24} color={colors.textPrimary} strokeWidth={1.5} />
            {(user?.unread_messages ?? 0) > 0 && <View style={s.unreadDot} />}
          </Pressable>
        </View>

        {/* KPI Grid */}
        <View style={s.kpiGrid}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>ACTIVE BOOKINGS</Text>
            <Text style={s.kpiValue}>{kpi.activeBookings}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>PENDING REQUESTS</Text>
            <Text style={s.kpiValue}>{kpi.pendingRequests}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>ACTIVE FLEET</Text>
            <Text style={s.kpiValue}>{kpi.activeFleet}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>REVENUE</Text>
            <Text style={s.kpiValue}>
              {formatCurrency(kpi.revenue)}
            </Text>
          </View>
        </View>

        {/* Pending Requests */}
        <Text style={s.sectionTitle}>Pending requests</Text>
        {pendingBookings.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No pending requests</Text>
          </View>
        ) : (
          pendingBookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={({ pressed }) => [
                s.requestRow,
                isNewRequest(booking) && s.requestRowNew,
                pressed && s.pressed,
              ]}
              onPress={() => handleRequestPress(booking)}
            >
              <View style={s.requestTop}>
                <Text style={s.requestRenter} numberOfLines={1}>
                  {booking.renter.full_name}
                </Text>
                <Text style={s.requestTimeAgo}>
                  {formatRelativeTime(booking.created_at)}
                </Text>
              </View>
              <Text style={s.requestTitle} numberOfLines={1}>
                {booking.listing_title}
              </Text>
              <View style={s.requestBottom}>
                <Text style={s.requestDates}>
                  {formatDateRange(booking.start_date, booking.end_date)}
                </Text>
                <Text style={s.requestAmount}>
                  {formatCurrency(parseFloat(booking.gross_amount))}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {/* Fleet */}
        <Text style={s.sectionTitle}>Fleet</Text>
        {listings.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No assets listed</Text>
          </View>
        ) : (
          listings.map((listing) => (
            <Pressable
              key={listing.id}
              style={({ pressed }) => [
                s.fleetRow,
                pressed && s.pressed,
              ]}
              onPress={() => handleFleetPress(listing)}
            >
              <View
                style={[
                  s.statusDot,
                  { backgroundColor: getFleetStatusDot(listing) },
                ]}
              />
              <View style={s.fleetInfo}>
                <Text style={s.fleetTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                <Text style={s.fleetStatus}>
                  {getFleetStatusLabel(listing)}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  caption: {
    ...typeScale.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  h1: {
    ...typeScale.h1,
    color: colors.textPrimary,
  },
  bellContainer: {
    padding: spacing.sm,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forge,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: screenPadding.horizontal,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
  },
  kpiLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  kpiValue: {
    fontFamily: fontFamilies.mono,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },

  // Section
  sectionTitle: {
    ...typeScale.h2,
    color: colors.textPrimary,
    paddingHorizontal: screenPadding.horizontal,
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },

  // Request rows
  requestRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginHorizontal: screenPadding.horizontal,
    marginBottom: spacing.md,
  },
  requestRowNew: {
    borderLeftWidth: 3,
    borderLeftColor: colors.forge,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requestRenter: {
    ...typeScale.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  requestTimeAgo: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  requestTitle: {
    ...typeScale.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  requestBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestDates: {
    ...typeScale.mono2,
    color: colors.textSecondary,
  },
  requestAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 18,
    color: colors.forgeLight,
  },

  // Fleet rows
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginHorizontal: screenPadding.horizontal,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  fleetInfo: {
    flex: 1,
  },
  fleetTitle: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  fleetStatus: {
    ...typeScale.mono3,
    color: colors.textSecondary,
    marginTop: 2,
  },

  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.xl,
    marginHorizontal: screenPadding.horizontal,
    alignItems: 'center',
  },
  emptyText: {
    ...typeScale.body2,
    color: colors.textTertiary,
  },
});
