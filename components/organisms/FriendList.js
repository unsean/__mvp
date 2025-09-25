import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

// Mock data for demo
const FRIENDS = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', online: true },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', online: false },
  { id: 3, name: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', online: true },
];

export default function FriendList({ data = FRIENDS, onChat }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Friends List</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onChat && onChat(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              {item.online && <Ionicons name="ellipse" size={10} color={colors.success} style={{ marginLeft: 6 }} />}
            </View>
            <Text style={styles.chatBtn}>Chat</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 12,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: fontSizes.lg,
    color: colors.secondary,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 14,
    width: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  name: {
    fontWeight: 'bold', fontSize: fontSizes.md, color: colors.text,
  },
  chatBtn: {
    color: colors.primary, fontWeight: 'bold', fontSize: 13, marginTop: 2,
  },
});
