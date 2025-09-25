import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';
import { Animatable, fadeIn } from '../theme/animations';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const SkeletonLoader = () => (
  <View style={{ marginTop: 40 }}>
    {[...Array(5)].map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', marginRight: 12 }} />
        <View style={{ flex: 1, height: 20, borderRadius: 8, backgroundColor: '#eee' }} />
        <View style={{ width: 80, height: 32, borderRadius: 8, backgroundColor: '#eee', marginLeft: 12 }} />
      </View>
    ))}
  </View>
);

export default function SocialScreen() {
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestions();
    fetchFollowing();
    fetchFollowers();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      const res = await api.get('/social/suggestions');
      setSuggestions(res.data);
      const duration = Date.now() - start;
    } catch (e) {
      setSuggestions([]);
      setError('Failed to load suggestions. Please try again.');
      // TODO: Add backend diagnostics/logging for failed suggestions fetch
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get('/social/following');
      setFollowing(res.data);
    } catch (e) {
      setFollowing([]);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await api.get('/social/followers');
      setFollowers(res.data);
    } catch (e) {
      setFollowers([]);
    }
  };

  const toggleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.post('/social/unfollow', { follow_user_id: userId });
        setFollowing(following.filter(u => u.id !== userId));
      } else {
        await api.post('/social/follow', { follow_user_id: userId });
        setFollowing([...following, suggestions.find(u => u.id === userId)]);
      }
      // Optionally refresh following/followers
      fetchFollowing();
      fetchFollowers();
    } catch {}
  };


  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.header}>People You May Know</Text>
      {error && (
        <AppButton title="Retry" onPress={fetchSuggestions} style={{ marginHorizontal: 24, marginBottom: 8 }} />
      )}
      {loading ? <SkeletonLoader /> : (
        <FlatList
          data={suggestions}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Ionicons name="person-circle" size={36} color="#888" style={{ marginRight: 12 }} />
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => toggleFollow(item.id, following.some(u => u.id === item.id))}
                accessibilityLabel={following.some(u => u.id === item.id) ? 'Unfollow user' : 'Follow user'}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{following.some(u => u.id === item.id) ? 'Unfollow' : 'Follow'}</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>👥</Text>
              <Text style={{ color: '#888', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No suggestions right now</Text>
              <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>Check back later or invite friends to join!</Text>
            </View>
          }
          onRefresh={fetchSuggestions}
          refreshing={loading}
        />
      )}
      <Text style={styles.header}>Following ({following.length})</Text>
      <FlatList
        data={following}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Ionicons name="person-circle" size={36} color="#888" style={{ marginRight: 12 }} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>Not following anyone yet.</Text>}
      />
      <Text style={styles.header}>Followers ({followers.length})</Text>
      <FlatList
        data={followers}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Ionicons name="person-circle" size={36} color="#888" style={{ marginRight: 12 }} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>No followers yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  name: { flex: 1, fontSize: 16 },
  followBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});
