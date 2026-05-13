import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { colors } from '../../theme/colors';
import { typeScale } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { getBookings } from '../../api/bookings';
import { useAuthStore } from '../../store/authStore';
import { BookingRow } from '../../components/BookingRow';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import type { Booking } from '../../api/types';

const FILTERS = ['All', 'Active', 'Pending', 'Past'] as const;
type FilterType = (typeof FILTERS)[number];

function getStatusFilter(filter: FilterType): string | undefined {
  switch (filter) {
    case 'Active':
      return 'active';
    case 'Pending':
      return 'pending';
    case 'Past':
      return 'completed';
    default:
      return undefined;
  }
}

export function BookingsScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const role = user?.is_owner ? 'owner' : 'renter';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bookings', role, activeFilter],
    queryFn: () =>
      getBookings({
        role,
        status: getStatusFilter(activeFilter),
      }),
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const bookings: Booking[] = data?.data ?? [];

  const handleBookingPress = useCallback(
    (booking: Booking) => {
      navigation.navigate('BookingDetail', { bookingId: booking.id });
    },
    [navigation],
  );

  const renderBooking = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingRow booking={item} onPress={handleBookingPress} />
    ),
    [handleBookingPress],
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.headerSection}>
        <Text style={s.heading}>My bookings</Text>

        <View style={s.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                style={[s.chip, isActive ? s.chipActive : s.chipInactive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[s.chipText, isActive && s.chipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={s.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <EmptyState
              title="No bookings yet"
              description="Find your first listing."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  headerSection: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.base,
  },
  heading: {
    ...typeScale.h1,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.forgeDim,
    borderColor: colors.forge,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipText: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.forgeLight,
  },
  list: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
});
