'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useT } from '@/lib/i18n';
import { IconPlus, IconWater } from '@/components/ui/Icons';

export function WaterCard({ water }: { water: number }) {
  const { t } = useT();
  const goal = useStore((s) => s.profile.goals.water);
  const addWater = useStore((s) => s.addWater);
  const p = goal ? Math.round((water / goal) * 100) : 0;

  return (
    <div className="card flex flex-col items-center gap-3 p-5">
      <div className="flex w-full items-center justify-between">
        <span className="font-semibold">{t('dash.water')}</span>
        <IconWater className="text-sky-400" width={20} height={20} />
      </div>
      <ProgressRing
        value={water}
        max={goal}
        size={140}
        stroke={11}
        color="#38bdf8"
        gradientId="water-grad"
        label={<span className="text-2xl font-extrabold text-sky-400">{p}%</span>}
      />
      <div className="muted text-sm tabular-nums">
        {(water / 1000).toFixed(2)} / {(goal / 1000).toFixed(1)}L
      </div>
      <div className="flex gap-2">
        {[250, 500].map((ml) => (
          <motion.button
            key={ml}
            whileTap={{ scale: 0.94 }}
            onClick={() => addWater(ml)}
            className="chip gap-1 text-sky-500"
          >
            <IconPlus width={14} height={14} /> {ml}ml
          </motion.button>
        ))}
      </div>
    </div>
  );
}
