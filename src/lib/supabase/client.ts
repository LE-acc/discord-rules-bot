'use client';

import { createBrowserClient } from '@supabase/ssr';
import { config, isSupabaseConfigured } from '@/lib/config';

/**
 * Browser Supabase client. Returns null when Supabase isn't configured so the
 * app can transparently fall back to local (demo) mode.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}
