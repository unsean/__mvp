import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuickActions = ({ onAIChat, onBooking, onFavorites, onSearch }) => {
  const actions = [
    {
      id: 'ai-chat',
      icon: 'chatbubble-ellipses',
      label: 'AI Chat',
      color: '#007AFF',
      onPress: onAIChat,
    },
    {
      id: 'booking',
      icon: 'calendar',
      label: 'Book Table',
      color: '#FF6F61',
      onPress: onBooking,
    },
    {
      id: 'favorites',
      icon: 'heart',
      label: 'Favorites',
      color: '#FF3B30',
      onPress: onFavorites,
    },
    {
      id: 'search',
      icon: 'search',
      label: 'Search',
      color: '#34C759',
      onPress: onSearch,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={action.onPress}
            accessibilityLabel={action.label}
          >
            <Ionicons name={action.icon} size={24} color="#fff" />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
};

export default QuickActions;
