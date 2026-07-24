'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { bmi, bmiCategory } from '@/lib/nutrition';
import { clamp } from '@/lib/utils';
import { Sheet } from '@/components/ui/Sheet';
import { IconPlus } from '@/components/ui/Icons';
import { todayISO } from '@/lib/utils';

export function WeightCard() {
  const { t, locale } = useT();
  const weights = useStore((s) => s.weights);
  const goals = useStore((s) => s.profile.goals);
  const heightCm = useStore((s) => s.profile.heightCm ?? 175);
  const addWeight = useStore((s) => s.addWeight);
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');

  const current = weights[0]?.weight ?? goals.weightStart;
  const b = bmi(current, heightCm);
  const cat = bmiCategory(b);
  // BMI marker position across 0..40 scale.
  const markerPct = clamp((b / 40) * 100, 2, 98);

  return (
    <>
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            <IconPlus width={16} height={16} /> {locale === 'ar' ? 'سجل وزن' : 'Log weight'}
          </button>
          <h3 className="text-lg font-bold">{t('dash.currentWeight')}</h3>
        </div>

        <div className="mb-4 flex items-end justify-end gap-1">
          <span className="text-5xl font-extrabold tabular-nums">{current.toFixed(1)}</span>
          <span className="muted mb-1.5 text-lg">kg</span>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="rounded-2xl bg-[var(--bg-elev)] px-4 py-2 text-center">
            <div className="muted text-xs">{t('dash.goal')}</div>
            <div className="font-bold">{goals.weightTarget}kg</div>
          </div>
          <div className="rounded-2xl bg-[var(--bg-elev)] px-4 py-2 text-center">
            <div className="muted text-xs">{t('dash.start')}</div>
            <div className="font-bold">{goals.weightStart}kg</div>
          </div>
        </div>

        {/* BMI scale */}
        <div className="mb-1 flex items-center justify-between">
          <span
            className="rounded-lg px-2 py-1 text-xs font-bold text-white"
            style={{ background: cat.color }}
          >
            {locale === 'ar' ? cat.labelAr : cat.labelEn}
          </span>
          <div className="text-end">
            <span className="text-2xl font-extrabold">{b}</span>{' '}
            <span className="muted text-sm">{t('dash.bmi')}</span>
          </div>
        </div>
        <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full"
          style={{ background: 'linear-gradient(90deg,#3b82f6 0%,#22c55e 46%,#f59e0b 62%,#ef4444 100%)' }}
        >
          <div
            className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow"
            style={{ [locale === 'ar' ? 'right' : 'left']: `${markerPct}%` }}
          />
        </div>
        <div className="muted mt-1 flex justify-between text-[11px]">
          <span>0</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
        </div>

        <Link href="/weight" className="btn-ghost mt-4 w-full text-sm text-brand-500">
          {t('dash.viewAll')} →
        </Link>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('dash.currentWeight')}>
        <div className="space-y-4">
          <input
            className="input text-center text-2xl font-bold"
            type="number"
            inputMode="decimal"
            placeholder="90.0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full"
            onClick={() => {
              const w = parseFloat(val);
              if (w > 0) {
                addWeight({ weight: w, recordedAt: todayISO() });
                setVal('');
                setOpen(false);
              }
            }}
          >
            {t('common.save')}
          </motion.button>
        </div>
      </Sheet>
    </>
  );
}
