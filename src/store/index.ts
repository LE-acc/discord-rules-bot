'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EMPTY_MACROS } from '@/types';
import type {
  Achievement,
  ChatMessage,
  ExerciseLog,
  FastingSession,
  FoodItem,
  Goals,
  Locale,
  Macros,
  MealCategory,
  MealLog,
  ThemeMode,
  UserProfile,
  WeightEntry,
  BodyMeasurement,
  DailySummary,
} from '@/types';
import { deriveGoals } from '@/lib/nutrition';
import { sumMacros } from '@/lib/meal-parser';
import { uid, todayISO } from '@/lib/utils';
import { seedAchievements } from '@/lib/achievements';

interface WaterStepEntry {
  date: string;
  water: number; // ml
  steps: number;
}

interface NutriState {
  hydrated: boolean;
  locale: Locale;
  theme: ThemeMode;
  profile: UserProfile;
  meals: MealLog[];
  weights: WeightEntry[];
  measurements: BodyMeasurement[];
  exercises: ExerciseLog[];
  daily: WaterStepEntry[];
  chat: ChatMessage[];
  fasting: FastingSession | null;
  achievements: Achievement[];
  favorites: string[]; // food-db ids
  recent: string[]; // food-db ids

  // actions
  setLocale: (l: Locale) => void;
  setTheme: (t: ThemeMode) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setGoals: (patch: Partial<Goals>) => void;

  addMeal: (meal: Omit<MealLog, 'id' | 'macros'> & { macros?: Macros }) => MealLog;
  updateMealItem: (mealId: string, itemId: string, patch: Partial<FoodItem>) => void;
  removeMeal: (mealId: string) => void;

  addWeight: (e: Omit<WeightEntry, 'id'>) => void;
  removeWeight: (id: string) => void;
  addMeasurement: (m: Omit<BodyMeasurement, 'id'>) => void;

  addExercise: (e: Omit<ExerciseLog, 'id'>) => void;
  removeExercise: (id: string) => void;

  addWater: (ml: number, date?: string) => void;
  setSteps: (steps: number, date?: string) => void;

  addChat: (m: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
  clearChat: () => void;

  startFasting: (protocol: string, fastingHours: number) => void;
  stopFasting: () => void;

  toggleFavorite: (id: string) => void;
  pushRecent: (id: string) => void;

  summaryFor: (date: string) => DailySummary;
  reset: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'local',
  name: '',
  locale: 'ar',
  theme: 'dark',
  heightCm: 175,
  age: 28,
  sex: 'male',
  activityLevel: 'light',
  weekStart: 'sunday',
  goals: deriveGoals(2200, 90, 77),
};

function recalcMeal(meal: MealLog): MealLog {
  return { ...meal, macros: sumMacros(meal.items) };
}

export const useStore = create<NutriState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      locale: 'ar',
      theme: 'dark',
      profile: DEFAULT_PROFILE,
      meals: [],
      weights: [{ id: uid(), weight: 90, recordedAt: todayISO() }],
      measurements: [],
      exercises: [],
      daily: [],
      chat: [],
      fasting: null,
      achievements: seedAchievements(),
      favorites: ['egg', 'chicken-breast', 'white-rice', 'whey'],
      recent: [],

      setLocale: (locale) => {
        set({ locale });
        set((s) => ({ profile: { ...s.profile, locale } }));
      },
      setTheme: (theme) => {
        set({ theme });
        set((s) => ({ profile: { ...s.profile, theme } }));
      },
      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      setGoals: (patch) =>
        set((s) => ({ profile: { ...s.profile, goals: { ...s.profile.goals, ...patch } } })),

