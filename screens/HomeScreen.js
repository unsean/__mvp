import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, FlatList, ScrollView, StyleSheet, Dimensions, Animated, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import SmartSearchBar from '../components/molecules/SmartSearchBar';
import TrendingCarousel from '../components/organisms/TrendingCarousel';
import FriendsActivity from '../components/organisms/FriendsActivity';
import * as Location from 'expo-location';
import FilterBar from '../components/molecules/FilterBar';
import FilterChip from '../components/atoms/FilterChip';
import { colors } from '../theme/colors';
import AppButton from '../components/atoms/AppButton';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Toast from '../components/atoms/Toast';
import Header from '../components/molecules/Header';
import SkeletonLoader from '../components/atoms/SkeletonLoader';

const CATEGORIES = [
  { key: 'delivery', label: 'Delivery', icon: 'motorbike' },
  { key: 'reservation', label: 'Reservations', icon: 'calendar-check' },
  { key: 'takeout', label: 'Takeout', icon: 'food-variant' },
  { key: 'promo', label: 'Promos', icon: 'tag' },
  { key: 'cafe', label: 'Cafés', icon: 'coffee' },
  { key: 'family', label: 'Family', icon: 'account-group' },
];
const TOP_PICKS = [
  { id: 1, name: 'Nasi Goreng Your Area', cuisine: 'Indonesian', price: 'Rp 35K', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Bakmi GM', cuisine: 'Chinese', price: 'Rp 28K', img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Sate Khas Senayan', cuisine: 'Indonesian', price: 'Rp 50K', img: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80' },
];

const { width } = Dimensions.get('window');

const HomeSkeletonLoader = () => (
  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* Search bar skeleton */}
      <SkeletonLoader height={50} borderRadius={25} style={{ marginBottom: 20 }} />
      
      {/* Trending carousel skeleton */}
      <View style={{ marginBottom: 24 }}>
        <SkeletonLoader width={120} height={24} style={{ marginBottom: 12 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={{ marginRight: 16, width: width * 0.8 }}>
              <SkeletonLoader height={160} borderRadius={18} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="60%" height={16} style={{ marginBottom: 4 }} />
              <SkeletonLoader width="40%" height={14} />
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Friends activity skeleton */}
      <View style={{ marginBottom: 24 }}>
        <SkeletonLoader width={140} height={24} style={{ marginBottom: 12 }} />
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: 4 }} />
              <SkeletonLoader width="50%" height={14} />
            </View>
          </View>
        ))}
      </View>
      
      {/* Category grid skeleton */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonLoader key={i} width={80} height={80} borderRadius={18} style={{ margin: 8 }} />
        ))}
      </View>
    </View>
  </ScrollView>
);

