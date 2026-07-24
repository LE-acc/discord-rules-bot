'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { useCloudSync } from '@/hooks/useCloudSync';

/**
 * Applies theme + locale/dir to <html>, registers the service worker,
 * and keeps everything reactive to store changes.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);
  const locale = useStore((s) => s.locale);
  useCloudSync();

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      let t = theme;
      if (t === 'system') {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.classList.toggle('dark', t === 'dark');
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  // Locale + direction
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', locale);
    root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }, [locale]);

  // Service worker (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return <>{children}</>;
}
