import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, setUser, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const handleLogin = async () => {
    setEmailNotConfirmed(false);
    try {
      await login(email, password);
      // Optionally navigate to main app screen if needed
      // navigation.replace('Main');
    } catch (e) {
      if (e && e.message && e.message.toLowerCase().includes('email not confirmed')) {
        setEmailNotConfirmed(true);
      }
      // Error is handled by AuthContext
    }
  };




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Go-to-Resto Login</Text>
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
      {emailNotConfirmed && (
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <Text style={{ color: '#FF6F61', fontWeight: 'bold', marginBottom: 8 }}>
            Please confirm your email address to log in.
          </Text>
          <Button
            title="Resend Confirmation Email"
            onPress={() => navigation.replace('EmailConfirmation', { email })}
            color="#FF6F61"
          />
        </View>
      )}
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
        <Text style={styles.link}>No account? Register</Text>
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
