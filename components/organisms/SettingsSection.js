import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';

export default function SettingsSection({ settings = [], onToggle, onLogout }) {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, marginTop: 8 }}>
      <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 }}>Settings</Text>
      {settings.map((s, idx) => (
        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f3f3' }}>
          <Text style={{ fontSize: 15, color: '#333' }}>{s.label}</Text>
          {s.type === 'switch' ? (
            <Switch value={!!s.value} onValueChange={() => onToggle && onToggle(s.key)} />
          ) : (
            <TouchableOpacity onPress={s.action} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: '#FFB300' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={onLogout} style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6F61', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
