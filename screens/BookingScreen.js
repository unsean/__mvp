import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/molecules/Header';
import AppButton from '../components/atoms/AppButton';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Toast from '../components/atoms/Toast';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';
import { Animatable, fadeIn } from '../theme/animations';
import { View, Text, TextInput, StyleSheet, Picker, Alert } from 'react-native';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const SkeletonLoader = ({ type }) => {
  if (type === 'table') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ backgroundColor: '#eee', borderRadius: 8, width: 120, height: 32, margin: 4 }} />
        ))}
      </View>
    );
  }
  // Main form skeleton
  return (
    <View style={{ width: '100%', alignItems: 'center', marginTop: 24 }}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={{ backgroundColor: '#eee', borderRadius: 8, width: '90%', height: 32, marginBottom: 16 }} />
      ))}
      <View style={{ backgroundColor: '#eee', borderRadius: 8, width: '60%', height: 40, marginBottom: 16 }} />
    </View>
  );
};

export default function BookingScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState('2025-06-19');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      setLoadingTables(true);
      setError(null);
      const start = Date.now();
      try {
        const res = await api.get('/tables', { params: { restaurant_id: restaurantId } });
        setTables(res.data);
        if (res.data.length > 0) setTableId(String(res.data[0].id));
        const duration = Date.now() - start;
        console.log(`[BookingScreen] /tables fetched in ${duration}ms`);
      } catch (e) {
        setTables([]);
        setError('Failed to load tables. Please try again.');
        // TODO: Add backend diagnostics/logging for failed /tables requests
      }
      setLoadingTables(false);
    };
    fetchTables();
  }, [restaurantId]);

  useEffect(() => {
    if (date && time) fetchAvailableTables();
    // eslint-disable-next-line
  }, [date, time]);

  const fetchAvailableTables = async () => {
    setLoadingTables(true);
    setError(null);
    const start = Date.now();
    try {
      const res = await api.get(`/restaurants/${restaurantId}/availability`, { params: { date, time } });
      setAvailableTables(res.data);
      const duration = Date.now() - start;
      console.log(`[BookingScreen] /restaurants/${restaurantId}/availability fetched in ${duration}ms`);
    } catch (e) {
      setAvailableTables([]);
      setError('Failed to load available tables. Please try again.');
      // TODO: Add backend diagnostics/logging for failed availability requests
    }
    setLoadingTables(false);
  };

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      await api.post('/bookings', {
        restaurant_id: restaurantId,
        table_id: tableId,
        date,
        time,
        guests: parseInt(guests, 10),
      });
      setSuccess(true);
      const duration = Date.now() - start;
      console.log(`[BookingScreen] /bookings posted in ${duration}ms`);
      Alert.alert('Booking Confirmed', 'Your table has been booked!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      setError('Booking failed. Please try again.');
      // TODO: Add backend diagnostics/logging for failed booking requests
      Alert.alert('Booking Failed', 'Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Book a Table" onBack={() => navigation.goBack()} />
      <Toast visible={!!error} message={error} type="error" />
      <ErrorMessage message={error} />
      {error && (
        <AppButton title="Retry" onPress={() => {
          setError(null);
          setLoadingTables(true);
          (async () => {
            const start = Date.now();
            try {
              const res = await api.get('/tables', { params: { restaurant_id: restaurantId } });
              setTables(res.data);
              if (res.data.length > 0) setTableId(String(res.data[0].id));
              const duration = Date.now() - start;
              console.log(`[BookingScreen] /tables fetched in ${duration}ms`);
            } catch (e) {
              setTables([]);
              setError('Failed to load tables. Please try again.');
              // TODO: Add backend diagnostics/logging for failed /tables requests
            }
            setLoadingTables(false);
          })();
        }} style={{ marginHorizontal: 24, marginBottom: 8 }} />
      )}
      {loading && <SkeletonLoader />}
      <View style={styles.container}>
        <Text style={styles.title}>Book a Table</Text>
        <Text>Date:</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Text>Time:</Text>
        <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM" />
        <Text>Guests:</Text>
        <TextInput style={styles.input} value={guests} onChangeText={setGuests} keyboardType="numeric" />
        <Text>Table:</Text>
        {loadingTables ? (
          <SkeletonLoader type="table" />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
            {availableTables.length > 0 ? availableTables.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tableBtn, tableId === t.id && styles.tableBtnActive]}
                onPress={() => setTableId(t.id)}
              >
                <Text style={{ color: tableId === t.id ? '#fff' : '#007AFF' }}>Table {t.table_number} ({t.seats} seats)</Text>
              </TouchableOpacity>
            )) : <Text style={{ color: '#888', marginBottom: 8 }}>No tables available for selected date/time.</Text>}
          </View>
        )}
        <AppButton title={loading ? 'Booking...' : 'Book Now'} onPress={handleBook} disabled={loading || !tableId} />
        {success && <Text style={styles.success}>Booking successful!</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 24, fontWeight: 'bold' },
  input: { width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  success: { color: 'green', marginTop: 16, fontWeight: 'bold' },
});
