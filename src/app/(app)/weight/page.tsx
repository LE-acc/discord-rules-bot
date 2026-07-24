'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { LineChart } from '@/components/charts/Charts';
import { Sheet } from '@/components/ui/Sheet';
import { IconPlus, IconScale, IconTrash } from '@/components/ui/Icons';
import { todayISO } from '@/lib/utils';
import { compressImage } from '@/lib/image';

function WeightInner() {
  const { t, locale } = useT();
  const weights = useStore((s) => s.weights);
  const goals = useStore((s) => s.profile.goals);
  const addWeight = useStore((s) => s.addWeight);
  const removeWeight = useStore((s) => s.removeWeight);
  const measurements = useStore((s) => s.measurements);
  const addMeasurement = useStore((s) => s.addMeasurement);

  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [mOpen, setMOpen] = useState(false);
  const [meas, setMeas] = useState({ waist: '', chest: '', hips: '', arms: '', thighs: '' });

  const sorted = useMemo(
    () => [...weights].sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt)),
    [weights],
  );
  const current = weights[0]?.weight ?? goals.weightStart;
  const change = current - goals.weightStart;
  const toGo = current - goals.weightTarget;
  const progressPct = Math.min(
    100,
    Math.max(0, ((goals.weightStart - current) / (goals.weightStart - goals.weightTarget || 1)) * 100),
  );

  const labels = sorted.map((w) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }).format(
      new Date(w.recordedAt),
    ),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="btn-primary">
          <IconPlus width={18} height={18} /> {locale === 'ar' ? 'سجل وزن' : 'Log weight'}
        </button>
        <h1 className="text-2xl font-extrabold">{t('nav.weight')}</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('dash.currentWeight'), value: `${current.toFixed(1)}`, unit: 'kg', color: '#16c26b' },
          { label: t('an.weightChange'), value: `${change > 0 ? '+' : ''}${change.toFixed(1)}`, unit: 'kg', color: change <= 0 ? '#16c26b' : '#f59e0b' },
          { label: t('dash.goal'), value: `${goals.weightTarget}`, unit: 'kg', color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="muted text-xs">{s.label}</div>
            <div className="mt-1 text-xl font-extrabold" style={{ color: s.color }}>
              {s.value}<span className="text-sm">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar to goal */}
      <div className="card p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="muted">{goals.weightTarget}kg</span>
          <span className="font-semibold text-brand-500">{progressPct.toFixed(0)}%</span>
          <span className="muted">{goals.weightStart}kg</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--ring-track)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="muted mt-2 text-center text-xs">
          {toGo > 0
            ? locale === 'ar' ? `باقي ${toGo.toFixed(1)}kg للوصول للهدف 💪` : `${toGo.toFixed(1)}kg to go 💪`
            : locale === 'ar' ? 'وصلت لهدفك! 🎉' : 'Goal reached! 🎉'}
        </p>
      </div>

      {/* Chart */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{locale === 'ar' ? 'تطور الوزن' : 'Weight trend'}</h3>
        {sorted.length > 1 ? (
          <LineChart labels={labels} data={sorted.map((w) => w.weight)} color="#16c26b" />
        ) : (
          <p className="muted py-8 text-center text-sm">
            {locale === 'ar' ? 'سجّل وزنك مرتين على الأقل لعرض الرسم البياني' : 'Log at least two entries to see the trend'}
          </p>
        )}
      </div>

      {/* Measurements */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setMOpen(true)} className="btn-ghost text-sm text-brand-500">
            <IconPlus width={16} height={16} /> {t('common.add')}
          </button>
          <h3 className="font-bold">{locale === 'ar' ? 'قياسات الجسم' : 'Body measurements'}</h3>
        </div>
        {measurements.length === 0 ? (
          <p className="muted text-center text-sm">{locale === 'ar' ? 'لا توجد قياسات بعد' : 'No measurements yet'}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries({
              waist: locale === 'ar' ? 'الخصر' : 'Waist',
              chest: locale === 'ar' ? 'الصدر' : 'Chest',
              hips: locale === 'ar' ? 'الورك' : 'Hips',
              arms: locale === 'ar' ? 'الذراع' : 'Arms',
              thighs: locale === 'ar' ? 'الفخذ' : 'Thighs',
            }).map(([k, label]) => {
              const v = (measurements[0] as any)[k];
              return v ? (
                <div key={k} className="flex justify-between rounded-xl bg-[var(--bg-elev)] px-3 py-2">
                  <span className="font-semibold">{v}cm</span>
                  <span className="muted">{label}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Progress photos */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{locale === 'ar' ? 'صور التقدم' : 'Progress photos'}</h3>
        <div className="grid grid-cols-3 gap-2">
          {weights.filter((w) => w.photoUrl).slice(0, 6).map((w) => (
            <img key={w.id} src={w.photoUrl} alt="progress" className="aspect-square rounded-2xl object-cover" />
          ))}
          {weights.filter((w) => w.photoUrl).length === 0 && (
            <p className="muted col-span-3 py-4 text-center text-sm">
              {locale === 'ar' ? 'أضف صورة مع تسجيل وزنك لمتابعة تغيّر جسمك' : 'Attach a photo when logging weight'}
            </p>
          )}
        </div>
      </div>

      {/* Entries list */}
      <div className="card p-4">
        <h3 className="mb-3 font-bold">{locale === 'ar' ? 'السجل' : 'History'}</h3>
        <div className="divide-y divide-[var(--border)]">
          {weights.map((w) => (
            <div key={w.id} className="group flex items-center justify-between py-2.5">
              <button onClick={() => removeWeight(w.id)} className="opacity-0 transition group-hover:opacity-100">
                <IconTrash width={16} height={16} className="text-rose-400" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold">{w.weight.toFixed(1)}kg</span>
                <span className="muted text-sm">
                  {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(w.recordedAt))}
                </span>
                <IconScale width={16} height={16} className="text-brand-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log weight sheet */}
      <Sheet open={open} onClose={() => setOpen(false)} title={locale === 'ar' ? 'تسجيل الوزن' : 'Log weight'}>
        <div className="space-y-4">
          <input
            className="input text-center text-2xl font-bold"
            type="number"
            inputMode="decimal"
            placeholder="90.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            autoFocus
          />
          <label className="btn-ghost w-full cursor-pointer border border-dashed border-[var(--border)]">
            📷 {locale === 'ar' ? 'أضف صورة (اختياري)' : 'Add photo (optional)'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(await compressImage(f, 720));
              }}
            />
          </label>
          {photo && <img src={photo} alt="preview" className="mx-auto max-h-40 rounded-2xl" />}
          <button
            className="btn-primary w-full"
            onClick={() => {
              const w = parseFloat(weight);
              if (w > 0) {
                addWeight({ weight: w, recordedAt: todayISO(), photoUrl: photo });
                setWeight('');
                setPhoto(undefined);
                setOpen(false);
              }
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Sheet>

      {/* Measurement sheet */}
      <Sheet open={mOpen} onClose={() => setMOpen(false)} title={locale === 'ar' ? 'قياسات الجسم' : 'Body measurements'}>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries({
            waist: locale === 'ar' ? 'الخصر' : 'Waist',
            chest: locale === 'ar' ? 'الصدر' : 'Chest',
            hips: locale === 'ar' ? 'الورك' : 'Hips',
            arms: locale === 'ar' ? 'الذراع' : 'Arms',
            thighs: locale === 'ar' ? 'الفخذ' : 'Thighs',
          }).map(([k, label]) => (
            <div key={k}>
              <label className="muted mb-1 block text-xs">{label} (cm)</label>
              <input
                className="input"
                type="number"
                value={(meas as any)[k]}
                onChange={(e) => setMeas((m) => ({ ...m, [k]: e.target.value }))}
              />
            </div>
          ))}
          <button
            className="btn-primary col-span-2 mt-2"
            onClick={() => {
              addMeasurement({
                waist: parseFloat(meas.waist) || undefined,
                chest: parseFloat(meas.chest) || undefined,
                hips: parseFloat(meas.hips) || undefined,
                arms: parseFloat(meas.arms) || undefined,
                thighs: parseFloat(meas.thighs) || undefined,
                recordedAt: todayISO(),
              });
              setMeas({ waist: '', chest: '', hips: '', arms: '', thighs: '' });
              setMOpen(false);
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}

export default function WeightPage() {
  return (
    <Hydrated>
      <WeightInner />
    </Hydrated>
  );
}
