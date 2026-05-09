import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  count?: number;
}

function SkeletonItem({
  width = '100%',
  height = 72,
  borderRadius = radii.card,
  style,
}: Omit<LoadingSkeletonProps, 'count'>) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        skStyles.base,
        { width: width as any, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          skStyles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

export function LoadingSkeleton({ count = 1, ...props }: LoadingSkeletonProps) {
  return (
    <View style={skStyles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} {...props} />
      ))}
    </View>
  );
}

const skStyles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  base: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceHigh,
    opacity: 0.5,
  },
});
