import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function Toast({ visible, message, type = 'info' }) {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.toast, type === 'error' ? styles.error : styles.info]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 999,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#323232',
  },
  error: {
    backgroundColor: '#f44336',
  },
});
