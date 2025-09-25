import React from 'react';
import { View, Text } from 'react-native';

import { AntDesign } from '@expo/vector-icons';

export default function ForYouScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24 }}>
      <AntDesign name="heart" size={64} color="#FF6F61" style={{ marginBottom: 18 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF6F61', marginBottom: 8 }}>No Recommendations Yet</Text>
      <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>
        Once we learn your tastes, you’ll see personalized picks here!
      </Text>
    </View>
  );
}
