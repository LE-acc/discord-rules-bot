'use client';

import { useCallback, useState } from 'react';
import { useStore } from '@/store';
import type { AiParseResult, LogSource } from '@/types';

interface LogResponse extends AiParseResult {
  kind: 'meal' | 'coach';
}

/** Calls the AI endpoint, and when a meal is parsed, logs it to the store. */
export function useAiLog() {
  const [loading, setLoading] = useState(false);
  const addMeal = useStore((s) => s.addMeal);
  const summaryFor = useStore((s) => s.summaryFor);
  const goals = useStore((s) => s.profile.goals);

  const sendText = useCallback(
    async (
      text: string,
      opts: { source?: LogSource; history?: { role: 'user' | 'assistant'; content: string }[] } = {},
    ): Promise<LogResponse> => {
      setLoading(true);
      try {
        const today = summaryFor(new Date().toISOString().slice(0, 10));
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: opts.history ?? [],
            context: {
              consumed: today.consumed,
              goals,
              water: today.water,
            },
          }),
        });
        const data = (await res.json()) as LogResponse;
        if (data.kind === 'meal' && data.items.length > 0) {
          addMeal({
            category: data.category,
            items: data.items,
            source: opts.source ?? 'chat',
            confidence: data.confidence,
            loggedAt: new Date().toISOString(),
            macros: data.totals,
          });
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    [addMeal, goals, summaryFor],
  );

  const sendImage = useCallback(
    async (dataUrl: string): Promise<LogResponse> => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = (await res.json()) as LogResponse;
        if (data.items.length > 0) {
          addMeal({
            category: data.category,
            items: data.items,
            source: 'photo',
            confidence: data.confidence,
            loggedAt: new Date().toISOString(),
            macros: data.totals,
            imageUrl: dataUrl,
          });
        }
        return { ...data, kind: 'meal' };
      } finally {
        setLoading(false);
      }
    },
    [addMeal],
  );

  return { sendText, sendImage, loading };
}
