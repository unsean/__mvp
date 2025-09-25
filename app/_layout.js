import 'react-native-gesture-handler';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AuthProvider } from '../contexts/AuthContext';
import * as WebBrowser from 'expo-web-browser';

// Ensure the auth session can be completed when the app is opened via the OAuth redirect
WebBrowser.maybeCompleteAuthSession();

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && !inTabsGroup) {
      router.replace('/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded]);

  return <Slot />;
};

const AuthSync = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !isUserLoaded || !isSignedIn || !user) return;
      try {
        // Ensure Clerk profile has basic names
        if ((!user.firstName || !user.lastName) && user.update) {
          const emailLocal = user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
          const [firstName, ...rest] = (user.firstName || emailLocal).split(' ');
          const lastName = user.lastName || rest.join(' ');
          await user.update({ firstName: firstName || 'User', lastName: lastName || 'Account' });
        }
      } catch (err) {
        console.warn('[AuthSync] Failed syncing user profile:', err?.message || err);
      }
    };
    sync();
  }, [isLoaded, isUserLoaded, isSignedIn, user?.id]);

  return null;
};

const RootLayout = () => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AuthProvider>
        <FavoritesProvider>
          <AuthSync />
          <InitialLayout />
        </FavoritesProvider>
      </AuthProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
