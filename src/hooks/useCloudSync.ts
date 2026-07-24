'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { publicFlags } from '@/lib/config';

/**
 * Best-effort local-first cloud sync. When a Supabase session exists:
 *  - on mount, pulls the latest snapshot and merges it into the store,
 *  - thereafter pushes a debounced snapshot whenever tracked data changes.
 * Silently no-ops in demo mode or when signed out, so local usage is unaffected.
 */
export function useCloudSync() {
  const pulled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull once on mount.
  useEffect(() => {
    if (!publicFlags.supabase) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/state');
        const { authed, state } = await res.json();
        if (!authed || !state || cancelled) return;
        // Merge remote snapshot into local store (remote wins on conflict).
        useStore.setState((prev) => ({ ...prev, ...state, hydrated: true }));
      } catch {
        /* offline / not configured — keep local */
      } finally {
        pulled.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Push on change (debounced).
  useEffect(() => {
    if (!publicFlags.supabase) return;
    const unsub = useStore.subscribe((s) => {
      if (!pulled.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const snapshot = {
          profile: s.profile,
          meals: s.meals,
          weights: s.weights,
          measurements: s.measurements,
          exercises: s.exercises,
          daily: s.daily,
          fasting: s.fasting,
          favorites: s.favorites,
          recent: s.recent,
          locale: s.locale,
          theme: s.theme,
        };
        fetch('/api/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: snapshot }),
        }).catch(() => {});
      }, 1500);
    });
    return () => unsub();
  }, []);
}
