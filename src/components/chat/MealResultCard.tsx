'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { IconChevron } from '@/components/ui/Icons';
import type { MealLog } from '@/types';

const MACRO_META = [
  { key: 'protein', color: '#a855f7', labelAr: 'بروتين', labelEn: 'Protein' },
  { key: 'carbs', color: '#3b82f6', labelAr: 'كارب', labelEn: 'Carbs' },
  { key: 'fat', color: '#f59e0b', labelAr: 'دهون', labelEn: 'Fat' },
] as const;

/** Structured, editable meal card shown under an AI reply in chat. */
export function MealResultCard({ meal }: { meal: MealLog }) {
  const { t, locale } = useT();
  const updateMealItem = useStore((s) => s.updateMealItem);
  const storedMeal = useStore((s) => s.meals.find((m) => m.id === meal.id)) ?? meal;
  const [editing, setEditing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 overflow-hidden rounded-2xl border border-brand-500/25 bg-brand-500/5"
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <ConfidenceBadge value={storedMeal.confidence} />
        <span className="text-sm font-bold text-brand-500">
          {t(`meal.${storedMeal.category}`)} · {storedMeal.macros.calories} {t('common.kcal')}
        </span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {storedMeal.items.map((item) => (
          <div key={item.id} className="px-4 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold tabular-nums text-brand-500">{item.macros.calories}</span>
              <div className="flex flex-1 items-center justify-end gap-2 text-end">
                <div className="text-sm font-medium">
                  {locale === 'ar' ? item.nameAr ?? item.name : item.name}
                </div>
                <span className="text-lg" aria-hidden>{item.emoji}</span>
              </div>
            </div>

            {editing ? (
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="muted text-xs">{item.unit ?? 'g'}</span>
                <input
                  type="number"
                  defaultValue={item.quantity}
                  className="input w-24 py-1.5 text-center text-sm"
                  onChange={(e) => {
                    const q = parseFloat(e.target.value);
                    if (q > 0 && item.perServing) {
                      const factor = q / (item.quantity || 1);
                      updateMealItem(storedMeal.id, item.id, {
                        quantity: q,
                        macros: {
                          calories: Math.round(item.macros.calories * factor),
                          protein: Math.round(item.macros.protein * factor * 10) / 10,
                          carbs: Math.round(item.macros.carbs * factor * 10) / 10,
                          fat: Math.round(item.macros.fat * factor * 10) / 10,
                          fiber: Math.round(item.macros.fiber * factor * 10) / 10,
                          sugar: Math.round(item.macros.sugar * factor * 10) / 10,
                          sodium: Math.round(item.macros.sodium * factor),
                        },
                      });
                    }
                  }}
                />
              </div>
            ) : (
              <div className="mt-1.5 flex justify-end gap-3 text-xs">
                {MACRO_META.map((mm) => (
                  <span key={mm.key} className="tabular-nums" style={{ color: mm.color }}>
                    {Math.round((item.macros as any)[mm.key])}غ {locale === 'ar' ? mm.labelAr : mm.labelEn}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setEditing((v) => !v)}
        className="flex w-full items-center justify-center gap-1 border-t border-[var(--border)] py-2 text-xs font-semibold text-brand-500"
      >
        {editing ? t('common.save') : t('chat.edit')}
        <IconChevron width={14} height={14} className={editing ? 'rotate-90' : ''} />
      </button>
    </motion.div>
  );
}
