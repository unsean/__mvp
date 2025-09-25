import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Animated, SafeAreaView, Image } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

import { Modal, TextInput } from 'react-native';

const SkeletonLoader = () => (
  <ScrollView style={{ flex: 1, padding: 18 }}>
    <View style={{ height: 180, backgroundColor: '#eee', borderRadius: 18, marginBottom: 20 }} />
    {[...Array(2)].map((_, i) => (
      <View key={i} style={{ height: 30, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12, width: '60%' }} />
    ))}
    <View style={{ height: 120, backgroundColor: '#eee', borderRadius: 12, marginBottom: 20 }} />
    <Text style={{ marginBottom: 8, color: '#bbb', fontWeight: 'bold' }}>Menu</Text>
    {[...Array(3)].map((_, i) => (
      <View key={i} style={{ height: 50, backgroundColor: '#eee', borderRadius: 10, marginBottom: 10 }} />
    ))}
    <Text style={{ marginBottom: 8, color: '#bbb', fontWeight: 'bold' }}>Reviews</Text>
    {[...Array(2)].map((_, i) => (
      <View key={i} style={{ height: 60, backgroundColor: '#eee', borderRadius: 10, marginBottom: 10 }} />
    ))}
  </ScrollView>
);

export default function RestaurantDetailScreen({ route, navigation }) {
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [stickyAnim] = useState(new Animated.Value(0));
  const handleExpandGallery = () => setGalleryExpanded((v) => !v);
  const handleStickyShow = () => Animated.timing(stickyAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  const handleStickyHide = () => Animated.timing(stickyAnim, { toValue: 0, duration: 400, useNativeDriver: false }).start();
  const { id } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [restStats, setRestStats] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError && setError(null);
      const start = Date.now();
      try {
        const [r, m, rv, favs, stats] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/menu_items`, { params: { restaurant_id: id } }).catch(() => ({ data: [] })),
          api.get(`/reviews/restaurant/${id}`).catch(() => ({ data: [] })),
          api.get('/social/favorites').catch(() => ({ data: [] })),
          api.get(`/analytics/restaurant/${id}`),
        ]);
        setRestaurant(r.data);
        setMenu(m.data || []);
        setReviews((rv.data || []).map(r => ({ ...r, is_mine: r.user_id === (user && user.id) })));
        setIsFavorite(Array.isArray(favs.data) && favs.data.some(f => f.id === Number(id)));
        setRestStats(stats.data);
        const duration = Date.now() - start;
        console.log(`[RestaurantDetailScreen] All data fetched in ${duration}ms`);
      } catch (e) {
        setRestaurant(null);
        setError && setError('Failed to load restaurant details. Please try again.');
        // TODO: Add backend diagnostics/logging for failed restaurant details fetch
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Add or edit review
  const handleSaveReview = async () => {
    try {
      if (editReview) {
        await api.put(`/reviews/${editReview.id}`, { rating: reviewRating, comment: reviewComment });
      } else {
        await api.post(`/reviews`, { restaurant_id: id, rating: reviewRating, comment: reviewComment });
      }
      setShowAddReview(false);
      setEditReview(null);
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews
      const rv = await api.get(`/reviews/restaurant/${id}`);
      setReviews((rv.data || []).map(r => ({ ...r, is_mine: r.user_id === (user && user.id) })));
    } catch {}
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      const rv = await api.get(`/reviews/restaurant/${id}`);
      setReviews((rv.data || []).map(r => ({ ...r, is_mine: r.user_id === (user && user.id) })));
    } catch {}
  };

  // Like/upvote review
  const likeReview = async (reviewId) => {
    try {
      await api.post(`/reviews/like/${reviewId}`);
      const rv = await api.get(`/reviews/restaurant/${id}`);
      setReviews((rv.data || []).map(r => ({ ...r, is_mine: r.user_id === (user && user.id) })));
    } catch {}
  };

  // Start editing a review
  const startEditReview = (review) => {
    setEditReview(review);
    setReviewComment(review.comment);
    setReviewRating(review.rating);
    setShowAddReview(true);
  };


  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" />;
  if (!restaurant) return <Text style={{ margin: 40 }}>Restaurant not found.</Text>;

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.post('/social/unfavorite', { restaurant_id: id });
        setIsFavorite(false);
      } else {
        await api.post('/social/favorite', { restaurant_id: id });
        setIsFavorite(true);
      }
    } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? '#e63946' : '#888'}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.desc}>{restaurant.cuisine} • {restaurant.price} • {restaurant.address}</Text>
      {restStats && (
        <Animatable.View {...slideInUp} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginVertical: 12, ...shadow.card }}>
          <Text style={{ color: colors.text }}>Bookings: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{restStats.bookings}</Text></Text>
          <Text style={{ color: colors.text }}>Reviews: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{restStats.reviews}</Text></Text>
          <Text style={{ color: colors.text }}>Avg Rating: <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>{restStats.avg_rating ? Number(restStats.avg_rating).toFixed(1) : 'N/A'}</Text></Text>
        </Animatable.View>
      )}
      {/* Map View */}
      <View style={{ height: 180, marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          pointerEvents="none"
        >
          <Marker
            coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
            title={restaurant.name}
            description={restaurant.address}
          />
        </MapView>
      </View>
      <TouchableOpacity
        style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
        onPress={() => {
          const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
          Linking.openURL(url);
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Get Directions</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Menu</Text>
      <FlatList
        data={menu}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuPrice}>${item.price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No menu items.</Text>}
        scrollEnabled={false}
      />

      <Text style={styles.section}>Reviews ({reviews.length})</Text>
      <TouchableOpacity style={styles.addReviewBtn} onPress={() => setShowAddReview(true)}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Review</Text>
      </TouchableOpacity>
      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.reviewUser}>{item.user_name}</Text>
              <TouchableOpacity onPress={() => likeReview(item.id)} style={{ marginLeft: 10 }}>
                <Ionicons name="thumbs-up" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={{ marginLeft: 4 }}>{item.likes || 0}</Text>
              {item.is_mine && (
                <>
                  <TouchableOpacity onPress={() => startEditReview(item)} style={{ marginLeft: 10 }}>
                    <Ionicons name="create-outline" size={20} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteReview(item.id)} style={{ marginLeft: 6 }}>
                    <Ionicons name="trash" size={20} color="#e63946" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
            <Text style={styles.reviewText}>{item.comment}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No reviews yet.</Text>}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('Booking', { id: restaurant.id })}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Book a Table</Text>
      </TouchableOpacity>

      {/* Add/Edit Review Modal */}
      <Modal visible={showAddReview} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>{editReview ? 'Edit Review' : 'Add Review'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Your comment"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={{ fontSize: 22, color: reviewRating >= star ? '#FFD700' : '#ccc' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSaveReview}>
                <Text style={{ color: '#fff' }}>{editReview ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setShowAddReview(false); setEditReview(null); }}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  desc: { color: '#555', marginBottom: 16 },
  section: { fontSize: 20, marginTop: 24, marginBottom: 8, fontWeight: '600' },
  menuItem: { marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  menuName: { fontWeight: 'bold', fontSize: 16 },
  menuDesc: { color: '#666' },
  menuPrice: { color: '#007AFF', fontWeight: 'bold' },
  review: { marginBottom: 10, backgroundColor: '#f7f7f7', borderRadius: 6, padding: 8 },
  reviewUser: { fontWeight: 'bold' },
  reviewRating: { color: '#FFA500' },
  reviewComment: { color: '#333' },
  bookBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
