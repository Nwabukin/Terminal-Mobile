import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { MapPin } from '../MapPin';
import type { TerminalMapProps } from './types';

export function TerminalMap({
  latitude,
  longitude,
  listings,
  selectedListingId,
  onMarkerPress,
  onMapPress,
}: TerminalMapProps) {
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

  return (
    <Pressable style={styles.container} onPress={onMapPress}>
      {/* Dark map background with grid lines */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 12}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16}%` as any }]} />
        ))}
      </View>

      {/* Scatter listing pins */}
      <View style={styles.pinsContainer}>
        {listings.map((listing, idx) => {
          const angle = (idx / Math.max(listings.length, 1)) * 2 * Math.PI;
          const r = 60 + (idx % 3) * 40;
          const cx = 50 + Math.cos(angle) * (r / 4);
          const cy = 45 + Math.sin(angle) * (r / 4);
          return (
            <Pressable
              key={listing.id}
              style={[styles.pinWrapper, { left: `${cx}%` as any, top: `${cy}%` as any }]}
              onPress={() => onMarkerPress(listing)}
            >
              <MapPin
                resourceType={listing.resource_type}
                priceDaily={listing.price_daily}
                isSelected={selectedListingId === listing.id}
              />
            </Pressable>
          );
        })}
      </View>

      {/* User location dot */}
      <View style={styles.userDotContainer}>
        <Animated.View style={[styles.userPulse, pulseStyle]} />
        <View style={styles.userDot} />
      </View>

      {/* Coords label */}
      <Text style={styles.coordsLabel}>
        LAGOS · {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
      </Text>

      <Text style={styles.attribution}>Maps · web preview</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d12',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(42,42,54,0.3)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(42,42,54,0.2)',
  },
  pinsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -12 }],
  },
  userDotContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.25)',
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
  },
  coordsLabel: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  attribution: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    color: 'rgba(82,82,106,0.5)',
  },
});
