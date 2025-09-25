import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';

export default function BadgeScroller({ badges = [] }) {
  return (
    <View style={{ marginTop: 10, marginBottom: 18 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222', marginLeft: 16, marginBottom: 8 }}>Badges</Text>
      <FlatList
        horizontal
        data={badges}
        keyExtractor={(_, idx) => String(idx)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ alignItems: 'center', marginRight: 18, backgroundColor: '#fff', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
            <Image source={item.icon} style={{ width: 36, height: 36, marginBottom: 6 }} />
            <Text style={{ fontSize: 13, color: '#222', fontWeight: 'bold' }}>{item.label}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}
