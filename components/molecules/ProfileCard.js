import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function ProfileCard({ user, onEdit }) {
  if (!user) return (
    <View style={{ alignItems: 'center', marginTop: 48 }}>
      <Text style={{ color: '#888', fontSize: 16 }}>Not logged in.</Text>
    </View>
  );
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 18 }}>
      <Image source={user.avatar ? { uri: user.avatar } : require('../../assets/avatar-placeholder.png')} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10, backgroundColor: '#eee' }} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 4 }}>{user.name || 'No Name'}</Text>
      <Text style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>{user.email || 'No Email'}</Text>
      {onEdit && (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFB300', marginTop: 6 }} onPress={onEdit}>
          <Text style={{ color: '#FFB300', fontWeight: 'bold' }}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
