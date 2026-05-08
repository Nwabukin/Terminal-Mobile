import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface AvatarProps {
  uri?: string | null;
  initials?: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export function Avatar({
  uri,
  initials = '??',
  size = 44,
  bgColor = colors.forgeDim,
  fgColor = colors.forgeLight,
}: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initials, { color: fgColor, fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontWeight: '700',
  },
});
