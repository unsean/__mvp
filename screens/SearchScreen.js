import React, { useState, useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet, 
  Modal, 
  Image, 
  ScrollView 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/molecules/Header';
import AppButton from '../components/atoms/AppButton';
import RestaurantList from '../components/organisms/RestaurantList';
import FormInput from '../components/atoms/FormInput';
import SkeletonLoader from '../components/atoms/SkeletonLoader';
import { COLORS, SPACING, FONTS, CUISINE_TYPES, PRICE_RANGES } from '../utils/constants';
import { formatCurrency } from '../utils/validation';

// Mock API service (replace with actual implementation)
const api = {
  get: async (endpoint, params) => {
    console.log(`API call to ${endpoint}`, params);
    // Mock response
    return new Promise(resolve => setTimeout(() => resolve({ 
      data: Array(10).fill().map((_, i) => ({
        id: i + 1,
        name: `Restaurant ${i + 1}`,
        cuisine: 'International',
        rating: 4.5 - (i * 0.1),
        price: '$$',
        address: '123 Main St',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
      }))
    }), 1000));
  }
};

const CARD_IMG_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
const RECENT_SEARCHES = ['Pizza', 'Sushi', 'Italian', 'Burger', 'Cafe'];
const RATINGS = [4.5, 4.0, 3.5, 3.0];

const SearchSkeletonLoader = () => (
  <View style={{ padding: SPACING.md }}>
    {[...Array(6)].map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
        <SkeletonLoader width={80} height={80} borderRadius={12} style={{ marginRight: SPACING.md }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="70%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="50%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="60%" height={14} />
        </View>
      </View>
    ))}
  </View>
);

const EmptyState = ({ onReset }) => (
  <View style={{ alignItems: 'center', marginTop: 48, padding: 20 }}>
    <MaterialCommunityIcons 
      name="emoticon-sad-outline" 
      size={64} 
      color={COLORS.textSecondary} 
    />
    <Text style={{ 
      fontSize: FONTS.sizes.lg, 
      fontWeight: 'bold', 
      marginTop: 16,
      color: COLORS.text 
    }}>
      No restaurants found
    </Text>
    <Text style={{ 
      color: COLORS.textSecondary, 
      marginTop: 8, 
      textAlign: 'center',
      marginBottom: 20
    }}>
      Try different filters, expand your search area, or check your spelling.
    </Text>
    <AppButton 
      title="Reset Filters" 
      onPress={onReset} 
      style={{ width: '60%' }} 
    />
  </View>
);

