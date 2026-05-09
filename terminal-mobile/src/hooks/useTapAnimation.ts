import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useReduceMotion } from './useReduceMotion';

export function useTapAnimation() {
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!reduceMotion) {
      scale.value = withTiming(0.97, { duration: 80 });
    }
  };

  const onPressOut = () => {
    if (!reduceMotion) {
      scale.value = withTiming(1, { duration: 80 });
    }
  };

  return { animatedStyle, onPressIn, onPressOut };
}
