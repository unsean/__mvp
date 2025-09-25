import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';

export default function StickySortFilterBar({ sort, onSort, onFilter, activeFiltersCount }) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.btn} onPress={onSort} accessibilityLabel="Sort options">
        <Ionicons name="funnel" size={20} color={colors.primary} />
        <Text style={styles.btnText}>{sort || 'Sort'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onFilter} accessibilityLabel="Filter options">
        <Ionicons name="options" size={20} color={colors.secondary} />
        <Text style={styles.btnText}>Filter{activeFiltersCount ? ` (${activeFiltersCount})` : ''}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
    elevation: 3,
    zIndex: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    minWidth: 48,
    minHeight: 48,
    marginRight: 8,
  },
  btnText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    marginLeft: 8,
  },
});
