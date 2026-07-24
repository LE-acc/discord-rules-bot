import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** e.g. 1232 -> "1,232" and 2200 -> "2.2k" when compact. */
export function formatNumber(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return `${round(n / 1000, 1)}k`;
  }
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function greeting(locale: 'ar' | 'en', name?: string): string {
  const h = new Date().getHours();
  if (locale === 'ar') {
    const part = h < 12 ? 'صباح الخير' : h < 18 ? 'مساء الخير' : 'مساء الخير';
    return name ? `${part}، ${name}` : part;
  }
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}

/** Percentage clamped 0..100 for progress rings/bars. */
export function pct(value: number, target: number): number {
  if (!target) return 0;
  return clamp((value / target) * 100, 0, 100);
}
