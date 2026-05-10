import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme';
import { MapPin } from '../MapPin';
import { MAPBOX_ACCESS_TOKEN } from '../../utils/constants';
import type { TerminalMapProps } from './types';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const FORGE_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function TerminalMap({
  latitude,
  longitude,
  listings,
  selectedListingId,
  onMarkerPress,
  onMapPress,
}: TerminalMapProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);

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

  const handlePress = useCallback(() => {
    onMapPress();
  }, [onMapPress]);

  return (
    <Mapbox.MapView
      style={StyleSheet.absoluteFill}
      styleURL={FORGE_DARK_STYLE}
      onPress={handlePress}
      attributionEnabled={false}
      logoEnabled={false}
      compassEnabled={false}
      scaleBarEnabled={false}
      // GLSurfaceView (surfaceView default) often stays black under React Navigation + edge-to-edge; TextureView works.
      {...(Platform.OS === 'android' ? { surfaceView: false } : {})}
    >
      <Mapbox.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [longitude, latitude],
          zoomLevel: 11,
        }}
        animationDuration={300}
      />

      {/* User location dot */}
      <Mapbox.PointAnnotation
        id="user-location"
        coordinate={[longitude, latitude]}
      >
        <View style={styles.userLocationContainer}>
          <Animated.View style={[styles.userLocationPulse, pulseStyle]} />
          <View style={styles.userLocationDot} />
        </View>
      </Mapbox.PointAnnotation>

      {/* Listing markers */}
      {listings.map((listing) => (
        <Mapbox.PointAnnotation
          key={listing.id}
          id={`listing-${listing.id}`}
          coordinate={[listing.longitude, listing.latitude]}
          onSelected={() => onMarkerPress(listing)}
        >
          <MapPin
            resourceType={listing.resource_type}
            priceDaily={listing.price_daily}
            isSelected={selectedListingId === listing.id}
          />
        </Mapbox.PointAnnotation>
      ))}
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({
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
});
