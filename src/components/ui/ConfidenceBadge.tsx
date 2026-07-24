'use client';

import { cn } from '@/lib/utils';

export function ConfidenceBadge({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85 ? 'text-brand-500 bg-brand-500/10' : pct >= 65 ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', color, className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {pct}%
    </span>
  );
}
