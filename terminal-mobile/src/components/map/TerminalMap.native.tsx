import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native';
import {
  Map,
  Camera,
  Marker,
  type CameraRef,
  type LngLatBounds,
  type PressEvent,
} from '@maplibre/maplibre-react-native';

import { colors } from '../../theme';
import { MapPin } from '../MapPin';
import type { TerminalMapProps } from './types';
import { TERMINAL_MAPLIBRE_STYLE } from './terminalMaplibreStyle';

function computeListingsBounds(
  items: { latitude: number; longitude: number }[],
): LngLatBounds {
  let minLng = items[0].longitude;
  let maxLng = minLng;
  let minLat = items[0].latitude;
  let maxLat = minLat;
  for (let i = 1; i < items.length; i++) {
    const l = items[i];
    minLng = Math.min(minLng, l.longitude);
    maxLng = Math.max(maxLng, l.longitude);
    minLat = Math.min(minLat, l.latitude);
    maxLat = Math.max(maxLat, l.latitude);
  }
  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;
  const lngPad = Math.max(lngSpan * 0.15, 0.012);
  const latPad = Math.max(latSpan * 0.15, 0.012);
  return [minLng - lngPad, minLat - latPad, maxLng + lngPad, maxLat + latPad];
}

/** Stable key for listing set + coordinates so camera refits when the filter changes. */
function listingsCameraKey(
  items: { id: string; latitude: number; longitude: number }[],
): string {
  if (items.length === 0) return '';
  return items.map((l) => `${l.id}:${l.latitude.toFixed(5)}:${l.longitude.toFixed(5)}`).join('|');
}

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

  const cameraRef = useRef<CameraRef>(null);
  const [mapReady, setMapReady] = useState(false);
  const cameraTargetKey = useMemo(() => listingsCameraKey(listings), [listings]);

  const handleMapPress = useCallback(
    (_e: NativeSyntheticEvent<PressEvent>) => {
      onMapPress();
    },
    [onMapPress],
  );

  useEffect(() => {
    if (!mapReady) return;
    const id = requestAnimationFrame(() => {
      try {
        if (listings.length > 0) {
          const bounds = computeListingsBounds(listings);
          cameraRef.current?.fitBounds(bounds, {
            padding: { top: 140, bottom: 180, left: 40, right: 40 },
            duration: 550,
            easing: 'ease',
          });
        } else {
          cameraRef.current?.easeTo({
            center: userLngLat,
            zoom: 11,
            pitch: 0,
            bearing: 0,
            duration: 450,
            easing: 'ease',
          });
        }
      } catch {
        /* Camera native handle not ready yet */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [mapReady, cameraTargetKey, listings, userLngLat, latitude, longitude]);

  return (
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={TERMINAL_MAPLIBRE_STYLE}
      onPress={handleMapPress}
      onDidFinishLoadingMap={() => setMapReady(true)}
      androidView="texture"
      touchPitch={false}
      compass={false}
      scaleBar={false}
    >
      <Camera
        ref={cameraRef}
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
