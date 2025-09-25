import { useSignIn, useOAuth, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useRef } from 'react';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import CustomAlert from '../../components/atoms/CustomAlert';
import FormInput from '../../components/atoms/FormInput';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [appleLoading, setAppleLoading] = React.useState(false);
  const [alert, setAlert] = React.useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '', type: 'info' });
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || loading) return;
    
    if (!emailAddress.trim()) {
      showAlert('Missing Email', 'Please enter your email address to continue.');
      return;
    }
    
    if (!password.trim()) {
      showAlert('Missing Password', 'Please enter your password to continue.');
      return;
    }

    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        showAlert('Welcome Back!', 'Successfully signed in. Redirecting...', 'success');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        showAlert('Sign In Incomplete', 'Please check your credentials and try again.');
      }
    } catch (err) {
      const errorMessage = err.errors?.[0]?.message;
      console.log('Sign in error:', errorMessage);
      
      if (errorMessage?.includes('Invalid') || errorMessage?.includes('incorrect')) {
        showAlert('Invalid Credentials', 'The email or password you entered is incorrect. Please try again.');
      } else if (errorMessage?.includes('not found') || errorMessage?.includes('Couldn\'t find your account')) {
        showAlert('Account Not Found', 'No account found with this email. Please check your email or sign up for a new account.');
      } else if (errorMessage?.includes('verification')) {
        showAlert('Account Not Verified', 'Please verify your email address before signing in. Check your email for the verification code.');
      } else {
        showAlert('Sign In Failed', errorMessage || 'Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onGooglePress = async () => {
    if (googleLoading) return;
    
    setGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-native-callback');
      const { createdSessionId, setActive } = await googleAuth({ redirectUrl });
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        // Force-refresh user and normalize names if missing
        try {
          await user?.reload?.();
          if (user && (!user.firstName || !user.lastName) && user.update) {
            const emailLocal = user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
            const [firstName, ...rest] = (user.firstName || emailLocal).split(' ');
            const lastName = user.lastName || rest.join(' ');
            await user.update({ firstName: firstName || 'User', lastName: lastName || 'Account' });
          }
        } catch {}
        showAlert('Success!', 'Welcome back!', 'success');
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      showAlert('Google Sign In Failed', 'Unable to sign in with Google. Please try again or use email/password.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onApplePress = async () => {
    if (appleLoading) return;
    
    setAppleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-native-callback');
      const { createdSessionId, setActive } = await appleAuth({ redirectUrl });
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        // Force-refresh user and normalize names if missing
        try {
          await user?.reload?.();
          if (user && (!user.firstName || !user.lastName) && user.update) {
            const emailLocal = user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
            const [firstName, ...rest] = (user.firstName || emailLocal).split(' ');
            const lastName = user.lastName || rest.join(' ');
            await user.update({ firstName: firstName || 'User', lastName: lastName || 'Account' });
          }
        } catch {}
        showAlert('Welcome!', 'Successfully signed in with Apple. Redirecting...', 'success');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      }
    } catch (err) {
      showAlert('Apple Sign In Failed', 'Unable to sign in with Apple. Please try again or use email/password.');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Sign in</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Enter your email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSignInPress}
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={onSignInPress}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size={20} color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <Text style={styles.dividerText}>or</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.oauthButton, googleLoading && styles.buttonDisabled]} 
              onPress={onGooglePress}
              disabled={googleLoading}
            >
              <View style={styles.oauthButtonContent}>
                {googleLoading ? (
                  <LoadingSpinner size={18} color="#333" />
                ) : (
                  <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.oauthButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.oauthButton, appleLoading && styles.buttonDisabled]} 
              onPress={onApplePress}
              disabled={appleLoading}
            >
              <View style={styles.oauthButtonContent}>
                {appleLoading ? (
                  <LoadingSpinner size={18} color="#333" />
                ) : (
                  <Ionicons name="logo-apple" size={20} color="#000" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.oauthButtonText}>Continue with Apple</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#FF6F61',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#FF6F61',
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
  },
  oauthButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
