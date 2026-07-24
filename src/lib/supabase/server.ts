import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config, isSupabaseConfigured } from '@/lib/config';

/**
 * Server Supabase client bound to the request cookie store.
 * Returns null when Supabase isn't configured (demo mode).
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = cookies();
  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as never),
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}

/** Service-role client for privileged server operations (never sent to client). */
export function createAdminClient() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) return null;
  return createServerClient(config.supabaseUrl, config.supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
