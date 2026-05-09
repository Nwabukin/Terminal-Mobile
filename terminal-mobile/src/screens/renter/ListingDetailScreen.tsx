import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  IconArrowLeft,
  IconMapPin,
  IconCircleFilled,
  IconShieldCheck,
  IconMessageCircle2,
  IconCalendarEvent,
  IconClock,
} from '@tabler/icons-react-native';

import { colors, typeScale, spacing, radii } from '../../theme';
import { fetchListingDetail } from '../../api/listings';
import { createInquiryThread } from '../../api/messaging';
import { ResourceIcon } from '../../components/ResourceIcon';
import { formatCurrency } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = (SCREEN_WIDTH * 10) / 16;

export default function ListingDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { listingId } = route.params as { listingId: string };
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => fetchListingDetail(listingId),
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH
      );
      setActivePhotoIndex(index);
    },
    []
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMessage = useCallback(async () => {
    if (!listing) return;
    try {
      const result = await createInquiryThread({
        listing_id: listing.id,
        initial_message: `Inquiry about ${listing.title}`,
      });
      if (result.data?.id) {
        navigation.navigate('Thread', { threadId: result.data.id });
      }
    } catch {
      navigation.navigate('Thread', { threadId: listing.id });
    }
  }, [listing, navigation]);

  const handleRequestBooking = useCallback(() => {
    if (listing) {
      navigation.navigate('RequestBooking', { listing });
    }
  }, [listing, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.forge} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load listing</Text>
        <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const sortedMedia = [...(listing.media || [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const hasPhotos = sortedMedia.length > 0;
  const dailyPrice = listing.price_daily ? parseFloat(listing.price_daily) : null;
  const weeklyPrice = listing.price_weekly ? parseFloat(listing.price_weekly) : null;
  const monthlyPrice = listing.price_monthly ? parseFloat(listing.price_monthly) : null;

  const ownerInitials = listing.owner.full_name
    ? listing.owner.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const specs = listing.specs && typeof listing.specs === 'object'
    ? Object.entries(listing.specs)
    : [];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero photo area */}
        <View style={styles.heroContainer}>
          {hasPhotos ? (
            <FlatList
              data={sortedMedia}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.file_url }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <ResourceIcon
                resourceType={listing.resource_type}
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.heroPlaceholderText}>No photos yet</Text>
            </View>
          )}

          {/* Back button */}
          <Pressable
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            onPress={handleBack}
          >
            <IconArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </Pressable>

          {/* Resource type chip */}
          <View style={[styles.typeChip, { top: insets.top + spacing.sm }]}>
            <ResourceIcon
              resourceType={listing.resource_type}
              size={14}
              color={colors.forge}
            />
            <Text style={styles.typeChipText}>
              {listing.resource_type.toUpperCase()}
            </Text>
          </View>

          {/* Pagination dots */}
          {hasPhotos && sortedMedia.length > 1 && (
            <View style={styles.paginationDots}>
              {sortedMedia.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activePhotoIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title.toUpperCase()}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <IconMapPin size={14} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={styles.metaText}>
                {listing.location_city || listing.location_address || 'Unknown'}
              </Text>
            </View>
            {listing.is_available && (
              <>
                <Text style={styles.metaDot}>·</Text>
                <View style={styles.metaItem}>
                  <IconCircleFilled size={6} color={colors.clear} />
                  <Text style={[styles.metaText, { color: colors.clear }]}>
                    Available
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Price card */}
          <View style={styles.priceCard}>
            <Text style={styles.priceCardTitle}>PRICING</Text>
            {dailyPrice !== null && (
              <View style={styles.priceRow}>
                <View style={styles.priceLabel}>
                  <IconClock size={14} color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={styles.priceLabelText}>Daily</Text>
                </View>
                <Text style={styles.pricePrimary}>
                  {formatCurrency(dailyPrice)}
                  <Text style={styles.pricePeriod}>/day</Text>
                </Text>
              </View>
            )}
            {weeklyPrice !== null && (
              <View style={styles.priceRow}>
                <View style={styles.priceLabel}>
                  <IconCalendarEvent size={14} color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={styles.priceLabelText}>Weekly</Text>
                </View>
                <Text style={styles.priceSecondary}>
                  {formatCurrency(weeklyPrice)}
                  <Text style={styles.pricePeriod}>/week</Text>
                </Text>
              </View>
            )}
            {monthlyPrice !== null && (
              <View style={styles.priceRow}>
                <View style={styles.priceLabel}>
                  <IconCalendarEvent size={14} color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={styles.priceLabelText}>Monthly</Text>
                </View>
                <Text style={styles.priceSecondary}>
                  {formatCurrency(monthlyPrice)}
                  <Text style={styles.pricePeriod}>/month</Text>
                </Text>
              </View>
            )}
            {dailyPrice === null && weeklyPrice === null && monthlyPrice === null && (
              <Text style={styles.noPriceText}>Contact for pricing</Text>
            )}
          </View>

          {/* About section */}
          {listing.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ABOUT</Text>
              <Text style={styles.bodyText}>{listing.description}</Text>
            </View>
          ) : null}

          {/* Specs section */}
          {specs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
              <View style={styles.specsGrid}>
                {specs.map(([key, value]) => (
                  <View key={key} style={styles.specItem}>
                    <Text style={styles.specLabel}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.specValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OPTIONS</Text>
            <View style={styles.optionsRow}>
              <View style={styles.optionItem}>
                <View
                  style={[
                    styles.optionDot,
                    {
                      backgroundColor: listing.operator_available
                        ? colors.clear
                        : colors.textTertiary,
                    },
                  ]}
                />
                <Text style={styles.optionText}>
                  Operator {listing.operator_available ? 'available' : 'not included'}
                </Text>
              </View>
              <View style={styles.optionItem}>
                <View
                  style={[
                    styles.optionDot,
                    {
                      backgroundColor: listing.delivery_available
                        ? colors.clear
                        : colors.textTertiary,
                    },
                  ]}
                />
                <Text style={styles.optionText}>
                  Delivery {listing.delivery_available ? 'available' : 'not available'}
                </Text>
              </View>
            </View>
          </View>

          {/* Owner card */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerRow}>
              {listing.owner.profile_photo ? (
                <Image
                  source={{ uri: listing.owner.profile_photo }}
                  style={styles.ownerAvatar}
                />
              ) : (
                <View style={styles.ownerAvatarPlaceholder}>
                  <Text style={styles.ownerInitials}>{ownerInitials}</Text>
                </View>
              )}

              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{listing.owner.full_name}</Text>
                  {listing.owner.verification_level >= 2 && (
                    <IconShieldCheck
                      size={16}
                      color={colors.signal}
                      strokeWidth={1.5}
                    />
                  )}
                </View>
                <View style={styles.ownerMeta}>
                  <Text style={styles.ownerMetaText}>
                    Member since{' '}
                    {new Date(listing.created_at).getFullYear()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable style={styles.messageButton} onPress={handleMessage}>
          <IconMessageCircle2 size={18} color={colors.textPrimary} strokeWidth={1.5} />
          <Text style={styles.messageButtonText}>Message</Text>
        </Pressable>

        <Pressable style={styles.bookingButton} onPress={handleRequestBooking}>
          <Text style={styles.bookingButtonText}>Request booking</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.abyss,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
  },
  errorText: {
    ...typeScale.body1,
    color: colors.textSecondary,
  },
  retryButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryButtonText: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },

  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroPlaceholderText: {
    ...typeScale.body2,
    color: colors.textTertiary,
  },

  backButton: {
    position: 'absolute',
    left: spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19,19,24,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  typeChip: {
    position: 'absolute',
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.forgeDim,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    zIndex: 10,
  },
  typeChipText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.66,
    color: colors.forge,
  },

  paginationDots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
    borderRadius: 3,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },

  title: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.28,
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typeScale.body2,
    color: colors.textTertiary,
  },

  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    gap: spacing.md,
  },
  priceCardTitle: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceLabelText: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  pricePrimary: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 17,
    lineHeight: 22,
    color: colors.forge,
  },
  priceSecondary: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  pricePeriod: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
  noPriceText: {
    ...typeScale.body1,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },

  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  bodyText: {
    ...typeScale.body1,
    color: colors.textSecondary,
  },

  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  specItem: {
    width: '47%' as any,
    gap: spacing.xs,
  },
  specLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  specValue: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },

  optionsRow: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  optionText: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },

  ownerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forgeDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitials: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 17,
    color: colors.forge,
  },
  ownerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ownerName: {
    ...typeScale.h2,
    color: colors.textPrimary,
  },
  ownerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ownerMetaText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
  },

  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  messageButtonText: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bookingButton: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forge,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
  },
  bookingButtonText: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  },
});
