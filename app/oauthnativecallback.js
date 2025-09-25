import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function OAuthNativeCallbackNoDash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(tabs)');
    }, 300);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
