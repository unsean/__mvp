import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, Image, Alert, Modal, ScrollView, AccessibilityInfo, findNodeHandle, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';
import { fadeIn } from '../theme/animations';
import api from '../services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

// --- NotificationsScreen: location-based, modern, animated notifications hub ---
// --- Modular components ---
const SkeletonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, [shimmerAnim]);
  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [-1, 1], outputRange: [-200, 200] });
  return (
    <View style={{ padding: 18 }}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={{ height: 62, backgroundColor: '#f3f3f3', borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
        </View>
      ))}
    </View>
  );
};

const EmptyState = () => (
  <View style={{ flex: 1, alignItems: 'center', marginTop: 60 }}>
    {/* TODO: Add mascot or batik illustration */}
    <Ionicons name="notifications-off-circle" size={60} color={colors.muted} style={{ marginBottom: 16 }} />
    <Text style={{ color: colors.muted, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No notifications</Text>
    <Text style={{ color: colors.muted, fontSize: 14 }}>You're all caught up!</Text>
  </View>
);

const GroupHeader = ({ title }) => (
  <View style={styles.groupHeader}>
    <Text style={styles.groupHeaderText}>{title}</Text>
  </View>
);

const NotificationCard = ({ item, onRead, onArchive }) => {
  const swipeRef = useRef(null);
  const [archived, setArchived] = useState(false);
  const handleSwipeArchive = () => {
    setArchived(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => onArchive(item.id), 350);
  };
  const handleRead = () => {
    if (!item.is_read) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRead(item.id);
    }
  };
  if (archived) return null;
  // Special confetti for promo/achievement (TODO: confetti animation)
  const isSpecial = item.type === 'promo' || item.type === 'achievement';
  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={() => (
        <View style={styles.swipeArchive}><Ionicons name="archive" size={26} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>Archive</Text></View>
      )}
      onSwipeableRightOpen={handleSwipeArchive}
      overshootRight={false}
    >
      <Animatable.View animation="fadeInUp" duration={550} style={[styles.card, item.is_read && { opacity: 0.5 }]}> 
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={handleRead}
          accessibilityLabel={`Notification: ${item.content}`}
        >
          {/* Icon or image */}
          <View style={styles.iconWrap}>
            {item.icon ? (
              <Image source={{ uri: item.icon }} style={styles.iconImg} />
            ) : (
              <MaterialCommunityIcons name={item.type === 'promo' ? 'star' : item.type === 'achievement' ? 'trophy' : 'bell'} size={28} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            {/* Actions: RSVP, View, Dismiss, etc. */}
            {item.action && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Action', `Action: ${item.action}`)} accessibilityLabel={item.action}>
                <Text style={styles.actionText}>{item.action}</Text>
              </TouchableOpacity>
            )}
            {/* Special confetti (TODO) */}
            {isSpecial && <Text style={styles.special}>🎉 Special!</Text>}
            {!item.is_read && <Text style={styles.unread}>Unread</Text>}
          </View>
        </TouchableOpacity>
      </Animatable.View>
    </Swipeable>
  );
};

function groupNotifications(notifications) {
  // Group by Today, This Week, Earlier
  const today = [], week = [], earlier = [];
  const now = new Date();
  notifications.forEach(n => {
    const created = new Date(n.created_at);
    const diff = (now - created) / (1000 * 60 * 60 * 24);
    if (diff < 1) today.push(n);
    else if (diff < 7) week.push(n);
    else earlier.push(n);
  });
  const groups = [];
  if (today.length) groups.push({ title: 'Today', data: today });
  if (week.length) groups.push({ title: 'This Week', data: week });
  if (earlier.length) groups.push({ title: 'Earlier', data: earlier });
  return groups;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError && setError(null);
    const start = Date.now();
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const duration = Date.now() - start;
      console.log(`[NotificationsScreen] /notifications fetched in ${duration}ms`);
    } catch (e) {
      setNotifications([]);
      setError && setError('Failed to load notifications. Please try again.');
      // TODO: Add backend diagnostics/logging for failed notifications fetch
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      const node = findNodeHandle(errorRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [error]);

  const markAsRead = async (id) => {
    try {
      await api.post('/notifications/read', { notification_id: id });
      fetchNotifications();
    } catch {}
  };
  const archiveNotification = async (id) => {
    try {
      await api.post('/notifications/archive', { notification_id: id });
      fetchNotifications();
    } catch {}
  };

  // --- Render ---
  const groups = groupNotifications(notifications);
  return (
    <LinearGradient colors={['#FFF7F0', '#FFE5D0']} style={{ flex: 1 }}>
      {/* TODO: Batik pattern or mascot in background */}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Notifications</Text>
        {error ? (
          <View>
            <Text ref={errorRef} accessibilityLiveRegion="polite" style={{ color: colors.error, textAlign: 'center', marginTop: 18 }}>{error}</Text>
            <TouchableOpacity style={{ marginHorizontal: 24, marginBottom: 8 }} onPress={fetchNotifications}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {loading && <SkeletonLoader />}
        {!loading && !error && (
          groups.length === 0 ? <EmptyState /> : (
            groups.map(group => (
              <View key={group.title}>
                <GroupHeader title={group.title} />
                {group.data.map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onRead={markAsRead}
                    onArchive={archiveNotification}
                  />
                ))}
              </View>
            ))
          )
        )}
        {/* TODO: Notification preferences, push settings, batch actions, smart summaries, AI notification assistant, etc. */}
      </ScrollView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 8, elevation: 2 },
  content: { fontSize: 16 },
  date: { color: '#888', fontSize: 12, marginTop: 4 },
  unread: { color: '#007AFF', fontWeight: 'bold', marginTop: 6 },
});
