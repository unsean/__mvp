import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/atoms/CustomAlert';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import { colors } from '../theme/colors';
import { validateNumber } from '../utils/validation';
import { getErrorMessage, logError } from '../utils/errorHandler';

export default function EmailConfirmationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params || {};
  const [sending, setSending] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({});

  const showAlert = (title, message, type = 'info') => {
    setAlertProps({ title, message, type });
    setAlertVisible(true);
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      showAlert('Confirmation Sent', 'A new verification code has been sent to your email. If you do not receive it, check your spam folder or contact support below.', 'success');
    } catch (e) {
      logError('EmailConfirmationScreen.handleResend', e);
      showAlert('Error', getErrorMessage(e, 'Could not resend verification code.') + '\nIf you did not receive the code, check your spam folder or contact support below.', 'error');
    }
    setSending(false);
  };

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Helper to split code for square inputs
  const codeDigits = code.split('').concat(Array(6).fill('')).slice(0, 6);
  const inputRefs = Array.from({ length: 6 }, () => useRef());

  const handleDigit = (d, idx) => {
    if (!/^[0-9]?$/.test(d)) return;
    let arr = code.split('');
    arr[idx] = d;
    const newCode = arr.join('').slice(0, 6);
    setCode(newCode);
    if (d && idx < 5) {
      inputRefs[idx + 1].current?.focus();
    }
    if (newCode.length === 6 && newCode.split('').every(x => x)) {
      handleVerify(newCode);
    }
  }

  const handleVerify = async (inputCode = code) => {
    setVerifying(true);
    try {
      // DEBUG: Log email and code used for verification
      console.log('[OTP VERIFY] Email:', email, 'Code:', inputCode);
      const { data, error } = await supabase.auth.verifyOtp({ email, token: inputCode, type: 'email' });
      if (error) throw error;
      // Insert into profiles table ONLY after successful OTP verification and confirmed email.
      // This is the ONLY place where user data is inserted into the profiles table after registration.
      // Prefer name from params, fallback to user metadata
      const user = data?.user || (await supabase.auth.getUser()).data.user;
      const name = (route.params && route.params.name) || user?.user_metadata?.name || '';
      if (user && user.email_confirmed_at) {
        try {
          await supabase.from('profiles').insert([
            { id: user.id, email: user.email, name }
          ], { upsert: false });
        } catch (insertErr) {
          // Ignore duplicate error
        }
      }
      // After successful OTP verification, sign in user so 'Main' is available
      const password = route.params?.password;
      if (password) {
        console.log('[OTP VERIFY] Signing in user after verification');
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.log('[OTP VERIFY] Sign-in error:', signInError);
          logError('EmailConfirmationScreen.handleVerify', signInError);
          showAlert('Error', getErrorMessage(signInError, 'Sign-in failed after verification. Please log in.'), 'error');
          setVerifying(false);
          return;
        }
      } else {
        console.log('[OTP VERIFY] No password available to auto sign-in after verification.');
        showAlert('Verified!', 'Your email is verified. Please log in.', 'success');
        navigation.replace('Login');
        setVerifying(false);
        return;
      }
      // Do NOT navigate to 'Main' here. Let the AuthContext/app navigator handle navigation after sign-in.
      // The user will be routed to the main app automatically when authenticated.
      console.log('[OTP VERIFY] Sign-in complete. Waiting for auth state change to route user.');
    } catch (e) {
      logError('EmailConfirmationScreen.handleVerify', e);
      showAlert('Error', getErrorMessage(e, 'Verification failed.'), 'error');
      setCode('');
      inputRefs[0]?.current?.focus();
    }
    setVerifying(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.instructions}>
        We've sent a 6-digit code to your email:
      </Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.instructions}>
        Please enter the code below to activate your account.
      </Text>
      <View style={styles.codeRow}>
        {codeDigits.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={inputRefs[idx]}
            style={styles.codeBox}
            value={digit}
            onChangeText={d => handleDigit(d, idx)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            returnKeyType="next"
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digit && idx > 0) {
                inputRefs[idx - 1].current?.focus();
              }
            }}
            autoFocus={idx === 0}
          />
        ))}
      </View>
      <View style={{ height: 24 }} />
      {/* Verify Button with Loading State */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton, (verifying || code.length !== 6) && styles.buttonDisabled]}
        onPress={() => handleVerify(code)}
        disabled={verifying || code.length !== 6}
      >
        {verifying ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={20} color="#fff" />
            <Text style={styles.buttonText}>Verifying...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
      
      {/* Resend Button */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, sending && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={sending}
      >
        {sending ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Sending...</Text>
          </View>
        ) : (
          <Text style={styles.secondaryButtonText}>Resend Code</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 18 }} />
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Register' }] })}
      >
        <Text style={styles.outlineButtonText}>Try Another Email</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.textButton]}
        onPress={() => {
          showAlert(
            'Contact Support',
            'Please email support@yourapp.com with your registered email and a description of your issue. We will help you verify your account.'
          );
        }}
      >
        <View style={styles.supportButtonContent}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
          <Text style={styles.textButtonText}>Contact Support</Text>
        </View>
      </TouchableOpacity>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertProps.title}
        message={alertProps.message}
        type={alertProps.type}
        onClose={() => {
          setAlertVisible(false);
          // Navigate if alert was shown after successful verification
          if (alertProps.title === 'Verified!') {
            navigation.replace('Login');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.primary, 
    marginBottom: 16 
  },
  instructions: { 
    fontSize: 16, 
    color: '#444', 
    textAlign: 'center', 
    marginBottom: 10,
    lineHeight: 22
  },
  email: { 
    fontSize: 16, 
    color: '#222', 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  codeRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: 8 
  },
  codeBox: { 
    width: 44, 
    height: 54, 
    borderWidth: 2, 
    borderColor: '#FFB300', 
    borderRadius: 12, 
    marginHorizontal: 6, 
    fontSize: 28, 
    color: '#222', 
    backgroundColor: '#fafafa', 
    textAlign: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
    maxWidth: 320
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.muted
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10
  },
  buttonDisabled: {
    backgroundColor: '#eee',
    borderColor: '#ddd',
    shadowOpacity: 0
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600'
  },
  outlineButtonText: {
    color: '#555',
    fontSize: 16
  },
  textButtonText: {
    color: colors.muted,
    fontSize: 14
  },
  error: { 
    color: colors.error, 
    marginBottom: 12 
  },
  link: { 
    color: colors.primary, 
    marginTop: 18, 
    fontWeight: 'bold' 
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
