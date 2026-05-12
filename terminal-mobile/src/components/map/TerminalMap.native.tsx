import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native';
import { Map, Camera, Marker, type PressEvent } from '@maplibre/maplibre-react-native';

import { colors } from '../../theme';
import { MapPin } from '../MapPin';
import type { TerminalMapProps } from './types';
import { TERMINAL_MAPLIBRE_STYLE } from './terminalMaplibreStyle';

export function TerminalMap({
  latitude,
  longitude,
  listings,
  selectedListingId,
  onMarkerPress,
  onMapPress,
}: TerminalMapProps) {
  const userLngLat = useMemo(
    (): [number, number] => [longitude, latitude],
    [latitude, longitude],
  );

  const handleMapPress = useCallback(
    (_e: NativeSyntheticEvent<PressEvent>) => {
      onMapPress();
    },
    [onMapPress],
  );

  return (
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={TERMINAL_MAPLIBRE_STYLE}
      onPress={handleMapPress}
      androidView="texture"
      touchPitch={false}
      compass={false}
      scaleBar={false}
    >
      <Camera
        key={`${latitude.toFixed(5)}-${longitude.toFixed(5)}`}
        initialViewState={{
          center: userLngLat,
          zoom: 11,
          pitch: 0,
          bearing: 0,
        }}
      />

      {/*
        Listing markers must come before the user marker: on Android, MapLibre's
        hit test walks markers in registration order and returns the first match.
        Registering the user dot first could steal taps when hit rects overlap.
      */}
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          id={listing.id}
          lngLat={[listing.longitude, listing.latitude]}
          anchor="bottom"
          style={{ zIndex: selectedListingId === listing.id ? 20 : 10 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open listing ${listing.title}`}
            hitSlop={12}
            onPress={() => onMarkerPress(listing)}
            style={styles.pinPressable}
          >
            <MapPin
              resourceType={listing.resource_type}
              priceDaily={listing.price_daily}
              isSelected={selectedListingId === listing.id}
            />
          </Pressable>
        </Marker>
      ))}

      <Marker id="user-location" lngLat={userLngLat} anchor="center" style={{ zIndex: 30 }}>
        <View style={styles.userLocationContainer}>
          <View style={styles.userLocationPulse} />
          <View style={styles.userLocationDot} />
        </View>
      </Marker>
    </Map>
  );
}

const styles = StyleSheet.create({
  pinPressable: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
});
