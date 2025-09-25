import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

// Mock data for demo
const FRIENDS_ACTIVITY = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', action: 'favorited', target: 'Bakmi GM', time: '2m' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', action: 'reviewed', target: 'Sate Khas Senayan', time: '10m' },
  { id: 3, name: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', action: 'booked', target: 'Nasi Goreng Legend', time: '25m' },
  { id: 4, name: 'Waterson', avatar: 'https://randomuser.me/api/portraits/men/99.jpg', action: 'reviewed', target: 'Mie Lendir', time: '40m' },
];

export default function FriendsActivity({ data = FRIENDS_ACTIVITY }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Friends' Activity</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.texts}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.action}>{actionText(item)}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

function actionText(item) {
  switch (item.action) {
    case 'favorited':
      return `favorited ${item.target}`;
    case 'reviewed':
      return `reviewed ${item.target}`;
    case 'booked':
      return `booked a table at ${item.target}`;
    default:
      return `${item.action} ${item.target}`;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginRight: 16,
    elevation: 2,
    minWidth: 180,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  texts: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: 2,
  },
  action: {
    color: colors.muted,
    fontSize: fontSizes.sm,
  },
  time: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
    marginLeft: 8,
  },
});
