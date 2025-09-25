import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

// Mock data for demo
const CHATS = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'See you at 7!', unread: 2 },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', lastMessage: 'Let’s grab lunch', unread: 0 },
  { id: 3, name: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', lastMessage: 'Awesome!', unread: 1 },
];

export default function ChatList({ data = CHATS, onOpenChat }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Chats</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onOpenChat && onOpenChat(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.texts}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
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
    width: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    position: 'relative',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, marginBottom: 8,
  },
  texts: {
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold', fontSize: fontSizes.md, color: colors.text,
  },
  lastMessage: {
    color: colors.muted, fontSize: 13, marginTop: 2, maxWidth: 90,
  },
  unreadBadge: {
    backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, position: 'absolute', top: 10, right: 10,
  },
  unreadText: {
    color: '#fff', fontWeight: 'bold', fontSize: 11,
  },
});
