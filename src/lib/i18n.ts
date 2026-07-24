'use client';

import { useStore } from '@/store';
import type { Locale } from '@/types';

type Dict = Record<string, { ar: string; en: string }>;

export const DICT: Dict = {
  // nav
  'nav.dashboard': { ar: 'الرئيسية', en: 'Dashboard' },
  'nav.chat': { ar: 'المساعد', en: 'AI Coach' },
  'nav.progress': { ar: 'التقدم', en: 'Progress' },
  'nav.foods': { ar: 'الأطعمة', en: 'Foods' },
  'nav.exercise': { ar: 'التمارين', en: 'Exercise' },
  'nav.fasting': { ar: 'الصيام', en: 'Fasting' },
  'nav.analytics': { ar: 'التحليلات', en: 'Analytics' },
  'nav.settings': { ar: 'الإعدادات', en: 'Settings' },
  'nav.weight': { ar: 'الوزن', en: 'Weight' },

  // dashboard
  'dash.daily': { ar: 'المتابعة اليومية', en: 'Daily Tracking' },
  'dash.today': { ar: 'اليوم', en: 'Today' },
  'dash.calories': { ar: 'السعرات', en: 'Calories' },
  'dash.protein': { ar: 'البروتين', en: 'Protein' },
  'dash.carbs': { ar: 'الكربوهيدرات', en: 'Carbs' },
  'dash.fat': { ar: 'الدهون', en: 'Fat' },
  'dash.fiber': { ar: 'الألياف', en: 'Fiber' },
  'dash.sugar': { ar: 'السكر', en: 'Sugar' },
  'dash.sodium': { ar: 'الصوديوم', en: 'Sodium' },
  'dash.water': { ar: 'الماء', en: 'Water' },
  'dash.steps': { ar: 'الخطوات', en: 'Steps' },
  'dash.remaining': { ar: 'المتبقي', en: 'Remaining' },
  'dash.burned': { ar: 'محروقة', en: 'Burned' },
  'dash.currentWeight': { ar: 'الوزن الحالي', en: 'Current Weight' },
  'dash.goal': { ar: 'الهدف', en: 'Goal' },
  'dash.start': { ar: 'البداية', en: 'Start' },
  'dash.viewAll': { ar: 'عرض الكل', en: 'View all' },
  'dash.viewMore': { ar: 'عرض المزيد', en: 'View more' },
  'dash.meals': { ar: 'الوجبات', en: 'Meals' },
  'dash.noMeals': { ar: 'ما سجّلت وجبات اليوم بعد', en: 'No meals logged today yet' },
  'dash.logMeal': { ar: 'سجّل وجبة', en: 'Log a meal' },
  'dash.addWater': { ar: 'أضف ماء', en: 'Add water' },
  'dash.bmi': { ar: 'مؤشر كتلة الجسم', en: 'BMI' },

  // meals
  'meal.breakfast': { ar: 'فطور', en: 'Breakfast' },
  'meal.lunch': { ar: 'غداء', en: 'Lunch' },
  'meal.dinner': { ar: 'عشاء', en: 'Dinner' },
  'meal.snack': { ar: 'سناك', en: 'Snacks' },

  // chat
  'chat.title': { ar: 'مساعد NutriAI', en: 'NutriAI Coach' },
  'chat.placeholder': { ar: 'اكتب ما أكلته... مثال: أكلت ٣ بيضات', en: 'Type what you ate... e.g. 3 eggs' },
  'chat.hint': { ar: 'اكتب، صوّر، أو تكلّم — وأنا أسجّل لك', en: 'Type, snap, or speak — I log it for you' },
  'chat.confidence': { ar: 'نسبة الثقة', en: 'confidence' },
  'chat.logged': { ar: 'تم التسجيل', en: 'Logged' },
  'chat.edit': { ar: 'تعديل', en: 'Edit' },
  'chat.thinking': { ar: 'يحلّل...', en: 'Analyzing...' },
  'chat.welcome': {
    ar: 'هلا! أنا مدرّبك الغذائي 🤖\nاكتب لي أي شي أكلته بطريقتك، مثل: «غديت مضبي نص دجاجة مع رز» وأنا أسجّله وأحسب لك السعرات والبروتين.',
    en: "Hey! I'm your nutrition coach 🤖\nJust tell me what you ate naturally, e.g. \"half a madbi chicken with rice\", and I'll log it and crunch the numbers.",
  },

  // common
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.add': { ar: 'إضافة', en: 'Add' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.search': { ar: 'ابحث...', en: 'Search...' },
  'common.today': { ar: 'اليوم', en: 'Today' },
  'common.week': { ar: 'أسبوع', en: 'Week' },
  'common.month': { ar: 'شهر', en: 'Month' },
  'common.year': { ar: 'سنة', en: 'Year' },
  'common.kcal': { ar: 'سعرة', en: 'kcal' },
  'common.g': { ar: 'غ', en: 'g' },
  'common.of': { ar: 'من', en: 'of' },
  'common.demo': { ar: 'وضع تجريبي', en: 'Demo mode' },

  // foods
  'foods.title': { ar: 'قاعدة الأطعمة', en: 'Food Database' },
  'foods.favorites': { ar: 'المفضلة', en: 'Favorites' },
  'foods.recent': { ar: 'الأخيرة', en: 'Recent' },
  'foods.restaurants': { ar: 'المطاعم', en: 'Restaurants' },
  'foods.all': { ar: 'الكل', en: 'All' },
  'foods.scan': { ar: 'مسح باركود', en: 'Scan barcode' },

  // exercise
  'ex.title': { ar: 'التمارين', en: 'Exercise' },
  'ex.gym': { ar: 'نادي', en: 'Gym' },
  'ex.walking': { ar: 'مشي', en: 'Walking' },
  'ex.running': { ar: 'جري', en: 'Running' },
  'ex.cycling': { ar: 'دراجة', en: 'Cycling' },
  'ex.swimming': { ar: 'سباحة', en: 'Swimming' },
  'ex.duration': { ar: 'المدة (دقيقة)', en: 'Duration (min)' },
  'ex.burned': { ar: 'سعرات محروقة', en: 'Calories burned' },

  // fasting
  'fast.title': { ar: 'الصيام المتقطع', en: 'Intermittent Fasting' },
  'fast.start': { ar: 'ابدأ الصيام', en: 'Start fasting' },
  'fast.stop': { ar: 'إنهاء', en: 'Stop' },
  'fast.window': { ar: 'نافذة الأكل', en: 'Eating window' },
  'fast.remaining': { ar: 'المتبقي للصيام', en: 'Fasting remaining' },
  'fast.eating': { ar: 'وقت الأكل', en: 'Eating time' },

  // settings
  'set.title': { ar: 'الإعدادات', en: 'Settings' },
  'set.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'set.goals': { ar: 'الأهداف', en: 'Goals' },
  'set.language': { ar: 'اللغة', en: 'Language' },
  'set.theme': { ar: 'المظهر', en: 'Theme' },
  'set.dark': { ar: 'داكن', en: 'Dark' },
  'set.light': { ar: 'فاتح', en: 'Light' },
  'set.system': { ar: 'النظام', en: 'System' },
  'set.notifications': { ar: 'التذكيرات', en: 'Notifications' },
  'set.reset': { ar: 'تصفير البيانات', en: 'Reset data' },
  'set.install': { ar: 'ثبّت التطبيق', en: 'Install app' },

  // analytics
  'an.title': { ar: 'التحليلات', en: 'Analytics' },
  'an.achievements': { ar: 'الإنجازات', en: 'Achievements' },
  'an.avgCalories': { ar: 'متوسط السعرات', en: 'Avg calories' },
  'an.avgProtein': { ar: 'متوسط البروتين', en: 'Avg protein' },
  'an.weightChange': { ar: 'تغير الوزن', en: 'Weight change' },
  'an.streak': { ar: 'أيام متتالية', en: 'Day streak' },

  // landing
  'land.tagline': { ar: 'تتبّع تغذيتك بالذكاء الاصطناعي', en: 'AI-powered nutrition tracking' },
  'land.cta': { ar: 'ابدأ الآن', en: 'Get started' },
  'land.login': { ar: 'تسجيل الدخول', en: 'Sign in' },
};

export function t(key: string, locale: Locale): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[locale];
}

export function useT() {
  const locale = useStore((s) => s.locale);
  return {
    t: (key: string) => t(key, locale),
    locale,
    dir: (locale === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
  };
}