export default function HomeScreen({ navigation = {} }) {
  // Floating AI Chat Button
  const AIChatButton = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate && navigation.navigate('AIChat')}
      style={{
        position: 'absolute',
        bottom: 32,
        right: 24,
        backgroundColor: '#FFB300',
        borderRadius: 32,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 10,
      }}
      accessibilityLabel="Open AI Chat"
    >
      <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
    </TouchableOpacity>
  );
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  // --- Filter Chip State & Stubs (Material 3, 8px grid) ---

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      // Fetch restaurants near user
      fetchNearbyRestaurants(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchNearbyRestaurants = async (latitude, longitude) => {
    setLoading(true);
    setLocationError(null);
    const start = Date.now();
    try {
      // Mock data instead of API call to prevent network errors
      const data = [
        { id: 1, name: 'Sample Restaurant 1', cuisine: 'Italian', rating: 4.5 },
        { id: 2, name: 'Sample Restaurant 2', cuisine: 'Asian', rating: 4.2 },
        { id: 3, name: 'Sample Restaurant 3', cuisine: 'Mexican', rating: 4.7 }
      ];
      setRestaurants(data);
      const duration = Date.now() - start;
      console.log(`[HomeScreen] /restaurants?latitude=${latitude}&longitude=${longitude} fetched in ${duration}ms`);
    } catch (err) {
      setRestaurants([]);
      setLocationError('Failed to load nearby restaurants.');
      // TODO: Add backend diagnostics/logging for failed nearby restaurants fetch
    } finally {
      setLoading(false);
    }
  };
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const scrollX = new Animated.Value(0);

  // Simulate loading for skeleton
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Animate carousel
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F0' }}>
      <Header title="Go-to-Resto" />
      {/* Feedback Toast */}
      <Toast visible={!!locationError} message={locationError} type="error" />
      {/* Error Message */}
      <ErrorMessage message={locationError} />
      {locationError && (
        <AppButton title="Retry" onPress={() => {
          setLocationError(null);
          setLoading(true);
          (async () => {
            const start = Date.now();
            try {
              // Mock data instead of API call to prevent network errors
              const data = [
                { id: 1, name: 'Sample Restaurant 1', cuisine: 'Italian', rating: 4.5 },
                { id: 2, name: 'Sample Restaurant 2', cuisine: 'Asian', rating: 4.2 },
                { id: 3, name: 'Sample Restaurant 3', cuisine: 'Mexican', rating: 4.7 }
              ];
              setRestaurants(data);
              const duration = Date.now() - start;
              console.log(`[HomeScreen] /restaurants?latitude=${location?.coords?.latitude}&longitude=${location?.coords?.longitude} fetched in ${duration}ms`);
            } catch (err) {
              setRestaurants([]);
              setLocationError('Failed to load nearby restaurants.');
              // TODO: Add backend diagnostics/logging for failed nearby restaurants fetch
            }
            setLoading(false);
          })();
        }} style={{ marginHorizontal: 24, marginBottom: 8 }} />
      )}
      {/* Loading Indicator */}
      {loading && <HomeSkeletonLoader />}
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <SmartSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={fetchNearbyRestaurants}
          onLocationPress={() => Alert.alert('Location', 'Set GPS radius (modal TODO)')}
        />
        {/* Example: Quick Clear for Power Users (Rule 2) */}
        {search.length > 0 && (
          <AppButton title="Clear Search" onPress={() => setSearch('')} style={{ marginTop: 8 }} />
        )}
      </View>

      {/* Trending Carousel */}
      <TrendingCarousel data={TOP_PICKS} onPressItem={item => navigation.navigate && navigation.navigate('RestaurantDetail', { id: item.id })} />
      {/* Friends' Activity Module */}
      <FriendsActivity />
      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        {(CATEGORIES || []).map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={styles.categoryBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate && navigation.navigate('Search', { category: cat.key })}
          >
            <MaterialCommunityIcons name={cat.icon} size={32} color="#FF6F61" />
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <AIChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 18, margin: 18, paddingHorizontal: 14, paddingVertical: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1, fontSize: 17, color: '#222', paddingVertical: 6, paddingHorizontal: 4,
  },
  geoBtn: {
    marginLeft: 6, padding: 8, borderRadius: 22, backgroundColor: '#E0F7FA',
    minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 8,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE0B2', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 2,
    minWidth: 44, minHeight: 44,
  },
  filterLabel: {
    fontSize: 15, color: '#FF6F61', marginLeft: 6, fontWeight: 'bold',
  },
  carouselSkeleton: {
    backgroundColor: '#FFF3E0', borderRadius: 22, height: 180, marginHorizontal: 24, marginTop: 8,
  },
  carouselCard: {
    backgroundColor: '#fff', borderRadius: 22, marginHorizontal: 12, marginTop: 8, elevation: 2, overflow: 'hidden',
    minHeight: 180,
  },
  carouselImg: {
    width: '100%', height: 130,
  },
  carouselInfo: {
    padding: 12,
  },
  carouselDots: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6F61', marginHorizontal: 4,
  },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 16, marginHorizontal: 8,
  },
  categoryBtn: {
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3E0', borderRadius: 18, margin: 8, padding: 14, minWidth: 80, minHeight: 80,
  },
  categoryLabel: {
    fontSize: 14, color: '#FF6F61', marginTop: 6, fontWeight: 'bold',
  },
});
