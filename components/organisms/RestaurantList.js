import React from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import RestaurantCard from '../molecules/RestaurantCard';
import SkeletonLoader from '../atoms/SkeletonLoader';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

const RestaurantList = ({
  restaurants = [],
  loading = false,
  refreshing = false,
  onRefresh,
  onRestaurantPress,
  ListHeaderComponent,
  ListEmptyComponent,
  showDistance = true,
  showDeliveryTime = true,
  compact = false,
  numColumns = 1,
  style = {},
}) => {
  const renderRestaurant = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={onRestaurantPress}
      showDistance={showDistance}
      showDeliveryTime={showDeliveryTime}
      compact={compact}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <SkeletonLoader height={160} borderRadius={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="70%" height={20} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="50%" height={16} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonLoader width="40%" height={14} />
            <SkeletonLoader width="30%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (ListEmptyComponent) {
      return ListEmptyComponent;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No restaurants found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or location
        </Text>
      </View>
    );
  };

  if (loading && restaurants.length === 0) {
    return renderSkeleton();
  }

  return (
    <FlatList
      style={[styles.container, style]}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        ) : undefined
      }
      ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  skeletonContainer: {
    padding: SPACING.md,
  },
  skeletonItem: {
    marginBottom: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RestaurantList;
