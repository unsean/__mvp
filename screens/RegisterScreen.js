import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

async function registerWithPassword(email, password, name) {
  // Only register with Supabase Auth. DO NOT insert into any custom table here.
  // User profile will be created ONLY after email is verified (see EmailConfirmationScreen/CodeVerificationScreen).
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
}

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      // Check if email is already registered using signUp (Supabase returns an error if so)
      await registerWithPassword(email, password, name); // No DB insertion, just Auth signup
      navigation.replace('EmailConfirmation', { email, name, password });
    } catch (e) {
      if (e && e.message && (e.message.toLowerCase().includes('user already registered') || e.message.toLowerCase().includes('email already registered'))) {
        setError('This email is already registered. Please use another email or log in.');
      } else {
        setError(e && e.message ? e.message : 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register for Go-to-Resto</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 24, fontWeight: 'bold' },
  input: { width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 8 },
  linkContainer: { marginTop: 16 },
  link: { color: '#007AFF', fontSize: 16 },
});
