import React, { useContext } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';

export default function AuthStateBanner({ onRetry }) {
  const { user, isSignedIn, loading, error } = useAuthContext();

  if (loading) {
    return (
      <View style={styles.centered}>
        {/* Replace with food-themed animation if you like */}
        <ActivityIndicator size="large" color="#ff7043" />
        <Text style={styles.loadingText}>Loading your foodie profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && <Button title="Retry" onPress={onRetry} color="#ff7043" />}
      </View>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.ctaTitle}>Sign in to unlock food perks!</Text>
        <Text style={styles.ctaSubtitle}>Access your profile, reviews, and more.</Text>
        {/* You can add navigation to Login/Signup here if needed */}
      </View>
    );
  }

  // If user exists, render nothing (let profile content show)
  return null;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff7043',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff7043',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
});
