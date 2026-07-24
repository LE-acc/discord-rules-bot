'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Sheet } from '@/components/ui/Sheet';
import { uid } from '@/lib/utils';
import type { FoodDbEntry, FoodItem, MealCategory, Macros } from '@/types';

interface Props {
  entry: (FoodDbEntry | (FoodItem & { serving?: number })) | null;
  onClose: () => void;
}

const CATS: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function scale(base: Macros, factor: number): Macros {
  return {
    calories: Math.round(base.calories * factor),
    protein: Math.round(base.protein * factor * 10) / 10,
    carbs: Math.round(base.carbs * factor * 10) / 10,
    fat: Math.round(base.fat * factor * 10) / 10,
    fiber: Math.round(base.fiber * factor * 10) / 10,
    sugar: Math.round(base.sugar * factor * 10) / 10,
    sodium: Math.round(base.sodium * factor),
  };
}

/** Sheet for choosing quantity + meal category, then logging a food. */
export function FoodLogSheet({ entry, onClose }: Props) {
  const { t, locale } = useT();
  const addMeal = useStore((s) => s.addMeal);
  const [grams, setGrams] = useState(100);
  const [cat, setCat] = useState<MealCategory>('lunch');

  const serving = entry && 'serving' in entry ? (entry as any).serving ?? 100 : 100;
  const baseMacros = entry
    ? 'perServing' in entry && (entry as FoodItem).perServing
      ? (entry as FoodItem).perServing!
      : (entry as any).macros
    : undefined;

  useEffect(() => {
    if (entry) setGrams(serving || 100);
  }, [entry, serving]);

  if (!entry || !baseMacros) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const factor = grams / (serving || 100);
  const macros = scale(baseMacros, factor);
  const name = locale === 'ar' ? (entry as any).nameAr ?? entry.name : entry.name;

  return (
    <Sheet open={Boolean(entry)} onClose={onClose} title={name}>
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-4xl">
          {(entry as any).emoji ?? '🍽️'}
        </div>

        {/* Macro preview */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { v: macros.calories, l: t('common.kcal'), c: '#16c26b' },
            { v: macros.protein, l: locale === 'ar' ? 'بروتين' : 'Protein', c: '#a855f7' },
            { v: macros.carbs, l: locale === 'ar' ? 'كارب' : 'Carbs', c: '#3b82f6' },
            { v: macros.fat, l: locale === 'ar' ? 'دهون' : 'Fat', c: '#f59e0b' },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-[var(--bg-elev)] py-3">
              <div className="text-lg font-extrabold" style={{ color: x.c }}>{x.v}</div>
              <div className="muted text-[10px]">{x.l}</div>
            </div>
          ))}
        </div>

        {/* Quantity */}
        <div>
          <label className="muted mb-1 block text-xs">
            {locale === 'ar' ? 'الكمية (جرام)' : 'Quantity (g)'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={600}
              step={10}
              value={grams}
              onChange={(e) => setGrams(parseInt(e.target.value))}
              className="flex-1 accent-brand-500"
            />
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
              className="input w-24 text-center"
            />
          </div>
        </div>

        {/* Category */}
        <div className="grid grid-cols-4 gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-2xl py-2.5 text-sm font-medium transition ${
                cat === c ? 'bg-brand-500 text-white' : 'bg-[var(--bg-elev)]'
              }`}
            >
              {t(`meal.${c}`)}
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full"
          onClick={() => {
            const item: FoodItem = {
              id: `${(entry as any).id ?? uid()}-${uid()}`,
              name: entry.name,
              nameAr: (entry as any).nameAr,
              brand: (entry as any).brand,
              quantity: grams,
              unit: 'جرام',
              emoji: (entry as any).emoji,
              macros,
              perServing: baseMacros,
            };
            addMeal({
              category: cat,
              items: [item],
              source: 'search',
              confidence: 0.95,
              loggedAt: new Date().toISOString(),
              macros,
            });
            onClose();
          }}
        >
          {t('dash.logMeal')} · {macros.calories} {t('common.kcal')}
        </motion.button>
      </div>
    </Sheet>
  );
}
