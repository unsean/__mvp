import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserStats = ({ stats }) => {
  const statItems = [
    {
      key: 'bookings',
      label: 'Bookings',
      value: stats?.bookings || 0,
      icon: 'calendar',
      color: '#007AFF',
    },
    {
      key: 'reviews',
      label: 'Reviews',
      value: stats?.reviews || 0,
      icon: 'star',
      color: '#FF6F61',
    },
    {
      key: 'favorites',
      label: 'Favorites',
      value: stats?.favorites || 0,
      icon: 'heart',
      color: '#FF3B30',
    },
    {
      key: 'loyalty',
      label: 'Points',
      value: stats?.loyalty || 0,
      icon: 'trophy',
      color: '#FFB300',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      <View style={styles.statsGrid}>
        {statItems.map((item) => (
          <View key={item.key} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
};

export default UserStats;
