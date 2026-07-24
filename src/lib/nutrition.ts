import type { ExerciseType, Goals, Macros, UserProfile } from '@/types';

// ─────────────────────────────────────────────────────────────
// Nutrition science helpers: BMR, TDEE, goal derivation, BMI,
// and calories-burned estimates for exercise.
// ─────────────────────────────────────────────────────────────

const ACTIVITY_FACTOR: Record<NonNullable<UserProfile['activityLevel']>, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin-St Jeor basal metabolic rate. */
export function bmr(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function tdee(profile: Partial<UserProfile> & { weight?: number }): number {
  const weight = profile.weight ?? profile.goals?.weightStart ?? 80;
  const height = profile.heightCm ?? 170;
  const age = profile.age ?? 30;
  const sex = profile.sex ?? 'male';
  const activity = ACTIVITY_FACTOR[profile.activityLevel ?? 'light'];
  return Math.round(bmr(weight, height, age, sex) * activity);
}

/** Derive macro goals from a calorie target using a balanced split. */
export function deriveGoals(
  calories: number,
  weightKg: number,
  weightTarget: number,
): Goals {
  const protein = Math.round(weightKg * 2); // 2g/kg for body-recomp
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return {
    calories,
    protein,
    carbs: Math.max(carbs, 0),
    fat,
    fiber: 30,
    water: 3000,
    steps: 8000,
    weightStart: weightKg,
    weightTarget,
  };
}

export function bmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(value: number): {
  key: string;
  labelAr: string;
  labelEn: string;
  color: string;
} {
  if (value < 18.5) return { key: 'under', labelAr: 'نقص وزن', labelEn: 'Underweight', color: '#3b82f6' };
  if (value < 25) return { key: 'normal', labelAr: 'وزن مثالي', labelEn: 'Normal', color: '#22c55e' };
  if (value < 30) return { key: 'over', labelAr: 'زيادة الوزن', labelEn: 'Overweight', color: '#f59e0b' };
  return { key: 'obese', labelAr: 'سمنة', labelEn: 'Obese', color: '#ef4444' };
}

// MET values for common activities (calories/min ≈ MET * 3.5 * kg / 200).
const MET: Record<ExerciseType, number> = {
  gym: 6,
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  swimming: 8,
  other: 5,
};

export function caloriesBurned(
  type: ExerciseType,
  durationMin: number,
  weightKg = 80,
): number {
  const met = MET[type] ?? 5;
  return Math.round((met * 3.5 * weightKg) / 200 * durationMin);
}

/** Remaining macros against goals (never negative for display purposes). */
export function remaining(consumed: Macros, goals: Goals): Macros {
  return {
    calories: goals.calories - consumed.calories,
    protein: goals.protein - consumed.protein,
    carbs: goals.carbs - consumed.carbs,
    fat: goals.fat - consumed.fat,
    fiber: goals.fiber - consumed.fiber,
    sugar: 0,
    sodium: 0,
  };
}
