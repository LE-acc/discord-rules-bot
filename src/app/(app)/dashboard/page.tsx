'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { greeting, formatNumber, todayISO } from '@/lib/utils';
import { Hydrated } from '@/components/ui/Hydrated';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MacroBar } from '@/components/ui/MacroBar';
import { StatCard } from '@/components/ui/StatCard';
import { QuickLogBar } from '@/components/QuickLogBar';
import { WaterCard } from '@/components/dashboard/WaterCard';
import { WeightCard } from '@/components/dashboard/WeightCard';
import { MealsSection } from '@/components/dashboard/MealsSection';
import { IconFlame } from '@/components/ui/Icons';

function DashboardInner() {
  const { t, locale } = useT();
  const profile = useStore((s) => s.profile);
  const summaryFor = useStore((s) => s.summaryFor);
  useStore((s) => s.meals); // subscribe for reactivity
  useStore((s) => s.daily);
  useStore((s) => s.exercises);

  const today = summaryFor(todayISO());
  const g = profile.goals;
  const c = today.consumed;
  const net = Math.max(0, g.calories - c.calories + today.burned);

  const dateLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold">{greeting(locale, profile.name || undefined)} 👋</h1>
          <p className="muted text-sm">{dateLabel}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
          {(profile.name?.[0] ?? 'N').toUpperCase()}
        </div>
      </motion.div>

      {/* AI quick log */}
      <QuickLogBar />

      {/* Calories hero ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card flex items-center justify-between gap-4 p-5"
      >
        <div className="flex-1 space-y-3">
          <MacroBar label={t('dash.protein')} value={c.protein} goal={g.protein} color="#a855f7" />
          <MacroBar label={t('dash.carbs')} value={c.carbs} goal={g.carbs} color="#3b82f6" />
          <MacroBar label={t('dash.fat')} value={c.fat} goal={g.fat} color="#f59e0b" />
        </div>
        <ProgressRing
          value={c.calories}
          max={g.calories}
          size={150}
          stroke={13}
          label={
            <div>
              <div className="text-3xl font-extrabold tabular-nums text-brand-500">{formatNumber(net)}</div>
              <div className="muted text-[11px]">{t('dash.remaining')}</div>
            </div>
          }
          sublabel={`${formatNumber(c.calories)} / ${formatNumber(g.calories, true)}`}
        />
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🔥"
          label={t('dash.calories')}
          value={formatNumber(c.calories)}
          goal={formatNumber(g.calories, true)}
          progress={{ value: c.calories, max: g.calories }}
          color="#f97316"
        />
        <StatCard
          icon="👟"
          label={t('dash.steps')}
          value={formatNumber(today.steps)}
          goal={formatNumber(g.steps, true)}
          progress={{ value: today.steps, max: g.steps }}
          color="#a855f7"
        />
        <StatCard
          icon="🌾"
          label={t('dash.fiber')}
          value={`${Math.round(c.fiber)}g`}
          goal={`${g.fiber}g`}
          progress={{ value: c.fiber, max: g.fiber }}
          color="#22c55e"
        />
        <StatCard
          icon="🍬"
          label={t('dash.sugar')}
          value={`${Math.round(c.sugar)}g`}
          color="#ec4899"
        />
      </div>

      {/* Water full card */}
      <WaterCard water={today.water} />

      {/* Burned + sodium row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <IconFlame className="text-orange-400" />
          <div>
            <div className="muted text-xs">{t('dash.burned')}</div>
            <div className="text-xl font-bold">{today.burned} {t('common.kcal')}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="text-2xl">🧂</span>
          <div>
            <div className="muted text-xs">{t('dash.sodium')}</div>
            <div className="text-xl font-bold">{Math.round(c.sodium)}mg</div>
          </div>
        </div>
      </div>

      {/* Weight */}
      <WeightCard />

      {/* Meals */}
      <div>
        <h2 className="mb-3 text-lg font-bold">{t('dash.meals')}</h2>
        <MealsSection meals={today.meals} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Hydrated>
      <DashboardInner />
    </Hydrated>
  );
}
