import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { gradients, colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';
import { shadow } from '../../theme/shadows';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import PropTypes from 'prop-types';

// --- QuickActions (inline molecule) ---
const QuickActions = ({ onCall, onDirections, onShare, onCalendar, onGroup }) => (
  <View style={styles.quickActionsWrap}>
    <TouchableOpacity onPress={onCall} style={styles.quickAction} accessibilityLabel="Call restaurant">
      <Ionicons name="call-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onDirections} style={styles.quickAction} accessibilityLabel="Directions">
      <Ionicons name="navigate-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onShare} style={styles.quickAction} accessibilityLabel="Share">
      <Ionicons name="share-social-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onCalendar} style={styles.quickAction} accessibilityLabel="Add to calendar">
      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onGroup} style={styles.quickAction} accessibilityLabel="Group booking">
      <MaterialCommunityIcons name="account-group-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
  </View>
);

QuickActions.propTypes = {
  onCall: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onCalendar: PropTypes.func.isRequired,
  onGroup: PropTypes.func.isRequired,
};

// --- Main Card ---
const RestaurantCard = ({ item }) => {
  // 3D tilt effect
  const tilt = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const handlePressIn = (e) => {
    Animated.spring(tilt, {
      toValue: { x: 4, y: 4 },
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(tilt, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  // Card tap/peek preview stub
  const handleLongPress = () => {
    // TODO: Show peek preview modal
    Alert.alert('Peek Preview', 'Menu highlights & friend check-ins coming soon!');
  };

  // Data points
  const img = item.hero || item.image_url || require('../../assets/restaurant-placeholder.png');
  return (
    <Animated.View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        transform: [
          { perspective: 800 },
          { rotateX: tilt.y.interpolate({ inputRange: [-10, 10], outputRange: ['-6deg', '6deg'] }) },
          { rotateY: tilt.x.interpolate({ inputRange: [-10, 10], outputRange: ['-6deg', '6deg'] }) },
        ],
      }}
    >
      {/* Hero Image & Promo Badge */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}
        accessibilityLabel={`View details for ${item.name}`}
      >
        <Image
          source={typeof img === 'string' ? { uri: img } : img}
          style={{ width: '100%', height: 160, resizeMode: 'cover' }}
        />
        {item.promo ? (
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{item.promo}</Text>
          </View>
        ) : null}
        {/* Live Table/ETA Indicator */}
        <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, color: item.tableStatus === '🟢' ? colors.secondary : '#D32F2F', fontWeight: 'bold' }}>{item.tableStatus === '🟢' ? 'Table: Available' : 'Table: Full'}</Text>
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>{item.deliveryEta ? `⏱️ ${item.deliveryEta}` : ''}</Text>
        </View>
      </TouchableOpacity>
      {/* Card Body */}
      <View style={{ padding: 16 }}>
        {/* Name & Rating Row */}
        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20, color: colors.text, marginBottom: 2 }}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold', marginRight: 4 }}>{'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))}</Text>
          <Text style={{ fontSize: 15, color: colors.text, marginRight: 8 }}>({item.reviews})</Text>
          <Text style={{ fontSize: 15, color: colors.secondary }}>{item.distance}km</Text>
        </View>
        {/* Meta Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <Text style={{ fontSize: 15, color: colors.text, marginRight: 8 }}>{item.price}</Text>
          <Text style={{ fontSize: 15, color: colors.text, marginRight: 8 }}>{item.cuisine}</Text>
          <Text style={{ fontSize: 15, color: colors.text, marginRight: 8 }}>{item.ambiance}</Text>
        </View>
        {/* Dietary Tags Floating */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {item.tags && item.tags.map((tag, i) => (
            <View key={i} style={{ backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontSize: 13 }}>{tag}</Text>
            </View>
          ))}
        </View>
        {/* Actions Row */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#F8F5F2', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 15 }}>Takeout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

RestaurantCard.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number,
  navigation: PropTypes.object,
  favorites: PropTypes.array,
  toggleFavorite: PropTypes.func,
};

RestaurantCard.defaultProps = {
  index: 0,
  navigation: {},
  favorites: [],
  toggleFavorite: () => {},
};

const styles = StyleSheet.create({
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, minHeight: 70, backgroundColor: 'transparent' },
  image: { width: 60, height: 60, borderRadius: 16, marginRight: 12 },
  name: { fontWeight: 'bold', fontSize: fontSizes.md, color: colors.text },
  cuisine: { fontSize: fontSizes.sm, color: colors.muted },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  price: { fontSize: fontSizes.sm, color: colors.muted },
  rating: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: 'bold', marginLeft: 8 },
  distance: { fontSize: fontSizes.sm, color: colors.neutral, marginLeft: 8 },
  openBadge: { fontSize: fontSizes.xs, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  tag: { fontSize: fontSizes.xs, color: colors.primary, backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 },
  ribbon: { fontSize: fontSizes.xs, color: '#fff', backgroundColor: '#FF6F61', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 },
  ribbonPromo: { fontSize: fontSizes.xs, color: '#fff', backgroundColor: '#FFD600', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 },
  quickActionsWrap: { flexDirection: 'row', marginTop: 10 },
  quickAction: { marginRight: 12, padding: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.primary },
  swipeFavorite: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, margin: 4 },
  focused: { borderWidth: 2, borderColor: colors.primary },
});

export default RestaurantCard;
