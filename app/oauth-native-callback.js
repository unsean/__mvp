import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function OAuthNativeCallback() {
  const router = useRouter();

  useEffect(() => {
    // Clerk will complete the OAuth in the background once the app is opened
    // After a short delay, navigate into the app
    const t = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 300);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
