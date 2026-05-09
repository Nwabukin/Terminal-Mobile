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

export function SkeletonCard() {
  return (
    <View style={skStyles.card}>
      <SkeletonItem width="100%" height={120} borderRadius={radii.card} />
      <View style={{ marginTop: 12 }}>
        <SkeletonItem width="70%" height={16} />
        <SkeletonItem width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonRow({ lines = 3 }: { lines?: number }) {
  return (
    <View style={skStyles.row}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonItem
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: 8 }}
        />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
