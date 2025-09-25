
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';
import { shadow } from '../../theme/shadows';

import { Swipeable } from 'react-native-gesture-handler';

export default function FavoriteCard({ item, onPress, onUnfavorite, onMap, onShare, onBook }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRemove = async () => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove ${item.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
            setRemoving(true);
            await onUnfavorite();
            setRemoving(false);
          }
        }
      ]
    );
  };

  // Swipeable right action for remove
  const renderRightActions = () => (
    <TouchableOpacity style={styles.swipeRemove} onPress={handleRemove} accessibilityLabel="Remove from favorites">
      <Ionicons name="trash" size={26} color="#fff" />
    </TouchableOpacity>
  );

  // Badge logic
  const badges = [];
  if (item.isNew) badges.push({ text: 'NEW', color: colors.primary });
  if (item.isPopular) badges.push({ text: 'POPULAR', color: colors.accent });
  if (item.isTopRated) badges.push({ text: 'Top Rated', color: '#FFD700' });
  if (item.isOpenNow) badges.push({ text: 'Open Now', color: '#4caf50' });
  if (item.isPromo) badges.push({ text: 'Promo', color: '#ff4081' });

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>  
        <LinearGradient colors={gradients.card} style={styles.gradient}>
          <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={0.92}
            accessibilityLabel={`Open details for ${item.name}`}
          >
            <View style={{ position: 'relative' }}>
              <Image
                source={item.img ? { uri: item.img } : require('../../assets/restaurant-placeholder.png')}
                style={styles.img}
                resizeMode="cover"
                accessibilityLabel={`${item.name} image`}
              />
              <View style={styles.badgeWrap}>
                {badges.map((b, i) => (
                  <View key={i} style={[styles.badge, { backgroundColor: b.color }]}><Text style={styles.badgeText}>{b.text}</Text></View>
                ))}
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.chipRow}>
                {item.cuisine?.split(',').map((c, i) => (
                  <Text key={i} style={styles.chip}>{c.trim()}</Text>
                ))}
              </View>
              <Text style={styles.desc}>{item.price} • {item.address}</Text>
              {item.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  {[...Array(Math.floor(item.rating))].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color={colors.primary} />
                  ))}
                  {item.rating % 1 !== 0 && <Ionicons name="star-half" size={16} color={colors.primary} />}
                  <Text style={{ marginLeft: 4, color: colors.primary, fontWeight: 'bold', fontSize: fontSizes.sm }}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.actions}>
                <TouchableOpacity onPress={handleRemove} accessibilityLabel="Remove from favorites" style={styles.actionBtn} disabled={removing}>
                  {removing ? <ActivityIndicator size={18} color={colors.primary} /> : <Ionicons name="heart" size={22} color={colors.primary} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={onMap} accessibilityLabel="View on map" style={styles.actionBtn}>
                  <MaterialCommunityIcons name="map-marker" size={22} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} accessibilityLabel="Share restaurant" style={styles.actionBtn}>
                  <Ionicons name="share-social" size={20} color={colors.text} />
                </TouchableOpacity>
                {onBook && (
                  <TouchableOpacity onPress={onBook} accessibilityLabel="Book now" style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Swipeable>
  );
}


const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 18,
    ...shadow.card,
    overflow: 'hidden',
  },
  gradient: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    width: 80,
    height: 80,
    borderRadius: 18,
    margin: 12,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  desc: {
    color: colors.muted,
    fontSize: fontSizes.sm,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginRight: 4,
    marginBottom: 2,
  },
  badgeWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
    marginBottom: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtn: {
    padding: 8,
    marginRight: 8,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  swipeRemove: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 18,
    marginBottom: 18,
  },
});
