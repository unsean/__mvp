import React from 'react';
import { View, Text } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

export default function ReviewsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24 }}>
      <MaterialIcons name="rate-review" size={64} color="#FF6F61" style={{ marginBottom: 18 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF6F61', marginBottom: 8 }}>No Reviews Yet</Text>
      <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>
        Once you visit and rate a restaurant, your reviews will appear here!
      </Text>
    </View>
  );
}
