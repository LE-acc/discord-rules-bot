'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { IconTrash } from '@/components/ui/Icons';
import type { MealCategory, MealLog } from '@/types';

const CATS: { key: MealCategory; emoji: string }[] = [
  { key: 'breakfast', emoji: '🌅' },
  { key: 'lunch', emoji: '☀️' },
  { key: 'dinner', emoji: '🌙' },
  { key: 'snack', emoji: '🍎' },
];

export function MealsSection({ meals }: { meals: MealLog[] }) {
  const { t, locale } = useT();
  const removeMeal = useStore((s) => s.removeMeal);

  if (meals.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <span className="text-4xl">🍽️</span>
        <p className="muted">{t('dash.noMeals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {CATS.map(({ key, emoji }) => {
        const catMeals = meals.filter((m) => m.category === key);
        if (catMeals.length === 0) return null;
        const cals = catMeals.reduce((a, m) => a + m.macros.calories, 0);
        return (
          <div key={key} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="chip tabular-nums text-brand-500">{cals} {t('common.kcal')}</span>
              <h4 className="flex items-center gap-2 font-bold">
                {t(`meal.${key}`)} <span>{emoji}</span>
              </h4>
            </div>
            <AnimatePresence>
              {catMeals.map((meal) =>
                meal.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center justify-between gap-3 border-t border-[var(--border)] py-2.5 first:border-t-0"
                  >
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                      aria-label={t('common.delete')}
                    >
                      <IconTrash width={16} height={16} className="text-rose-400" />
                    </button>
                    <div className="flex flex-1 items-center justify-end gap-2 text-end">
                      <div>
                        <div className="text-sm font-medium">
                          {locale === 'ar' ? item.nameAr ?? item.name : item.name}
                        </div>
                        <div className="muted text-xs tabular-nums">
                          {item.quantity}{item.unit ? ` ${item.unit}` : 'g'} · {item.macros.protein}غ بروتين
                        </div>
                      </div>
                      <span className="text-xl" aria-hidden>{item.emoji}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums text-brand-500">
                        {item.macros.calories}
                      </span>
                    </div>
                  </motion.div>
                )),
              )}
            </AnimatePresence>
            {catMeals.some((m) => m.source !== 'manual') && (
              <div className="mt-2 flex justify-end">
                <ConfidenceBadge value={Math.max(...catMeals.map((m) => m.confidence))} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
