import React from 'react';
import { View, Text } from 'react-native';

const MOCK = [
  { label: 'Booked "Sate Khas Senayan"', date: '2025-06-18', desc: 'Dinner with friends.' },
  { label: 'Reviewed "Bebek Kaleyo"', date: '2025-06-16', desc: '5 stars!' },
  { label: 'Favorited "Bakmi GM"', date: '2025-06-13', desc: '' },
];

export default function ActivityTimeline({ activities = MOCK }) {
  return (
    <View style={{ marginTop: 8, marginBottom: 18 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222', marginLeft: 8, marginBottom: 8 }}>Recent Activity</Text>
      {activities.map((a, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f3f3' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6F61', marginRight: 12 }} />
          <View>
            <Text style={{ fontWeight: 'bold', color: '#333' }}>{a.label}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{a.date}</Text>
            {a.desc ? <Text style={{ color: '#888', fontSize: 12 }}>{a.desc}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
