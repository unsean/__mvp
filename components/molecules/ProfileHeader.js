import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileHeader = ({ user, onEdit }) => {
  return (
    <LinearGradient colors={['#FF6F61', '#FF8A75']} style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={user?.avatar_url ? { uri: user.avatar_url } : require('../../assets/avatar-placeholder.png')} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color="#FF6F61" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = {
  container: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editText: {
    color: '#FF6F61',
    fontWeight: '600',
    marginLeft: 6,
  },
};

export default ProfileHeader;
