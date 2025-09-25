import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

export default function RestaurantMasonryCard({ item, onPress, onBookmark, onShare }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.92} accessibilityLabel={`View ${item.name} details`}>
      {/* Hero image with logo watermark */}
      <View style={styles.imgWrapper}>
        <Image source={{ uri: item.heroImage }} style={styles.heroImg} resizeMode="cover" />
        {item.logo && <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />}
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
        <View style={styles.badges}>
          <View style={styles.ratingBadge}><Ionicons name="star" size={14} color="#fff" /><Text style={styles.ratingText}>{item.rating}</Text></View>
          <Text style={styles.distance}>{item.distance}km</Text>
        </View>
      </View>
      <Text style={styles.sub}>{item.price} • {item.atmosphere}</Text>
      <View style={styles.availRow}>
        <View style={[styles.dot, { backgroundColor: item.available ? colors.secondary : colors.muted }]} />
        <Text style={styles.availText}>{item.available ? 'Table Available' : 'No Tables'}</Text>
      </View>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onBookmark(item)} accessibilityLabel="Bookmark">
          <Ionicons name={item.bookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(item)} accessibilityLabel="Share">
          <MaterialIcons name="share" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    minHeight: 220,
  },
  imgWrapper: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.muted,
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  logo: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
    marginLeft: 2,
  },
  distance: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  sub: {
    color: colors.muted,
    fontSize: fontSizes.sm,
    marginBottom: 4,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  availText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtn: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f8f8f8',
  },
});
