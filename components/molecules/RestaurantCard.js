import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../utils/constants';
import { formatCurrency, formatDistance, formatTime } from '../../utils/validation';

const RestaurantCard = ({
  restaurant,
  onPress,
  style = {},
  showDistance = true,
  showDeliveryTime = true,
  compact = false,
}) => {
  const {
    id,
    name,
    cuisine,
    rating,
    reviewCount,
    priceRange,
    distance,
    deliveryTime,
    deliveryFee,
    image,
    isOpen,
    promotions = [],
  } = restaurant;

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Ionicons name="star" size={14} color="#FFB300" />
      <Text style={styles.ratingText}>{rating?.toFixed(1) || 'N/A'}</Text>
      {reviewCount && (
        <Text style={styles.reviewCount}>({reviewCount})</Text>
      )}
    </View>
  );

  const renderPromotions = () => {
    if (!promotions.length) return null;
    
    return (
      <View style={styles.promotionContainer}>
        <MaterialIcons name="local-offer" size={12} color={COLORS.secondary} />
        <Text style={styles.promotionText}>{promotions[0]}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer, style]}
      onPress={() => onPress?.(restaurant)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image || 'https://via.placeholder.com/300x200' }}
          style={[styles.image, compact && styles.compactImage]}
          resizeMode="cover"
        />
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
        {promotions.length > 0 && (
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionBadgeText}>PROMO</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.priceRange}>{priceRange}</Text>
        </View>

        <Text style={styles.cuisine} numberOfLines={1}>
          {cuisine}
        </Text>

        <View style={styles.metaRow}>
          {renderRating()}
          {showDistance && distance && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        {showDeliveryTime && (
          <View style={styles.deliveryRow}>
            {deliveryTime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{formatTime(deliveryTime)}</Text>
              </View>
            )}
            {deliveryFee !== undefined && (
              <Text style={styles.deliveryFee}>
                {deliveryFee === 0 ? 'Free delivery' : formatCurrency(deliveryFee)}
              </Text>
            )}
          </View>
        )}

        {renderPromotions()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  compactContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: COLORS.surface,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  promotionBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  promotionBadgeText: {
    color: COLORS.surface,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.md,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priceRange: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cuisine: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  deliveryFee: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  promotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  promotionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.secondary,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default RestaurantCard;
