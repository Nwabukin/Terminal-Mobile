import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme';

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  height?: number;
}

export function BottomSheet({
  visible,
  onDismiss,
  children,
  height = 260,
}: BottomSheetProps) {
  const translateY = useSharedValue(height + 40);
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      translateY.value = withSpring(height + 40, SPRING_CONFIG);
    }
  }, [visible, height, translateY]);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = context.value + event.translationY;
      translateY.value = Math.max(0, next);
    })
    .onEnd((event) => {
      if (event.translationY > height * 0.3 || event.velocityY > 500) {
        translateY.value = withSpring(height + 40, SPRING_CONFIG);
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, height + 40],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.sheet, { height }, sheetStyle]}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderActive,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
});
