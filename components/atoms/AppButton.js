import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function AppButton({ title, onPress, loading, disabled, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled ? styles.disabled : {}, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6F61',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 2,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
});
