import { isoDate } from './utils';
import type { MealLog, WeightEntry } from '@/types';

export type Range = 'week' | 'month' | 'year';

const RANGE_DAYS: Record<Range, number> = { week: 7, month: 30, year: 365 };

export interface Series {
  labels: string[];
  calories: number[];
  protein: number[];
  keys: string[]; // ISO date keys
}

/** Bucket meals into a daily (week/month) or monthly (year) series. */
export function buildSeries(meals: MealLog[], range: Range, locale: 'ar' | 'en'): Series {
  const now = new Date();
  if (range === 'year') {
    const labels: string[] = [];
    const calories: number[] = [];
    const protein: number[] = [];
    const keys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      keys.push(key);
      labels.push(new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' }).format(d));
      const monthMeals = meals.filter((m) => m.loggedAt.slice(0, 7) === key);
      const days = new Set(monthMeals.map((m) => m.loggedAt.slice(0, 10))).size || 1;
      calories.push(Math.round(monthMeals.reduce((a, m) => a + m.macros.calories, 0) / days));
      protein.push(Math.round(monthMeals.reduce((a, m) => a + m.macros.protein, 0) / days));
    }
    return { labels, calories, protein, keys };
  }

  const days = RANGE_DAYS[range];
  const labels: string[] = [];
  const calories: number[] = [];
  const protein: number[] = [];
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = isoDate(d);
    keys.push(key);
    labels.push(
      range === 'week'
        ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }).format(d)
        : new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric' }).format(d),
    );
    const dayMeals = meals.filter((m) => m.loggedAt.slice(0, 10) === key);
    calories.push(Math.round(dayMeals.reduce((a, m) => a + m.macros.calories, 0)));
    protein.push(Math.round(dayMeals.reduce((a, m) => a + m.macros.protein, 0)));
  }
  return { labels, calories, protein, keys };
}

export function average(nums: number[]): number {
  const nonZero = nums.filter((n) => n > 0);
  if (!nonZero.length) return 0;
  return Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length);
}

/** Consecutive-day logging streak ending today. */
export function currentStreak(meals: MealLog[]): number {
  const logged = new Set(meals.map((m) => m.loggedAt.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  // Allow today to be empty without breaking a streak until tomorrow.
  if (!logged.has(isoDate(d))) d.setDate(d.getDate() - 1);
  while (logged.has(isoDate(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function weightChange(weights: WeightEntry[], days: number): number {
  if (weights.length < 2) return 0;
  const sorted = [...weights].sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const inRange = sorted.filter((w) => +new Date(w.recordedAt) >= +cutoff);
  const first = inRange[0] ?? sorted[0];
  const last = sorted[sorted.length - 1];
  return Math.round((last.weight - first.weight) * 10) / 10;
}
