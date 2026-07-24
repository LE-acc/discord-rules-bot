'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';

// Minimal typings for the Web Speech API (not in lib.dom for all TS versions).
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

/**
 * Voice capture. Prefers the on-device Web Speech API (instant, free, works
 * offline on iOS/Android). Falls back to recording audio and posting it to the
 * Whisper endpoint when the browser API is unavailable.
 */
export function useVoice(onText: (text: string) => void) {
  const locale = useStore((s) => s.locale);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(Boolean(SR) || Boolean(navigator.mediaDevices?.getUserMedia));
  }, []);

  const startNative = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;
    const rec: SpeechRecognitionLike = new SR();
    rec.lang = locale === 'ar' ? 'ar-SA' : 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? '';
      if (text) onText(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
    return true;
  }, [locale, onText]);

  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('audio', blob, 'voice.webm');
        const res = await fetch('/api/ai/voice', { method: 'POST', body: form });
        if (res.ok) {
          const { text } = await res.json();
          if (text) onText(text);
        }
        setListening(false);
      };
      mediaRef.current = mr;
      mr.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [onText]);

  const start = useCallback(() => {
    if (listening) return;
    if (!startNative()) startWhisper();
  }, [listening, startNative, startWhisper]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    setListening(false);
  }, []);

  return { start, stop, listening, supported };
}
