import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function useHaptics() {
  // Usage: call trigger() for light feedback
  const trigger = useCallback((type = 'light') => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      if (type === 'heavy') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, []);
  return trigger;
}
