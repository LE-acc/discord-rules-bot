'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { LineChart, BarChart } from '@/components/charts/Charts';
import { buildSeries, average, currentStreak, weightChange, type Range } from '@/lib/analytics';
import { IconTrophy } from '@/components/ui/Icons';

function AnalyticsInner() {
  const { t, locale } = useT();
  const meals = useStore((s) => s.meals);
  const weights = useStore((s) => s.weights);
  const achievements = useStore((s) => s.achievements);
  const goals = useStore((s) => s.profile.goals);
  const [range, setRange] = useState<Range>('week');

  const series = useMemo(() => buildSeries(meals, range, locale), [meals, range, locale]);
  const avgCal = average(series.calories);
  const avgProt = average(series.protein);
  const streak = useMemo(() => currentStreak(meals), [meals]);
  const wChange = useMemo(
    () => weightChange(weights, range === 'week' ? 7 : range === 'month' ? 30 : 365),
    [weights, range],
  );

  // Compute achievement progress dynamically.
  const computed = achievements.map((a) => {
    let progress = a.progress;
    if (a.id === 'first-log') progress = meals.length > 0 ? 1 : 0;
    if (a.id === 'streak-7') progress = Math.min(1, streak / 7);
    if (a.id === 'weight-log') progress = weights.length > 0 ? 1 : 0;
    if (a.id === 'protein-hero') {
      const todayProt = meals
        .filter((m) => m.loggedAt.slice(0, 10) === new Date().toISOString().slice(0, 10))
        .reduce((s, m) => s + m.macros.protein, 0);
      progress = Math.min(1, todayProt / goals.protein);
    }
    return { ...a, progress };
  });

  const ranges: { key: Range; label: string }[] = [
    { key: 'week', label: t('common.week') },
    { key: 'month', label: t('common.month') },
    { key: 'year', label: t('common.year') },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{t('an.title')}</h1>

      {/* Range switcher */}
      <div className="glass flex rounded-2xl p-1">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`relative flex-1 rounded-xl py-2 text-sm font-medium transition ${
              range === r.key ? 'text-white' : 'muted'
            }`}
          >
            {range === r.key && (
              <motion.span layoutId="range-pill" className="absolute inset-0 rounded-xl bg-brand-500" />
            )}
            <span className="relative">{r.label}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('an.avgCalories'), value: avgCal, unit: t('common.kcal'), color: '#f97316' },
          { label: t('an.avgProtein'), value: avgProt, unit: 'g', color: '#a855f7' },
          { label: t('an.weightChange'), value: `${wChange > 0 ? '+' : ''}${wChange}`, unit: 'kg', color: wChange <= 0 ? '#16c26b' : '#f59e0b' },
          { label: t('an.streak'), value: streak, unit: '🔥', color: '#16c26b' },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <div className="muted text-xs">{k.label}</div>
            <div className="mt-1 text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}<span className="text-sm"> {k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calories chart */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{t('dash.calories')}</h3>
        <BarChart labels={series.labels} data={series.calories} goal={goals.calories} color="#f97316" />
      </div>

      {/* Protein chart */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{t('dash.protein')}</h3>
        <LineChart labels={series.labels} data={series.protein} color="#a855f7" />
      </div>

      {/* Achievements */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <IconTrophy className="text-amber-400" />
          <h2 className="text-lg font-bold">{t('an.achievements')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {computed.map((a) => {
            const unlocked = a.progress >= 1;
            return (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.02 }}
                className={`card p-4 ${unlocked ? 'ring-1 ring-brand-400' : 'opacity-80'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{a.emoji}</span>
                  {unlocked && <span className="text-xs font-bold text-brand-500">✓</span>}
                </div>
                <div className="mt-2 text-sm font-bold">{locale === 'ar' ? a.titleAr : a.title}</div>
                <div className="muted text-xs">{locale === 'ar' ? a.descriptionAr : a.description}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ring-track)]">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${a.progress * 100}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Hydrated>
      <AnalyticsInner />
    </Hydrated>
  );
}
