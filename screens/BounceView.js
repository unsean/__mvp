import React from 'react';
import { Animated, Easing } from 'react-native';

export default function BounceView({ children, duration = 350, style = {}, ...props }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.13,
        duration: duration * 0.4,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}
