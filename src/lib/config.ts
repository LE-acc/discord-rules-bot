// Centralised runtime configuration + capability detection.
// Everything degrades gracefully: with no keys the app runs in demo mode.

export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'NutriAI',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  openaiKey: process.env.OPENAI_API_KEY || '',
  chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  visionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o',
  whisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  openFoodFactsBase:
    process.env.NEXT_PUBLIC_OPENFOODFACTS_BASE || 'https://world.openfoodfacts.org',
};

export const isSupabaseConfigured = Boolean(
  config.supabaseUrl && config.supabaseAnonKey,
);

export const isOpenAiConfigured = Boolean(config.openaiKey);

/** Public flags safe to expose to the client bundle. */
export const publicFlags = {
  supabase: isSupabaseConfigured,
  appName: config.appName,
};
