'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { IconTimer } from '@/components/ui/Icons';

const PROTOCOLS = [
  { name: '16:8', fasting: 16, descAr: 'الأكثر شيوعًا', descEn: 'Most popular' },
  { name: '18:6', fasting: 18, descAr: 'متقدم', descEn: 'Advanced' },
  { name: '20:4', fasting: 20, descAr: 'حمية المحارب', descEn: 'Warrior' },
  { name: 'OMAD', fasting: 23, descAr: 'وجبة واحدة', descEn: 'One meal a day' },
];

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function FastingInner() {
  const { t, locale } = useT();
  const fasting = useStore((s) => s.fasting);
  const start = useStore((s) => s.startFasting);
  const stop = useStore((s) => s.stopFasting);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const active = Boolean(fasting);
  const startMs = fasting ? +new Date(fasting.startedAt) : 0;
  const endMs = fasting ? +new Date(fasting.endsAt) : 0;
  const totalMs = endMs - startMs;
  const elapsed = now - startMs;
  const remaining = endMs - now;
  const progress = totalMs ? Math.min(1, elapsed / totalMs) : 0;
  const done = active && remaining <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <IconTimer className="text-brand-500" />
        <h1 className="text-2xl font-extrabold">{t('fast.title')}</h1>
      </div>

      {active ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center gap-4 p-6">
          <span className="chip text-brand-500">{fasting!.protocol}</span>
          <ProgressRing
            value={progress * 100}
            max={100}
            size={220}
            stroke={16}
            color={done ? '#16c26b' : '#38bdf8'}
            gradientId="fast-grad"
            label={
              <div className="text-center">
                <div className="text-4xl font-extrabold tabular-nums">
                  {done ? '🎉' : fmt(remaining)}
                </div>
                <div className="muted mt-1 text-xs">
                  {done ? (locale === 'ar' ? 'اكتمل الصيام!' : 'Fast complete!') : t('fast.remaining')}
                </div>
              </div>
            }
          />
          <div className="flex w-full justify-around text-center text-sm">
            <div>
              <div className="muted text-xs">{locale === 'ar' ? 'بدأ' : 'Started'}</div>
              <div className="font-semibold">
                {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(startMs))}
              </div>
            </div>
            <div>
              <div className="muted text-xs">{locale === 'ar' ? 'ينتهي' : 'Ends'}</div>
              <div className="font-semibold">
                {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(endMs))}
              </div>
            </div>
            <div>
              <div className="muted text-xs">{t('fast.window')}</div>
              <div className="font-semibold">{fasting!.eatingHours}h</div>
            </div>
          </div>
          <button onClick={stop} className="btn-ghost w-full text-rose-400">
            {t('fast.stop')}
          </button>
        </motion.div>
      ) : (
        <>
          <div className="card p-6 text-center">
            <span className="text-5xl">⏳</span>
            <p className="muted mt-3 text-sm">
              {locale === 'ar' ? 'اختر بروتوكول الصيام وابدأ العدّاد' : 'Pick a protocol and start the timer'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PROTOCOLS.map((p) => (
              <motion.button
                key={p.name}
                whileTap={{ scale: 0.97 }}
                onClick={() => start(p.name, p.fasting)}
                className="card flex flex-col items-center gap-1 p-5 transition hover:border-brand-400"
              >
                <span className="text-2xl font-extrabold text-brand-500">{p.name}</span>
                <span className="muted text-xs">{locale === 'ar' ? p.descAr : p.descEn}</span>
                <span className="mt-1 chip text-xs">
                  {p.fasting}h {locale === 'ar' ? 'صيام' : 'fast'}
                </span>
              </motion.button>
            ))}
          </div>
        </>
      )}

      <div className="card p-4">
        <h3 className="mb-2 font-bold">{locale === 'ar' ? 'فوائد الصيام المتقطع' : 'Benefits of fasting'}</h3>
        <ul className="muted space-y-1.5 text-sm">
          {(locale === 'ar'
            ? ['🔥 يساعد على حرق الدهون', '🧠 يحسّن التركيز والصفاء الذهني', '⚡ ينظّم مستوى الطاقة', '💚 يحسّن حساسية الإنسولين']
            : ['🔥 Supports fat burning', '🧠 Improves mental clarity', '⚡ Stabilises energy', '💚 Improves insulin sensitivity']
          ).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FastingPage() {
  return (
    <Hydrated>
      <FastingInner />
    </Hydrated>
  );
}
