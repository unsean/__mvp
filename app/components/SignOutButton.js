import { useClerk } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

const SignOutButton = () => {
  const { signOut } = useClerk();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };
  
  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6F61',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignOutButton;
