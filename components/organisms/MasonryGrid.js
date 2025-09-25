import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CARD_ASPECT_RATIO = 16 / 9;

export default function MasonryGrid({ data, renderItem, numColumns = 2, style }) {
  // Split data into columns
  const columns = Array.from({ length: numColumns }, () => []);
  data.forEach((item, idx) => {
    columns[idx % numColumns].push(item);
  });

  return (
    <View style={[styles.container, style]}>
      {columns.map((col, colIdx) => (
        <View style={styles.column} key={colIdx}>
          {col.map((item, rowIdx) => (
            <View style={styles.cardWrapper} key={item.id || rowIdx}>
              {renderItem({ item, index: rowIdx })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 8,
  },
  column: {
    flex: 1,
    marginHorizontal: COLUMN_GAP / 2,
  },
  cardWrapper: {
    marginBottom: COLUMN_GAP,
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 18,
    overflow: 'hidden',
  },
});
