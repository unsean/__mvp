import React from 'react';
import { View, Text } from 'react-native';

const MOCK = [
  { label: 'Reviews', value: 12 },
  { label: 'Bookings', value: 5 },
  { label: 'Favorites', value: 7 },
];

export default function StatChart({ stats }) {
  let displayStats = Array.isArray(stats) ? stats : MOCK;
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, marginTop: 8 }}>
      <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 }}>Your Stats</Text>
      {displayStats.map((s, idx) => (
        <View key={idx} style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{s.label}</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: '#FFB300', width: `${Math.max(10, s.value * 12)}%` }} />
        </View>
      ))}
    </View>
  );
}
