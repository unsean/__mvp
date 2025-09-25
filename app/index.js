import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignOutButton from './components/SignOutButton';

export default function HomePage() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SignedIn>
          <Text style={styles.title}>Hello {user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <Text style={styles.title}>Welcome to Go-to-Resto</Text>
          <View style={styles.authLinks}>
            <Link href="/(auth)/sign-in" style={styles.link}>
              <Text style={styles.linkText}>Sign in</Text>
            </Link>
            <Link href="/(auth)/sign-up" style={styles.link}>
              <Text style={styles.linkText}>Sign up</Text>
            </Link>
          </View>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  authLinks: {
    gap: 16,
  },
  link: {
    backgroundColor: '#FF6F61',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
