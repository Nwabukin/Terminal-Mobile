import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';

import { colors } from '../../theme';
import { MapPin } from '../MapPin';
import type { TerminalMapProps } from './types';
import { GOOGLE_DARK_MAP_STYLE } from './googleDarkMapStyle';

export function TerminalMap({
  latitude,
  longitude,
  listings,
  selectedListingId,
  onMarkerPress,
  onMapPress,
}: TerminalMapProps) {
  const initialCamera = useMemo(
    () => ({
      center: { latitude, longitude },
      pitch: 0,
      heading: 0,
      zoom: 11,
    }),
    [latitude, longitude],
  );

  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      if (e.nativeEvent.action === 'marker-press') {
        return;
      }
      onMapPress();
    },
    [onMapPress],
  );

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialCamera={initialCamera}
      onPress={handleMapPress}
      customMapStyle={Platform.OS === 'android' ? GOOGLE_DARK_MAP_STYLE : undefined}
      userInterfaceStyle="dark"
      rotateEnabled
      pitchEnabled={false}
      showsCompass={false}
      toolbarEnabled={false}
      mapType="standard"
    >
      <Marker
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
        zIndex={1}
      >
        <View style={styles.userLocationContainer}>
          <View style={styles.userLocationPulse} />
          <View style={styles.userLocationDot} />
        </View>
      </Marker>

      {listings.map((listing) => (
        <Marker
          key={listing.id}
          coordinate={{
            latitude: listing.latitude,
            longitude: listing.longitude,
          }}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges
          onPress={() => onMarkerPress(listing)}
          zIndex={selectedListingId === listing.id ? 3 : 2}
        >
          <MapPin
            resourceType={listing.resource_type}
            priceDaily={listing.price_daily}
            isSelected={selectedListingId === listing.id}
          />
        </Marker>
      ))}
    </MapView>
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
