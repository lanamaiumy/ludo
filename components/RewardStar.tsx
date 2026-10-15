import { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibilityInfo, Animated, Platform, StyleSheet } from 'react-native';

type Props = {
  size?: number;
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function RewardStar({ size = 96 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (!active) {
          return;
        }
        if (reduceMotion) {
          opacity.setValue(1);
          scale.setValue(1);
          return;
        }
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      });

    return () => {
      active = false;
    };
  }, [opacity, scale]);

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Estrela de recompensa"
      style={[styles.halo, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75, opacity, transform: [{ scale }] }]}
    >
      <MaterialCommunityIcons name="star" size={size} color="#F5B82E" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4D6',
  },
});
