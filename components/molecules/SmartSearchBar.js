import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

const suggestionsMock = [
  'Sushi Hiro',
  'Bakmi GM',
  'Pizza Marzano',
  'Coffee Shop',
  'Vegan',
  'Nearby',
];

export default function SmartSearchBar({ value, onChange, onSubmit, onLocationPress, suggestions = suggestionsMock }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = useState(value || '');

  const handleInputChange = (text) => {
    setInput(text);
    onChange && onChange(text);
    setShowSuggestions(text.length > 0);
  };

  const handleSuggestion = (s) => {
    setInput(s);
    setShowSuggestions(false);
    onChange && onChange(s);
    onSubmit && onSubmit(s);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Ionicons name="search" size={22} color={colors.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search restaurants, cuisines, or dishes..."
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(input.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          returnKeyType="search"
          onSubmitEditing={() => onSubmit && onSubmit(input)}
          accessibilityLabel="Smart search input"
        />
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={onLocationPress}
          accessibilityLabel="Use current location"
        >
          <MaterialIcons name="my-location" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {showSuggestions && (
        <FlatList
          data={suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()))}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestion} onPress={() => handleSuggestion(item)}>
              <Ionicons name="arrow-forward" size={16} color={colors.muted} style={{ marginRight: 8 }} />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: 0,
    minHeight: 48,
  },
  locationBtn: {
    marginLeft: 8,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 2,
    elevation: 2,
    maxHeight: 180,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  suggestionText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
});
