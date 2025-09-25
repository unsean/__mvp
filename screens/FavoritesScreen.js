import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Share, TouchableOpacity, Linking, Dimensions } from 'react-native';
import Header from '../components/molecules/Header';
import AppButton from '../components/atoms/AppButton';
import RestaurantList from '../components/organisms/RestaurantList';
import SkeletonLoader from '../components/atoms/SkeletonLoader';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function FavoritesScreen({ navigation = {} }) {
  const { favorites, removeFavorite } = useFavorites();
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [localFavorites, setLocalFavorites] = React.useState([]);

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate fetch delay for skeleton
      await new Promise(res => setTimeout(res, 500));
      setLocalFavorites(favorites);
    } catch (e) {
      setError('Failed to load favorites. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await fetchFavorites();
    } catch {
      setError('Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnfavorite = async (id) => {
    setMessage('Removing...');
    try {
      await removeFavorite(id);
      setMessage('Removed from favorites');
      setLocalFavorites(prev => prev.filter(f => f.id !== id));
    } catch {
      setMessage('Failed to remove favorite');
    }
    setTimeout(() => setMessage(''), 1200);
  };

  const handleMap = (item) => {
    if (item.latitude && item.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
      Linking.openURL(url);
    } else {
      setError('No location available for this restaurant');
      setTimeout(() => setError(''), 1800);
    }
  };

  const handleShare = (item) => {
    Share.share({
      message: `${item.name} - ${item.cuisine} • ${item.price}\n${item.address}`
    });
    setMessage('Share dialog opened');
    setTimeout(() => setMessage(''), 1000);
  };

  const FavoritesSkeletonLoader = () => (
    <View style={{ padding: SPACING.md }}>
      {[...Array(4)].map((_, i) => (
        <View key={i} style={{ marginBottom: SPACING.lg }}>
          <SkeletonLoader height={120} borderRadius={BORDER_RADIUS.lg} />
        </View>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Ionicons name="heart-outline" size={64} color={COLORS.primary} style={{ marginBottom: 16 }} />
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyDesc}>Tap the heart on any restaurant to add it to your favorites and see them here!</Text>
      <AppButton title="Explore Restaurants" onPress={() => navigation.navigate && navigation.navigate('Search')} style={{ marginTop: 18, width: 200 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Favorites" />
      {!!message && (
        <View style={styles.toast}><Text style={styles.toastText}>{message}</Text></View>
      )}
      {/* Sticky search/filter bar */}
      <View style={styles.stickyBar}>
        <Text style={styles.stickyTitle}>My Favorites</Text>
        {/* Example filter chip (expand as needed) */}
        <View style={styles.filterRow}>
          <Text style={styles.filterChipActive}>All</Text>
          <Text style={styles.filterChip}>Open Now</Text>
          <Text style={styles.filterChip}>Top Rated</Text>
        </View>
      </View>
      {loading ? (
        <FavoritesSkeletonLoader />
      ) : localFavorites.length === 0 ? (
        <EmptyState />
      ) : (
        <RestaurantList
          restaurants={localFavorites.map(item => ({
            ...item,
            image: item.img || item.image,
            priceRange: item.price,
            reviewCount: item.reviewCount || Math.floor(Math.random() * 500) + 50,
            distance: item.distance || Math.floor(Math.random() * 5000) + 500,
            deliveryTime: item.deliveryTime || Math.floor(Math.random() * 45) + 15,
            deliveryFee: item.deliveryFee !== undefined ? item.deliveryFee : (Math.random() > 0.3 ? Math.floor(Math.random() * 15000) : 0),
            isOpen: item.isOpen !== undefined ? item.isOpen : Math.random() > 0.2,
            promotions: item.promotions || (Math.random() > 0.7 ? ['Free delivery'] : [])
          }))}
          loading={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onRestaurantPress={(restaurant) => {
            navigation.navigate && navigation.navigate('RestaurantDetail', { id: restaurant.id });
          }}
          showDistance={true}
          showDeliveryTime={true}
        />
      )}
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate && navigation.navigate('Search')} accessibilityLabel="Explore more restaurants">
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Soft background gradient */}
      <LinearGradient colors={[COLORS.background, '#FFF7F0']} style={StyleSheet.absoluteFillObject} pointerEvents="none" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5 },
  container: { paddingHorizontal: 16 },
  toast: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignSelf: 'center', marginTop: 14, marginBottom: 2 },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyWrap: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  emptyDesc: { color: COLORS.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 18 },
  stickyBar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface },
  stickyTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.primary, color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});
