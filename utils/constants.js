// App-wide constants and configuration

export const COLORS = {
  primary: '#FF6F61',
  secondary: '#FFB300',
  background: '#FFF7F0',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const CUISINE_TYPES = [
  'Indonesian',
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Indian',
  'Italian',
  'American',
  'Mexican',
  'Mediterranean',
  'Middle Eastern',
];

export const PRICE_RANGES = [
  { key: '$', label: 'Budget', min: 0, max: 50000 },
  { key: '$$', label: 'Moderate', min: 50000, max: 150000 },
  { key: '$$$', label: 'Expensive', min: 150000, max: 300000 },
  { key: '$$$$', label: 'Very Expensive', min: 300000, max: Infinity },
];

export const DELIVERY_TIMES = [
  '15-30 min',
  '30-45 min',
  '45-60 min',
  '1+ hour',
];

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const API_ENDPOINTS = {
  restaurants: '/api/restaurants',
  search: '/api/search',
  reviews: '/api/reviews',
  bookings: '/api/bookings',
  favorites: '/api/favorites',
  profile: '/api/profile',
};

export const STORAGE_KEYS = {
  user: '@user',
  favorites: '@favorites',
  searchHistory: '@searchHistory',
  location: '@location',
  preferences: '@preferences',
};
