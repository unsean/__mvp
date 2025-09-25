import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SkeletonLoader() {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  // Shimmer style
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View>
      {[...Array(6)].map((_, i) => (
        <Animatable.View key={i} animation="fadeIn" delay={i * 80} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonImage}>
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            <View style={styles.skeletonTextBlock}>
              <View style={styles.skeletonText}>
                <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
              </View>
              <View style={styles.skeletonTextSmall}>
                <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
              </View>
              <View style={styles.skeletonTextRow}>
                <View style={styles.skeletonTextSmall}>
                  <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
                </View>
                <View style={styles.skeletonTextSmall}>
                  <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
                </View>
              </View>
            </View>
          </View>
        </Animatable.View>
      ))}
      {/* TODO: shimmer variant for special branding */}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: { height: 62, borderRadius: 16, backgroundColor: '#f3f3f3', marginBottom: 14, overflow: 'hidden' },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', height: 62, padding: 12 },
  skeletonImage: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#eee', marginRight: 12, overflow: 'hidden' },
  skeletonTextBlock: { flex: 1, justifyContent: 'center' },
  skeletonText: { height: 14, backgroundColor: '#e6e6e6', borderRadius: 6, marginBottom: 8, width: '70%', overflow: 'hidden' },
  skeletonTextSmall: { height: 10, backgroundColor: '#ececec', borderRadius: 5, marginBottom: 4, width: '40%', overflow: 'hidden' },
  skeletonTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
});
