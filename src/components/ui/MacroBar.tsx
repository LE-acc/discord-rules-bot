'use client';

import { motion } from 'framer-motion';
import { pct } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
}

export function MacroBar({ label, value, goal, unit = 'غ', color }: Props) {
  const p = pct(value, goal);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="muted tabular-nums">
          {Math.round(value)}
          <span className="opacity-60"> / {Math.round(goal)}{unit}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--ring-track)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
