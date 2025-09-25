import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';

const MOCK = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', action: 'favorited', target: 'Bakmi GM', time: '2m' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', action: 'reviewed', target: 'Sate Khas Senayan', time: '10m' },
  { id: 3, name: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', action: 'booked', target: 'Nasi Goreng Your Area', time: '25m' },
];

function actionText(item) {
  switch (item.action) {
    case 'favorited': return `favorited ${item.target}`;
    case 'reviewed': return `reviewed ${item.target}`;
    case 'booked': return `booked at ${item.target}`;
    default: return `${item.action} ${item.target}`;
  }
}

export default function FriendsActivity({ data = MOCK }) {
  return (
    <View style={{ marginTop: 16, marginBottom: 8 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#FF6F61', marginLeft: 16, marginBottom: 8, letterSpacing: 0.5 }}>Friends' Activity</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 12, marginRight: 16, elevation: 2, minWidth: 180 }}>
            <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#222', marginBottom: 2 }}>{item.name}</Text>
              <Text style={{ color: '#888', fontSize: 13 }}>{actionText(item)}</Text>
            </View>
            <Text style={{ color: '#FFB300', fontWeight: 'bold', fontSize: 13, marginLeft: 8 }}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}
