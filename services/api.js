import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';

// API configuration - using Supabase instead of local backend
const API_BASE = 'https://fmmiultheqsoeemrrxnk.supabase.co/rest/v1';

console.log('[api.js] Platform.OS:', Platform.OS);
console.log('[api.js] API_BASE in use:', API_BASE);

const DISABLE_SUPABASE = String(process.env.EXPO_PUBLIC_DISABLE_SUPABASE || '').toLowerCase() === 'true';

let instance;

if (DISABLE_SUPABASE) {
  console.warn('[api.js] Supabase disabled via EXPO_PUBLIC_DISABLE_SUPABASE=true. Using mock API client.');
  const ok = (data = null) => Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config: {} });
  const mock = {
    get: ok,
    post: ok,
    put: ok,
    patch: ok,
    delete: ok,
    request: ok,
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
    defaults: {},
  };
  instance = mock;
} else {
  instance = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  // Attach Clerk JWT token if available
  instance.interceptors.request.use(async (config) => {
    let token = null;
    try {
      token = await AsyncStorage.getItem('clerk_token');
    } catch {}
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}

export default instance;
