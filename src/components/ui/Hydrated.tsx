'use client';

import { useStore } from '@/store';

/** Renders children only after the persisted store has rehydrated. */
export function Hydrated({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  if (!hydrated) {
    return (
      <>{fallback ?? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-28 rounded-3xl" />
            <div className="skeleton h-28 rounded-3xl" />
          </div>
          <div className="skeleton h-48 rounded-3xl" />
        </div>
      )}</>
    );
  }
  return <>{children}</>;
}
