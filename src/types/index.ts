// ─────────────────────────────────────────────────────────────
// Core domain types for NutriAI
// ─────────────────────────────────────────────────────────────

export type Locale = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** The nine tracked nutrients + water/steps live on the daily summary. */
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg
}

export const EMPTY_MACROS: Macros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

/** A single food item detected/parsed within a meal. */
export interface FoodItem {
  id: string;
  name: string;
  nameAr?: string;
  brand?: string;
  quantity: number; // in grams (or units when `unit` is set)
  unit?: string; // e.g. "بيضة", "كوب", "حبة"
  macros: Macros; // totals for the given quantity
  perServing?: Macros; // per 100g reference
  emoji?: string;
}

export type LogSource = 'chat' | 'photo' | 'voice' | 'barcode' | 'search' | 'manual';

export interface MealLog {
  id: string;
  userId?: string;
  category: MealCategory;
  items: FoodItem[];
  macros: Macros; // sum of items
  source: LogSource;
  confidence: number; // 0..1
  note?: string;
  loggedAt: string; // ISO
  imageUrl?: string;
}

export interface WeightEntry {
  id: string;
  userId?: string;
  weight: number; // kg
  bodyFat?: number; // %
  note?: string;
  photoUrl?: string;
  recordedAt: string; // ISO date
}

export interface BodyMeasurement {
  id: string;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  recordedAt: string;
}

export type ExerciseType =
  | 'gym'
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'other';

export interface ExerciseLog {
  id: string;
  userId?: string;
  type: ExerciseType;
  name: string;
  durationMin: number;
  distanceKm?: number;
  caloriesBurned: number;
  loggedAt: string;
}

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // ml
  steps: number;
  weightStart: number;
  weightTarget: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  locale: Locale;
  theme: ThemeMode;
  heightCm?: number;
  age?: number;
  sex?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: Goals;
  weekStart: 'sunday' | 'monday';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  imageUrl?: string;
  meal?: MealLog; // attached structured log when the AI logged food
  suggestions?: string[];
}

export interface FastingSession {
  id: string;
  protocol: string; // "16:8", "18:6", "20:4", "OMAD"
  fastingHours: number;
  eatingHours: number;
  startedAt: string;
  endsAt: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  emoji: string;
  unlockedAt?: string;
  progress: number; // 0..1
}

/** Structured response returned by the AI meal-parsing endpoint. */
export interface AiParseResult {
  reply: string;
  items: FoodItem[];
  category: MealCategory;
  confidence: number;
  totals: Macros;
  coach?: string;
  suggestions?: string[];
}

export interface DailySummary {
  date: string;
  consumed: Macros;
  burned: number;
  water: number;
  steps: number;
  meals: MealLog[];
}

export interface FoodDbEntry {
  id: string;
  name: string;
  nameAr: string;
  brand?: string;
  category: string;
  emoji: string;
  serving: number; // grams for the reference macros
  servingLabel?: string;
  macros: Macros; // per `serving`
  tags: string[];
}
