'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { IconHome, IconChart, IconFood, IconSettings, IconSparkle } from '@/components/ui/Icons';

const items = [
  { href: '/dashboard', key: 'nav.dashboard', Icon: IconHome },
  { href: '/foods', key: 'nav.foods', Icon: IconFood },
  { href: '/chat', key: 'nav.chat', Icon: IconSparkle, center: true },
  { href: '/analytics', key: 'nav.analytics', Icon: IconChart },
  { href: '/settings', key: 'nav.settings', Icon: IconSettings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-3 safe-bottom">
      <div className="glass pointer-events-auto flex w-full max-w-md items-center justify-around rounded-full px-2 py-2 shadow-card">
        {items.map(({ href, key, Icon, center }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          if (center) {
            return (
              <Link key={href} href={href} className="relative -mt-8" aria-label={t(key)}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow"
                >
                  <Icon width={28} height={28} />
                </motion.div>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              aria-label={t(key)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-colors',
                active ? 'text-brand-500' : 'muted hover:text-[var(--text)]',
              )}
            >
              <Icon width={22} height={22} />
              <span className="text-[10px] font-medium">{t(key)}</span>
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand-500"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
