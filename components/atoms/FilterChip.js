import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../../theme/colors';

/**
 * Atomic filter chip for filter bars, lists, etc.
 * @param {object} props
 * @param {string} props.label - The label to display on the chip.
 * @param {boolean} props.active - Whether the chip is selected/active.
 * @param {function} props.onPress - Handler for chip press.
 * @param {string} [props.accessibilityLabel] - Optional accessibility label.
 */
const FilterChip = ({ label, active, onPress, accessibilityLabel }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel || label}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

FilterChip.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  accessibilityLabel: PropTypes.string,
};

FilterChip.defaultProps = {
  active: false,
  accessibilityLabel: '',
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  chipTextActive: {
    color: '#fff',
  },
});

export default FilterChip;
