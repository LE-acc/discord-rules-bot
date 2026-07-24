'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { Sheet } from '@/components/ui/Sheet';
import { caloriesBurned } from '@/lib/nutrition';
import { IconDumbbell, IconFlame, IconPlus, IconTrash } from '@/components/ui/Icons';
import { todayISO } from '@/lib/utils';
import type { ExerciseType } from '@/types';

const TYPES: { type: ExerciseType; emoji: string; key: string }[] = [
  { type: 'gym', emoji: '🏋️', key: 'ex.gym' },
  { type: 'walking', emoji: '🚶', key: 'ex.walking' },
  { type: 'running', emoji: '🏃', key: 'ex.running' },
  { type: 'cycling', emoji: '🚴', key: 'ex.cycling' },
  { type: 'swimming', emoji: '🏊', key: 'ex.swimming' },
];

function ExerciseInner() {
  const { t, locale } = useT();
  const exercises = useStore((s) => s.exercises);
  const addExercise = useStore((s) => s.addExercise);
  const removeExercise = useStore((s) => s.removeExercise);
  const weight = useStore((s) => s.weights[0]?.weight ?? 80);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ExerciseType>('gym');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('');

  const today = todayISO();
  const todays = exercises.filter((e) => e.loggedAt.slice(0, 10) === today);
  const totalBurned = todays.reduce((a, e) => a + e.caloriesBurned, 0);
  const totalMin = todays.reduce((a, e) => a + e.durationMin, 0);

  const estBurn = caloriesBurned(type, parseInt(duration) || 0, weight);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="btn-primary">
          <IconPlus width={18} height={18} /> {t('common.add')}
        </button>
        <h1 className="text-2xl font-extrabold">{t('ex.title')}</h1>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/15 text-orange-400">
            <IconFlame />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{totalBurned}</div>
            <div className="muted text-xs">{t('ex.burned')}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-400">
            <IconDumbbell />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{totalMin}<span className="text-sm">min</span></div>
            <div className="muted text-xs">{locale === 'ar' ? 'مدة النشاط' : 'Active time'}</div>
          </div>
        </div>
      </div>

      {/* Quick types */}
      <div className="grid grid-cols-5 gap-2">
        {TYPES.map((tp) => (
          <button
            key={tp.type}
            onClick={() => {
              setType(tp.type);
              setOpen(true);
            }}
            className="card flex flex-col items-center gap-1 p-3 transition hover:border-brand-400"
          >
            <span className="text-2xl">{tp.emoji}</span>
            <span className="text-[10px] font-medium">{t(tp.key)}</span>
          </button>
        ))}
      </div>

      {/* Today's list */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{locale === 'ar' ? 'تمارين اليوم' : "Today's workouts"}</h3>
        {todays.length === 0 ? (
          <p className="muted py-6 text-center text-sm">
            {locale === 'ar' ? 'لا توجد تمارين اليوم. تحرّك! 💪' : 'No workouts today. Get moving! 💪'}
          </p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {todays.map((e) => (
              <div key={e.id} className="group flex items-center justify-between py-3">
                <button onClick={() => removeExercise(e.id)} className="opacity-0 transition group-hover:opacity-100">
                  <IconTrash width={16} height={16} className="text-rose-400" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <div className="font-semibold">{e.name}</div>
                    <div className="muted text-xs">
                      {e.durationMin}min {e.distanceKm ? `· ${e.distanceKm}km` : ''}
                    </div>
                  </div>
                  <span className="text-2xl">{TYPES.find((tp) => tp.type === e.type)?.emoji ?? '💪'}</span>
                </div>
                <span className="font-bold tabular-nums text-orange-400">{e.caloriesBurned} 🔥</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('common.add')}>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {TYPES.map((tp) => (
              <button
                key={tp.type}
                onClick={() => setType(tp.type)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition ${
                  type === tp.type ? 'bg-brand-500 text-white' : 'bg-[var(--bg-elev)]'
                }`}
              >
                <span className="text-xl">{tp.emoji}</span>
                <span className="text-[10px]">{t(tp.key)}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="muted mb-1 block text-xs">{t('ex.duration')}</label>
            <input className="input" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          {(type === 'running' || type === 'cycling' || type === 'walking') && (
            <div>
              <label className="muted mb-1 block text-xs">{locale === 'ar' ? 'المسافة (كم)' : 'Distance (km)'}</label>
              <input className="input" type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
            </div>
          )}
          <div className="flex items-center justify-between rounded-2xl bg-orange-500/10 px-4 py-3">
            <span className="text-xl font-bold text-orange-400">{estBurn} 🔥</span>
            <span className="muted text-sm">{t('ex.burned')} ({locale === 'ar' ? 'تقديري' : 'estimated'})</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full"
            onClick={() => {
              const dur = parseInt(duration) || 0;
              if (dur <= 0) return;
              addExercise({
                type,
                name: t(TYPES.find((tp) => tp.type === type)!.key),
                durationMin: dur,
                distanceKm: parseFloat(distance) || undefined,
                caloriesBurned: caloriesBurned(type, dur, weight),
                loggedAt: new Date().toISOString(),
              });
              setDuration('30');
              setDistance('');
              setOpen(false);
            }}
          >
            {t('common.save')}
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}

export default function ExercisePage() {
  return (
    <Hydrated>
      <ExerciseInner />
    </Hydrated>
  );
}
