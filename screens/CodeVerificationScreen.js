import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import CustomAlert from '../components/atoms/CustomAlert';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import { colors } from '../theme/colors';
import { validateNumber } from '../utils/validation';

export default function CodeVerificationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({});
  // Refs for TextInput focus management
  const inputRefs = useRef([]);

  const showAlert = (title, message, type = 'info') => {
    setAlertProps({ title, message, type });
    setAlertVisible(true);
  };

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !validateNumber(text)) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-focus next input if this one is filled
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Join the code array into a single string
      const codeString = code.join('');
      if (codeString.length !== 6) {
        showAlert('Invalid Code', 'Please enter all 6 digits of your verification code.', 'error');
        setVerifying(false);
        return;
      }
      
      // DEBUG: Log email and code used for verification
      console.log('[OTP VERIFY] Email:', email, 'Code:', codeString);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codeString,
        type: 'email',
      });
      if (error) throw error;
      // Insert into profiles table ONLY after successful OTP verification and confirmed email.
      // This is the ONLY place where user data is inserted into the profiles table after registration.
      const user = data?.user || (await supabase.auth.getUser()).data.user;
      // Prefer name from params, fallback to user metadata
      let userName = (route.params && route.params.name) || user?.user_metadata?.name || '';
      if (user && user.email_confirmed_at) {
        try {
          await supabase.from('profiles').insert([
            { id: user.id, email: user.email, name: userName }
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
          showAlert('Error', signInError.message || 'Sign-in failed after verification. Please log in.', 'error');
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
      showAlert('Error', e.message || 'Verification failed.', 'error');
    }
    setVerifying(false);
  };

  const handleResend = async () => {
    try {
      await supabase.auth.signUpWithOtp({ email });
      showAlert('Code Sent', 'A new verification code has been sent to your email.', 'success');
    } catch (e) {
      showAlert('Error', e.message || 'Could not resend code.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.instructions}>A 6-digit code was sent to:</Text>
      <Text style={styles.email}>{email}</Text>
      
      {/* Code input boxes */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={el => inputRefs.current[index] = el}
            style={styles.codeInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            autoFocus={index === 0}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                // Move to previous input on backspace if current is empty
                inputRefs.current[index - 1].focus();
              }
            }}
          />
        ))}
      </View>
      
      {/* Verify Button with Loading State */}
      <TouchableOpacity
        style={[styles.button, (verifying || code.join('').length !== 6) && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={verifying || code.join('').length !== 6}
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
        style={styles.resendButton}
        onPress={handleResend}
      >
        <Text style={styles.resendButtonText}>Resend Code</Text>
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
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.primary, 
    marginBottom: 16 
  },
  instructions: { 
    fontSize: 16, 
    color: '#444', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  email: { 
    fontSize: 16, 
    color: '#222', 
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%'
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 45,
    height: 55,
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '80%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resendButton: {
    padding: 12,
    marginTop: 8
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
