import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  IconSearch,
  IconChevronDown,
  IconCircleFilled,
  IconCurrentLocation,
} from '@tabler/icons-react-native';

import { colors, spacing, radii } from '../../theme';
import { fetchMapListings } from '../../api/search';
import { useLocation } from '../../hooks/useLocation';
import { TerminalMap } from '../../components/map';
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

interface MapScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const { latitude, longitude, loading: locationLoading } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SearchResult | null>(null);

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
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedListing(null);
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
    // Recenter handled by TerminalMap on native
  }, []);

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
      {/* MapLibre + OSM/CARTO tiles (native) or dark placeholder (web) */}
      <TerminalMap
        latitude={latitude}
        longitude={longitude}
        listings={filteredListings}
        selectedListingId={selectedListing?.id ?? null}
        onMarkerPress={handleMarkerPress}
        onMapPress={handleMapPress}
      />

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
