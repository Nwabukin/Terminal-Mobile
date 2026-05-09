import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { IconMapPin, IconCircleFilled } from '@tabler/icons-react-native';
import { colors, spacing, radii } from '../theme';
import { ResourceIcon } from './ResourceIcon';
import { formatCurrency, formatDistance } from '../utils/format';
import type { SearchResult } from '../api/types';

interface ListingCardProps {
  listing: SearchResult;
  onPress?: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
  const dailyPrice = listing.price_daily
    ? parseFloat(listing.price_daily)
    : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        {listing.primary_photo_url ? (
          <Image
            source={{ uri: listing.primary_photo_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <ResourceIcon
              resourceType={listing.resource_type}
              size={28}
              color={colors.textTertiary}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.typeRow}>
          <ResourceIcon resourceType={listing.resource_type} size={12} />
          <Text style={styles.typeLabel}>
            {listing.resource_type.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <View style={styles.metaRow}>
          <IconMapPin size={12} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.metaText} numberOfLines={1}>
            {listing.location_city || listing.location_address}
          </Text>
          {listing.distance_km !== null && listing.distance_km !== undefined && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.distanceText}>
                {formatDistance(listing.distance_km)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.availableBadge}>
            <IconCircleFilled size={6} color={colors.clear} />
            <Text style={styles.availableText}>Available</Text>
          </View>
          {dailyPrice !== null && (
            <Text style={styles.price}>
              {formatCurrency(dailyPrice)}
              <Text style={styles.pricePeriod}>/day</Text>
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  thumbnailContainer: {
    width: 88,
    height: 88,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.66,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  metaDot: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  distanceText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  availableText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    lineHeight: 14,
    color: colors.clear,
  },
  price: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: colors.forge,
  },
  pricePeriod: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
});
