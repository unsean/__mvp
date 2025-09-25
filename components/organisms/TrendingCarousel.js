import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

const { width } = Dimensions.get('window');

export default function TrendingCarousel({ data = [], onPressItem }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trending Near You</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPressItem && onPressItem(item)}
            activeOpacity={0.85}
            accessibilityLabel={`View trending restaurant ${item.name}`}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
              <Ionicons name="flame" size={32} color="#fff" style={{ marginBottom: 8 }} />
              <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.cuisine}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: fontSizes.lg,
    color: colors.primary,
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    width: width * 0.48,
    marginRight: 16,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    minHeight: 120,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSub: {
    color: '#fff',
    fontSize: fontSizes.sm,
    opacity: 0.85,
    textAlign: 'center',
  },
});
