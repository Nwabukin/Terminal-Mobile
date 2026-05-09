import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  IconSearch,
  IconChevronDown,
  IconCircleFilled,
  IconCurrentLocation,
} from '@tabler/icons-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, spacing, radii } from '../../theme';
import { fetchMapListings } from '../../api/search';
import { useLocation } from '../../hooks/useLocation';
import { MapPin } from '../../components/MapPin';
import { ListingCard } from '../../components/ListingCard';
import { BottomSheet } from '../../components/BottomSheet';
import type { SearchResult } from '../../api/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const RESOURCE_FILTERS = [
  { id: 'equipment', label: 'Equipment' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'facility', label: 'Facility' },
] as const;

const RADIUS_OPTIONS = [10, 20, 50, 100, 200];
const DEFAULT_RADIUS = 50;

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0C0C0F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8E8EA8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0C0C0F' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2A2A36' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#131318' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1A22' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#22222C' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#22222C' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#131318' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#131318' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#52526A' }] },
];

interface MapScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// react-native-maps is native-only; on web we render a dark placeholder
// For native builds, replace the map placeholder below with:
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const { latitude, longitude, loading: locationLoading } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SearchResult | null>(null);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const {
    data: searchResponse,
    isLoading: searchLoading,
  } = useQuery({
    queryKey: ['mapListings', latitude, longitude, radius, selectedType],
    queryFn: () =>
      fetchMapListings({
        lat: latitude,
        lng: longitude,
        radius,
        resource_type: selectedType ?? undefined,
        available: true,
      }),
    enabled: !locationLoading,
    staleTime: 30_000,
  });

  const listings = searchResponse?.data ?? [];

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.location_city.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const handleMarkerPress = useCallback((listing: SearchResult) => {
    setSelectedListing(listing);
    mapRef.current?.animateToRegion?.(
      {
        latitude: listing.latitude,
        longitude: listing.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      300
    );
  }, []);

  const handleDetailPress = useCallback(() => {
    if (selectedListing) {
      navigation.navigate('ListingDetail', { listingId: selectedListing.id });
    }
  }, [selectedListing, navigation]);

  const handleBookingPress = useCallback(() => {
    if (selectedListing) {
      navigation.navigate('RequestBooking', { listingId: selectedListing.id });
    }
  }, [selectedListing, navigation]);

  const handleRecenter = useCallback(() => {
    mapRef.current?.animateToRegion?.(
      {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      300
    );
  }, [latitude, longitude]);

  const handleTypeFilter = useCallback(
    (typeId: string | null) => {
      setSelectedType((prev) => (prev === typeId ? null : typeId));
      setSelectedListing(null);
    },
    []
  );

  const handleRadiusSelect = useCallback((r: number) => {
    setRadius(r);
    setRadiusMenuOpen(false);
    setSelectedListing(null);
  }, []);

  return (
    <View style={styles.root}>
      {/* Map or dark placeholder for web */}
      {/* Dark map placeholder — on native, swap for react-native-maps MapView */}
      <Pressable
        style={[StyleSheet.absoluteFill, styles.webMapPlaceholder]}
        onPress={() => setSelectedListing(null)}
      >
        <View style={styles.webMapGrid}>
          {filteredListings.map((listing) => (
            <Pressable
              key={listing.id}
              onPress={() => handleMarkerPress(listing)}
            >
              <MapPin
                resourceType={listing.resource_type}
                priceDaily={listing.price_daily}
                isSelected={selectedListing?.id === listing.id}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.userLocationContainer}>
          <Animated.View style={[styles.userLocationPulse, pulseStyle]} />
          <View style={styles.userLocationDot} />
        </View>
        <Text style={styles.webMapLabel}>
          LAGOS · {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
        </Text>
      </Pressable>

      {/* Floating search bar */}
      <View style={[styles.searchContainer, { top: insets.top + spacing.sm }]}>
        <View style={styles.searchBar}>
          <IconSearch size={18} color={colors.textTertiary} strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Lagos..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchLoading && (
            <ActivityIndicator size="small" color={colors.forge} />
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.chipsRow}>
          {RESOURCE_FILTERS.map((filter) => {
            const isActive = selectedType === filter.id;
            return (
              <Pressable
                key={filter.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleTypeFilter(filter.id)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.chip, radiusMenuOpen && styles.chipActive]}
            onPress={() => setRadiusMenuOpen((o) => !o)}
          >
            <Text style={[styles.chipText, radiusMenuOpen && styles.chipTextActive]}>
              {radius} km
            </Text>
            <IconChevronDown size={12} color={radiusMenuOpen ? colors.forge : colors.textSecondary} strokeWidth={1.5} />
          </Pressable>

          <View style={[styles.chip, styles.chipActive]}>
            <IconCircleFilled size={6} color={colors.clear} />
            <Text style={[styles.chipText, styles.chipTextActive]}>Available</Text>
          </View>
        </View>

        {radiusMenuOpen && (
          <View style={styles.radiusDropdown}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.radiusOption,
                  r === radius && styles.radiusOptionActive,
                ]}
                onPress={() => handleRadiusSelect(r)}
              >
                <Text
                  style={[
                    styles.radiusOptionText,
                    r === radius && styles.radiusOptionTextActive,
                  ]}
                >
                  {r} km
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Recenter button */}
      <Pressable
        style={[styles.recenterButton, { bottom: selectedListing ? 300 : insets.bottom + spacing.lg }]}
        onPress={handleRecenter}
      >
        <IconCurrentLocation size={20} color={colors.textPrimary} strokeWidth={1.5} />
      </Pressable>

      {/* Result count badge */}
      {!searchLoading && filteredListings.length > 0 && !selectedListing && (
        <View style={[styles.countBadge, { bottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.countText}>
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}

      {/* Bottom peek sheet */}
      <BottomSheet
        visible={selectedListing !== null}
        onDismiss={() => setSelectedListing(null)}
        height={260}
      >
        {selectedListing && (
          <View style={styles.sheetContent}>
            <ListingCard
              listing={selectedListing}
              onPress={handleDetailPress}
            />

            <View style={styles.sheetActions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleDetailPress}
              >
                <Text style={styles.secondaryButtonText}>Details</Text>
              </Pressable>

              <Pressable
                style={styles.primaryButton}
                onPress={handleBookingPress}
              >
                <Text style={styles.primaryButtonText}>Request booking</Text>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.abyss,
  },

  webMapPlaceholder: {
    backgroundColor: '#0d0d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    paddingTop: 140,
  },
  webMapLabel: {
    position: 'absolute',
    bottom: 80,
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 1,
  },

  searchContainer: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(19,19,24,0.92)',
    borderRadius: radii.sheet,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    padding: 0,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(12,12,15,0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.forgeDim,
    borderColor: colors.forge,
  },
  chipText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.forge,
  },

  radiusDropdown: {
    position: 'absolute',
    top: '100%' as any,
    left: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    zIndex: 20,
    minWidth: 100,
  },
  radiusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  radiusOptionActive: {
    backgroundColor: colors.forgeDim,
  },
  radiusOptionText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  radiusOptionTextActive: {
    color: colors.forge,
  },

  userLocationContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.25)',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: colors.white,
  },

  recenterButton: {
    position: 'absolute',
    right: spacing.base,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },

  countBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 5,
  },
  countText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  sheetContent: {
    flex: 1,
    gap: spacing.base,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: colors.forge,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  },
});
