'use client';

import { motion } from 'framer-motion';
import { cn, pct } from '@/lib/utils';

interface Props {
  icon: string;
  label: string;
  value: React.ReactNode;
  goal?: React.ReactNode;
  progress?: { value: number; max: number };
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  goal,
  progress,
  color = '#16c26b',
  onClick,
  className,
}: Props) {
  const p = progress ? pct(progress.value, progress.max) : 0;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'card flex w-full flex-col gap-3 p-4 text-start',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="muted text-sm font-medium">{label}</span>
        <span className="text-lg" aria-hidden>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
          {value}
        </span>
        {goal && <span className="muted text-sm">/ {goal}</span>}
      </div>
      {progress && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ring-track)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${p}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </motion.button>
  );
}
