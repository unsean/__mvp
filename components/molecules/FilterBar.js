import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FilterChip from '../atoms/FilterChip';

/**
 * FilterBar molecule: horizontal row of filter chips (cuisine, price, rating, dietary, etc.)
 * @param {object} props
 * @param {Array} props.filters - Array of filter objects: { label, key, active, onPress }
 */
const FilterBar = ({ filters }) => (
  <View style={styles.bar}>
    {(filters || []).map((filter) => (
      <FilterChip
        key={filter.key || filter.label}
        label={filter.label}
        active={filter.active}
        onPress={filter.onPress}
        accessibilityLabel={filter.accessibilityLabel}
      />
    ))}
  </View>
);

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      active: PropTypes.bool,
      onPress: PropTypes.func.isRequired,
      accessibilityLabel: PropTypes.string,
    })
  ),
};

FilterBar.defaultProps = {
  filters: [],
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 8,
  },
});

export default FilterBar;
