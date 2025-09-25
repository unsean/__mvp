import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Runtime flag to fully disable Supabase (no network). Set in .env:
// EXPO_PUBLIC_DISABLE_SUPABASE=true
const DISABLE_SUPABASE = String(process.env.EXPO_PUBLIC_DISABLE_SUPABASE || '').toLowerCase() === 'true';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fmmiultheqsoeemrrxnk.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create supabase client or no-op object based on DISABLE_SUPABASE flag
let supabase;

if (DISABLE_SUPABASE) {
  // Export a no-op supabase-like object to avoid crashes in import sites
  // Common chain calls: supabase.from('table').select(...)
  const noop = () => ({
    select: async () => [],
    insert: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    eq: noop,
    ilike: noop,
    order: noop,
    single: async () => ({ data: null, error: null }),
  });

  // Minimal shape
  supabase = {
    from: noop,
    auth: {
      getSession: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export { supabase };