      addMeal: (meal) => {
        const full: MealLog = recalcMeal({
          id: uid('meal-'),
          loggedAt: meal.loggedAt ?? new Date().toISOString(),
          category: meal.category,
          items: meal.items,
          source: meal.source,
          confidence: meal.confidence,
          note: meal.note,
          imageUrl: meal.imageUrl,
          macros: meal.macros ?? { ...EMPTY_MACROS },
        });
        set((s) => ({ meals: [full, ...s.meals] }));
        meal.items.forEach((i) => {
          const dbId = i.id.split('-')[0];
          if (dbId) get().pushRecent(dbId);
        });
        return full;
      },
      updateMealItem: (mealId, itemId, patch) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.id !== mealId
              ? m
              : recalcMeal({
                  ...m,
                  items: m.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
                }),
          ),
        })),
      removeMeal: (mealId) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== mealId) })),

      addWeight: (e) =>
        set((s) => ({
          weights: [{ ...e, id: uid('w-') }, ...s.weights].sort(
            (a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt),
          ),
        })),
      removeWeight: (id) => set((s) => ({ weights: s.weights.filter((w) => w.id !== id) })),
      addMeasurement: (m) =>
        set((s) => ({ measurements: [{ ...m, id: uid('m-') }, ...s.measurements] })),

      addExercise: (e) =>
        set((s) => ({ exercises: [{ ...e, id: uid('ex-') }, ...s.exercises] })),
      removeExercise: (id) =>
        set((s) => ({ exercises: s.exercises.filter((x) => x.id !== id) })),

      addWater: (ml, date = todayISO()) =>
        set((s) => {
          const found = s.daily.find((d) => d.date === date);
          if (found) {
            return {
              daily: s.daily.map((d) =>
                d.date === date ? { ...d, water: Math.max(0, d.water + ml) } : d,
              ),
            };
          }
          return { daily: [...s.daily, { date, water: Math.max(0, ml), steps: 0 }] };
        }),
      setSteps: (steps, date = todayISO()) =>
        set((s) => {
          const found = s.daily.find((d) => d.date === date);
          if (found) {
            return { daily: s.daily.map((d) => (d.date === date ? { ...d, steps } : d)) };
          }
          return { daily: [...s.daily, { date, water: 0, steps }] };
        }),

      addChat: (m) => {
        const msg: ChatMessage = { ...m, id: uid('c-'), createdAt: new Date().toISOString() };
        set((s) => ({ chat: [...s.chat, msg] }));
        return msg;
      },
      clearChat: () => set({ chat: [] }),

      startFasting: (protocol, fastingHours) => {
        const now = new Date();
        const ends = new Date(now.getTime() + fastingHours * 3600_000);
        set({
          fasting: {
            id: uid('f-'),
            protocol,
            fastingHours,
            eatingHours: 24 - fastingHours,
            startedAt: now.toISOString(),
            endsAt: ends.toISOString(),
            completed: false,
          },
        });
      },
      stopFasting: () => set({ fasting: null }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      pushRecent: (id) =>
        set((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 12) })),

      summaryFor: (date) => {
        const s = get();
        const meals = s.meals.filter((m) => m.loggedAt.slice(0, 10) === date);
        const consumed = meals.reduce<Macros>(
          (acc, m) => ({
            calories: acc.calories + m.macros.calories,
            protein: acc.protein + m.macros.protein,
            carbs: acc.carbs + m.macros.carbs,
            fat: acc.fat + m.macros.fat,
            fiber: acc.fiber + m.macros.fiber,
            sugar: acc.sugar + m.macros.sugar,
            sodium: acc.sodium + m.macros.sodium,
          }),
          { ...EMPTY_MACROS },
        );
        const burned = s.exercises
          .filter((e) => e.loggedAt.slice(0, 10) === date)
          .reduce((a, e) => a + e.caloriesBurned, 0);
        const day = s.daily.find((d) => d.date === date);
        return {
          date,
          consumed,
          burned,
          water: day?.water ?? 0,
          steps: day?.steps ?? 0,
          meals,
        };
      },

      reset: () =>
        set({
          meals: [],
          weights: [{ id: uid(), weight: 90, recordedAt: todayISO() }],
          exercises: [],
          measurements: [],
          daily: [],
          chat: [],
          fasting: null,
          achievements: seedAchievements(),
        }),
    }),
    {
      name: 'nutriai-store',
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        profile: s.profile,
        meals: s.meals,
        weights: s.weights,
        measurements: s.measurements,
        exercises: s.exercises,
        daily: s.daily,
        chat: s.chat,
        fasting: s.fasting,
        achievements: s.achievements,
        favorites: s.favorites,
        recent: s.recent,
      }),
      onRehydrateStorage: () => (state) => {
        state && (state.hydrated = true);
      },
    },
  ),
);

/** Convenience selector for "today". */
export function useToday(): DailySummary {
  const summaryFor = useStore((s) => s.summaryFor);
  // Recompute on meals/daily/exercise change.
  useStore((s) => s.meals);
  useStore((s) => s.daily);
  useStore((s) => s.exercises);
  return summaryFor(todayISO());
}