export default function SearchScreen({ navigation = {} }) {
  // State management
  const [showMap, setShowMap] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState('Relevance');
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filterCuisines, setFilterCuisines] = useState([]);
  const [filterPrices, setFilterPrices] = useState([]);
  const [filterRatings, setFilterRatings] = useState([]);
  const [filterDietary, setFilterDietary] = useState([]);
  const [filterDistance, setFilterDistance] = useState(5);

  // Fetch restaurants
  const fetchRestaurants = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setRestaurants([]);
    }
    
    setError('');
    
    try {
      // Mock data for development - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const mockData = {
        data: [
          { id: 1, name: 'Search Result 1', cuisine: 'Italian', rating: 4.5 },
          { id: 2, name: 'Search Result 2', cuisine: 'Asian', rating: 4.2 },
          { id: 3, name: 'Search Result 3', cuisine: 'Mexican', rating: 4.7 }
        ]
      };
      const res = mockData;
      
      if (append) {
        setRestaurants(prev => [...prev, ...(res.data || [])]);
      } else {
        setRestaurants(res.data || []);
      }
    } catch (e) {
      setError('Failed to load restaurants. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchRestaurants();
    // No need to setFavorites, handled by context
  }, []);

  // Apply filters handler
  const applyFilters = () => {
    setShowFilterModal(false);
    fetchRestaurants();
  };

  // Reset filters
  const resetFilters = () => {
    setFilterCuisines([]);
    setFilterPrices([]);
    setFilterRatings([]);
    setFilterDietary([]);
    setFilterDistance(5);
    setSortOption('Relevance');
    fetchRestaurants();
  };



  // Render restaurant item
  const renderItem = ({ item }) => (
    <View 
      style={styles.cardRow}
    >
      <Image 
        source={{ uri: item.img || CARD_IMG_PLACEHOLDER }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          {item.cuisine} • {item.rating.toFixed(1)}★ • {item.price}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => toggleFavorite(item)}
        style={styles.favButton}
      >
        <Ionicons
          name={isFavorited(item.id) ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorited(item.id) ? COLORS.primary : COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Cuisine Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Cuisine</Text>
              <View style={styles.filterOptions}>
                {CUISINE_TYPES.map(cuisine => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.filterOption,
                      filterCuisines.includes(cuisine) && styles.selectedOption
                    ]}
                    onPress={() => {
                      setFilterCuisines(prev => 
                        prev.includes(cuisine)
                          ? prev.filter(c => c !== cuisine)
                          : [...prev, cuisine]
                      );
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      filterCuisines.includes(cuisine) && styles.selectedText
                    ]}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price</Text>
              <View style={styles.filterOptions}>
                {PRICE_RANGES.map(price => (
                  <TouchableOpacity
                    key={price.key}
                    style={[
                      styles.filterOption,
                      filterPrices.includes(price.key) && styles.selectedOption
                    ]}
                    onPress={() => {
                      setFilterPrices(prev => 
                        prev.includes(price.key)
                          ? prev.filter(p => p !== price.key)
                          : [...prev, price.key]
                      );
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      filterPrices.includes(price.key) && styles.selectedText
                    ]}>
                      {price.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.filterOptions}>
                {RATINGS.map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.filterOption,
                      filterRatings.includes(rating) && styles.selectedOption
                    ]}
                    onPress={() => {
                      setFilterRatings(prev => 
                        prev.includes(rating)
                          ? prev.filter(r => r !== rating)
                          : [rating] // Only allow one rating selection
                      );
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      filterRatings.includes(rating) && styles.selectedText
                    ]}>
                      {rating}★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Distance: {filterDistance} miles
              </Text>
              <Slider
                value={filterDistance}
                onValueChange={setFilterDistance}
                minimumValue={1}
                maximumValue={20}
                step={1}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.primary}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <AppButton
              title="Reset"
              type="secondary"
              onPress={resetFilters}
              style={styles.resetButton}
            />
            <AppButton
              title="Apply Filters"
              onPress={applyFilters}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Search" onBack={() => navigation.goBack && navigation.goBack()} />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cuisines..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => fetchRestaurants()}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => fetchRestaurants()}
        >
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      {showMap && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recentContainer}
        >
          {RECENT_SEARCHES.map((item, idx) => (
            <TouchableOpacity
              key={`${item}-${idx}`}
              style={styles.recentChip}
              onPress={() => {
                setQuery(item);
                fetchRestaurants();
              }}
            >
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={COLORS.primary} 
              />
              <Text style={styles.recentText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Controls Bar */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons 
            name={showMap ? "list" : "map"} 
            size={20} 
            color={COLORS.primary} 
          />
          <Text style={styles.viewToggleText}>
            {showMap ? "List View" : "Map View"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.controlsRight}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortText}>{sortOption}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.sortModal}>
          {['Relevance', 'Rating', 'Distance', 'Popular'].map(option => (
            <TouchableOpacity
              key={option}
              style={styles.sortOption}
              onPress={() => {
                setSortOption(option);
                setShowSortModal(false);
                fetchRestaurants();
              }}
            >
              <Text style={[
                styles.sortOptionText,
                option === sortOption && styles.selectedSortOption
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content Area */}
      {loading && !restaurants.length ? (
        <SearchSkeletonLoader />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton 
            title="Try Again" 
            onPress={() => fetchRestaurants()} 
            style={styles.retryButton} 
          />
        </View>
      ) : restaurants.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : showMap ? (
        <View style={styles.mapContainer}>
          <Text style={styles.comingSoon}>Map View Coming Soon</Text>
          <Ionicons name="map" size={100} color={COLORS.textSecondary} />
        </View>
      ) : (
        <RestaurantList
          restaurants={restaurants.map(item => ({
            ...item,
            image: item.img,
            priceRange: item.price,
            reviewCount: Math.floor(Math.random() * 500) + 50,
            distance: Math.floor(Math.random() * 5000) + 500,
            deliveryTime: Math.floor(Math.random() * 45) + 15,
            deliveryFee: Math.random() > 0.3 ? Math.floor(Math.random() * 15000) : 0,
            isOpen: Math.random() > 0.2,
            promotions: Math.random() > 0.7 ? ['Free delivery'] : []
          }))}
          loading={loadingMore}
          onRestaurantPress={(restaurant) => {
            console.log('Restaurant pressed:', restaurant.name);
            // Navigate to restaurant detail
          }}
          onRefresh={() => fetchRestaurants()}
          refreshing={loading}
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  recentText: {
    color: COLORS.primary,
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  controlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 4,
  },
  sortModal: {
    position: 'absolute',
    top: 140,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    zIndex: 10,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  sortOptionText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
  },
  selectedSortOption: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardMeta: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardAddress: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: FONTS.sizes.sm,
  },
  favButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    width: '50%',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  comingSoon: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.primary,
  },
  selectedText: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});