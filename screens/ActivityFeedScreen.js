import React from 'react';
import { View, Text } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ActivityFeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24 }}>
      <MaterialCommunityIcons name="timeline-clock-outline" size={64} color="#FF6F61" style={{ marginBottom: 18 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF6F61', marginBottom: 8 }}>No Activity Yet</Text>
      <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>
        When you make bookings, reviews, or favorites, your activity will show up here.
      </Text>
    </View>
  );
}
