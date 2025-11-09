import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://rspxxmrzgktejmaxnmlz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcHh4bXJ6Z2t0ZWptYXhubWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDU0MjksImV4cCI6MjA3NzU4MTQyOX0.XZyV16QYerZiC_h4uVN48WFbRZxWg1ZU8cjKkEVHccM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
