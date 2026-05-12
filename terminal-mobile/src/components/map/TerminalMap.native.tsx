import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, type NativeSyntheticEvent } from 'react-native';
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

      <Marker id="user-location" lngLat={userLngLat} anchor="center">
        <View style={styles.userLocationContainer}>
          <View style={styles.userLocationPulse} />
          <View style={styles.userLocationDot} />
        </View>
      </Marker>

      {listings.map((listing) => (
        <Marker
          key={listing.id}
          id={listing.id}
          lngLat={[listing.longitude, listing.latitude]}
          anchor="bottom"
          onPress={() => onMarkerPress(listing)}
        >
          <MapPin
            resourceType={listing.resource_type}
            priceDaily={listing.price_daily}
            isSelected={selectedListingId === listing.id}
          />
        </Marker>
      ))}
    </Map>
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
