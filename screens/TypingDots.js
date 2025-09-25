import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function TypingDots({ size = 8, color = '#888', style = {} }) {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          })
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', height: size * 2 }, style]}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginHorizontal: size / 4,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -size / 2] }) }],
          }}
        />
      ))}
    </View>
  );
}
