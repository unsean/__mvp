import * as React from 'react';
import { Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import CustomAlert from '../../components/atoms/CustomAlert';
import FormInput from '../../components/atoms/FormInput';

const styles = {
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, padding: 24, justifyContent: 'center', maxWidth: 400, alignSelf: 'center', width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 32 },
  divider: { alignItems: 'center', marginVertical: 20 },
  dividerText: { fontSize: 14, color: '#999' },
  button: { backgroundColor: '#FF6F61', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, minHeight: 52, justifyContent: 'center', shadowColor: '#FF6F61', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  oauthButton: { borderWidth: 1, borderColor: '#e1e5e9', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', minHeight: 52, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  oauthButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  oauthButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 4 },
  footerText: { fontSize: 16, color: '#666' },
  linkText: { fontSize: 16, color: '#FF6F61', fontWeight: '600' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 24 },
  codeInput: { width: 45, height: 55, borderWidth: 2, borderColor: '#e1e5e9', borderRadius: 12, fontSize: 24, fontWeight: 'bold', color: '#333', backgroundColor: '#fff', textAlign: 'center' },
};

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [appleLoading, setAppleLoading] = React.useState(false);
  const [alert, setAlert] = React.useState({ visible: false, title: '', message: '', type: 'info' });
  const codeInputRefs = React.useRef([]);
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  const showAlert = (title, message, type = 'error') => setAlert({ visible: true, title, message, type });
  const hideAlert = () => setAlert({ visible: false, title: '', message: '', type: 'info' });

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;
    if (!emailAddress.trim()) return showAlert('Missing Email', 'Please enter your email address to continue.');
    if (!password.trim()) return showAlert('Missing Password', 'Please enter a password to continue.');
    if (password.length < 8) return showAlert('Weak Password', 'Password must be at least 8 characters long.');
    setLoading(true);
    try {
      await signUp.create({ emailAddress, password, firstName: 'User', lastName: 'Account' });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      showAlert('Verification Sent', 'Please check your email for the verification code.', 'success');
    } catch (err) {
      const errorMessage = err.errors?.[0]?.message;
      if (errorMessage?.includes('already exists')) showAlert('Account Exists', 'An account with this email already exists. Please sign in instead.');
      else if (errorMessage?.includes('password')) showAlert('Invalid Password', 'Password must be at least 8 characters and contain letters and numbers.');
      else showAlert('Sign Up Failed', errorMessage || 'Something went wrong. Please try again later.');
    } finally { setLoading(false); }
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, '').slice(-1);
    setCode(newCode);
    if (text && index < 5) codeInputRefs.current[index + 1]?.focus();
    if (text && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6 && fullCode.match(/^\d{6}$/)) setTimeout(() => onVerifyPress(), 300);
    }
  };

  const handleCodeKeyPress = (key, index) => { 
    if (key === 'Backspace' && !code[index] && index > 0) codeInputRefs.current[index - 1]?.focus(); 
  };

  const onVerifyPress = async () => {
    if (!isLoaded || verifyLoading) return;
    const fullCode = code.join('').trim();
    if (fullCode.length !== 6) return showAlert('Incomplete Code', `Please enter all 6 digits. Currently entered: ${fullCode.length} digits.`);
    if (!fullCode.match(/^\d{6}$/)) return showAlert('Invalid Format', 'Please enter only numbers.');
    setVerifyLoading(true);
    try {
      await signUp.attemptEmailAddressVerification({ code: fullCode });
      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        showAlert('Success!', 'Account verified successfully. Welcome!', 'success');
        router.replace('/(tabs)/home');
      } else {
        showAlert('Verification Issue', 'Account verified but session not created. Please sign in manually.');
        router.replace('/(auth)/sign-in');
      }
    } catch (err) {
      const errorMessage = err.errors?.[0]?.message || err.message;
      if (errorMessage?.includes('Invalid') || errorMessage?.includes('incorrect') || errorMessage?.includes('wrong')) {
        showAlert('Invalid Code', 'The verification code is incorrect. Please check your email and try again.');
        setCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      } else if (errorMessage?.includes('expired')) {
        showAlert('Code Expired', 'The verification code has expired. Please request a new one.');
        setCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      } else if (errorMessage?.includes('already') || errorMessage?.includes('verified')) {
        showAlert('Already Verified', 'Your account is already verified. Please sign in.', 'success');
        setTimeout(() => { router.replace('/(auth)/sign-in'); }, 1500);
      } else {
        showAlert('Verification Failed', errorMessage || 'Unable to verify your account. Please try again.');
        setCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      }
    } finally { setVerifyLoading(false); }
  };

  const onGooglePress = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('oauth-native-callback');
      const { createdSessionId, setActive } = await googleAuth({ redirectUrl });
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        showAlert('Welcome!', 'Successfully signed up with Google. Redirecting...', 'success');
        setTimeout(() => { router.replace('/(tabs)'); }, 1500);
      }
    } catch (err) {
      showAlert('Google Sign Up Failed', 'Unable to sign up with Google. Please try again or use email.');
    } finally { setGoogleLoading(false); }
  };

  const onApplePress = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    try {
      const redirectUrl = Linking.createURL('oauth-native-callback');
      const { createdSessionId, setActive } = await appleAuth({ redirectUrl });
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        showAlert('Welcome!', 'Successfully signed up with Apple. Redirecting...', 'success');
        setTimeout(() => { router.replace('/(tabs)'); }, 1500);
      }
    } catch (err) {
      showAlert('Apple Sign Up Failed', 'Unable to sign up with Apple. Please try again or use email.');
    } finally { setAppleLoading(false); }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} enabled>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false} bounces={false} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
            <Text style={styles.title}>Verify your email</Text>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <FormInput
                  key={index}
                  ref={el => (codeInputRefs.current[index] = el)}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.codeInput}
                  autoFocus={index === 0}
                  onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                />
              ))}
            </View>
            <TouchableOpacity style={[styles.button, verifyLoading && styles.buttonDisabled]} onPress={onVerifyPress} disabled={verifyLoading}>
              {verifyLoading ? <LoadingSpinner size={20} color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <CustomAlert visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={hideAlert} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} enabled>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false} bounces={false} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
          <View style={styles.content}>
            <Text style={styles.title}>Sign up</Text>
            <FormInput
              ref={emailRef}
              label="Email Address"
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
            <FormInput
              ref={passwordRef}
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSignUpPress}
            />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignUpPress} disabled={loading}>
              {loading ? <LoadingSpinner size={20} color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
            <View style={styles.divider}><Text style={styles.dividerText}>or</Text></View>
            <TouchableOpacity style={[styles.oauthButton, googleLoading && styles.buttonDisabled]} onPress={onGooglePress} disabled={googleLoading}>
              <View style={styles.oauthButtonContent}>
                {googleLoading ? <LoadingSpinner size={18} color="#333" /> : <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 8 }} />}
                <Text style={styles.oauthButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.oauthButton, appleLoading && styles.buttonDisabled]} onPress={onApplePress} disabled={appleLoading}>
              <View style={styles.oauthButtonContent}>
                {appleLoading ? <LoadingSpinner size={18} color="#333" /> : <Ionicons name="logo-apple" size={20} color="#000" style={{ marginRight: 8 }} />}
                <Text style={styles.oauthButtonText}>Continue with Apple</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={hideAlert} />
    </SafeAreaView>
  );
}
