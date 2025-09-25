import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import our utilities and components
import FormInput from '../../components/atoms/FormInput';
import CustomAlert from '../../components/atoms/CustomAlert';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import useFormValidation from '../../utils/useFormValidation';
import { colors } from '../../theme/colors';
import { logError } from '../../utils/errorHandler';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState({});

  // Show alert helper
  const showAlert = (title, message, type = 'info') => {
    setAlertProps({ title, message, type });
    setAlertVisible(true);
  };

  // Form validation hook
  const { 
    values, 
    errors, 
    touched,
    isSubmitting,
    handleChange, 
    handleBlur, 
    handleSubmit, 
    resetForm 
  } = useFormValidation(
    { emailAddress: '', password: '' },
    async (values) => {
      if (!isLoaded) return;
      
      try {
        const completeSignIn = await signIn.create({
          identifier: values.emailAddress,
          password: values.password,
        });

        await setActive({ session: completeSignIn.createdSessionId });
        // Navigation happens automatically via Clerk's session state
      } catch (err) {
        logError('SignInScreen.onSignIn', err);
        
        // Get specific error message
        let errorMessage = 'Sign in failed';
        if (err.errors && err.errors[0]) {
          const clerkError = err.errors[0];
          
          // Handle specific error types
          if (clerkError.code === 'form_identifier_not_found') {
            errorMessage = 'Account not found. Please check your email or sign up.';
          } else if (clerkError.code === 'form_password_incorrect') {
            errorMessage = 'Incorrect password. Please try again.';
          } else {
            errorMessage = clerkError.message;
          }
        }
        
        showAlert('Sign In Failed', errorMessage, 'error');
      }
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            <View style={styles.form}>
              <FormInput
                label="Email"
                value={values.emailAddress}
                onChangeText={(text) => handleChange('emailAddress', text)}
                onBlur={() => handleBlur('emailAddress')}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={touched.emailAddress && errors.emailAddress}
              />

              <FormInput
                label="Password"
                value={values.password}
                onChangeText={(text) => handleChange('password', text)}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                error={touched.password && errors.password}
              />
              
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, (isSubmitting || !values.emailAddress || !values.password) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting || !values.emailAddress || !values.password}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <LoadingSpinner size={20} color="#fff" />
                    <Text style={styles.buttonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
              
              {/* Social sign-in options */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={20} color="#000" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertProps.title}
          message={alertProps.message}
          type={alertProps.type}
          onClose={() => setAlertVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: colors.muted,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: colors.muted,
  },
  linkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
