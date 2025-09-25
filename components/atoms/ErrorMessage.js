import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ErrorMessage({ message, style }) {
  if (!message) return null;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffeaea',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
  },
  text: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: 15,
  },
});
