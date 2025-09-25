import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

/**
 * NetworkStatusBanner displays network connectivity status across the app
 * It appears when network status changes and automatically hides after a delay
 */
export default function NetworkStatusBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = new Animated.Value(-60);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      if (connected !== isConnected) {
        setIsConnected(connected);
        showBanner();
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  const showBanner = () => {
    // Show banner
    setIsVisible(true);
    
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    // Auto hide after 3 seconds for "connected" status
    // Keep visible if disconnected
    if (isConnected) {
      setTimeout(() => {
        hideBanner();
      }, 3000);
    }
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.banner,
        isConnected ? styles.connectedBanner : styles.disconnectedBanner,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Ionicons 
        name={isConnected ? 'wifi' : 'wifi-off'} 
        size={16} 
        color={isConnected ? '#fff' : '#fff'} 
        style={styles.icon} 
      />
      <Text style={styles.text}>
        {isConnected ? 'Internet connection restored' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  connectedBanner: {
    backgroundColor: '#4CAF50',
  },
  disconnectedBanner: {
    backgroundColor: '#F44336',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
