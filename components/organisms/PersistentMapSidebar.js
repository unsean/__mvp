import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function PersistentMapSidebar({ restaurants = [], initialRegion, onMarkerPress }) {
  return (
    <View style={styles.sidebar}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {restaurants.map(r => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            title={r.name}
            description={r.cuisine}
            onPress={() => onMarkerPress && onMarkerPress(r)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: width * 0.33,
    height: '100%',
    backgroundColor: '#fff',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 4,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
});
