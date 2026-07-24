'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { Sheet } from '@/components/ui/Sheet';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { requestNotifications, DEFAULT_REMINDERS, type ReminderPrefs } from '@/lib/notifications';
import { deriveGoals, tdee } from '@/lib/nutrition';
import {
  IconChevron, IconGlobe, IconMoon, IconSun, IconDumbbell, IconScale, IconTimer, IconSparkle,
} from '@/components/ui/Icons';
import type { Locale, ThemeMode } from '@/types';

function Row({ icon, title, subtitle, onClick, right }: { icon: React.ReactNode; title: string; subtitle?: string; onClick?: () => void; right?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-3.5 text-start">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--bg-elev)]">{icon}</span>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="muted text-xs">{subtitle}</div>}
      </div>
      {right ?? <IconChevron width={16} height={16} className="muted rotate-180" />}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-brand-500' : 'bg-[var(--ring-track)]'}`}
    >
      <motion.span layout className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function SettingsInner() {
  const { t, locale } = useT();
  const profile = useStore((s) => s.profile);
  const theme = useStore((s) => s.theme);
  const setLocale = useStore((s) => s.setLocale);
  const setTheme = useStore((s) => s.setTheme);
  const updateProfile = useStore((s) => s.updateProfile);
  const setGoals = useStore((s) => s.setGoals);
  const reset = useStore((s) => s.reset);

  const { install, canInstall, installed, iosHint } = usePwaInstall();
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reminders, setReminders] = useState<ReminderPrefs>(DEFAULT_REMINDERS);

  const [form, setForm] = useState({
    calories: profile.goals.calories,
    protein: profile.goals.protein,
    carbs: profile.goals.carbs,
    fat: profile.goals.fat,
    water: profile.goals.water,
    steps: profile.goals.steps,
    weightTarget: profile.goals.weightTarget,
  });
  const [pForm, setPForm] = useState({
    name: profile.name ?? '',
    age: profile.age ?? 28,
    heightCm: profile.heightCm ?? 175,
    sex: profile.sex ?? 'male',
    activityLevel: profile.activityLevel ?? 'light',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nutriai-reminders');
      if (raw) setReminders(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  function saveReminders(next: ReminderPrefs) {
    setReminders(next);
    localStorage.setItem('nutriai-reminders', JSON.stringify(next));
  }

  const recommended = tdee({ ...profile, weight: useStore.getState().weights[0]?.weight });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t('set.title')}</h1>

      {/* Daily needs */}
      <div className="card px-4">
        <Row
          icon={<IconSparkle className="text-rose-400" />}
          title={locale === 'ar' ? 'تعديل الاحتياج اليومي' : 'Daily needs'}
          subtitle={`${profile.goals.calories} ${t('common.kcal')} · ${profile.goals.protein}g ${locale === 'ar' ? 'بروتين' : 'protein'}`}
          onClick={() => setGoalsOpen(true)}
        />
      </div>

      {/* Goals section */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold muted">{t('set.goals')}</h2>
        <div className="card px-4">
          <Row icon={<span className="text-lg">👟</span>} title={locale === 'ar' ? 'هدف الخطوات' : 'Steps goal'} subtitle={`${profile.goals.steps.toLocaleString()} ${locale === 'ar' ? 'خطوة' : 'steps'}`} onClick={() => setGoalsOpen(true)} />
          <div className="border-t border-[var(--border)]" />
          <Row icon={<span className="text-lg">💧</span>} title={locale === 'ar' ? 'هدف الماء' : 'Water goal'} subtitle={`${profile.goals.water.toLocaleString()} ${locale === 'ar' ? 'مل' : 'ml'}`} onClick={() => setGoalsOpen(true)} />
          <div className="border-t border-[var(--border)]" />
          <Row icon={<span className="text-lg">❤️</span>} title={locale === 'ar' ? 'ربط البيانات الصحية' : 'Health data'} subtitle={locale === 'ar' ? 'الاتصال بـ Apple Health / Google Fit' : 'Connect Apple Health / Google Fit'} onClick={() => {}} />
        </div>
      </div>

      {/* Tools */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold muted">{locale === 'ar' ? 'الأدوات' : 'Tools'}</h2>
        <div className="card px-4">
          <Link href="/weight"><Row icon={<IconScale className="text-brand-400" />} title={t('nav.weight')} subtitle={locale === 'ar' ? 'رسوم بيانية وقياسات' : 'Charts & measurements'} /></Link>
          <div className="border-t border-[var(--border)]" />
          <Link href="/exercise"><Row icon={<IconDumbbell className="text-brand-400" />} title={t('ex.title')} subtitle={locale === 'ar' ? 'نادي، جري، سباحة...' : 'Gym, running, swimming...'} /></Link>
          <div className="border-t border-[var(--border)]" />
          <Link href="/fasting"><Row icon={<IconTimer className="text-brand-400" />} title={t('fast.title')} subtitle="16:8 · 18:6 · OMAD" /></Link>
        </div>
      </div>

      {/* App preferences */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold muted">{locale === 'ar' ? 'تفضيلات التطبيق' : 'App preferences'}</h2>
        <div className="card px-4">
          <Row
            icon={<IconGlobe className="text-purple-400" />}
            title={t('set.language')}
            subtitle={locale === 'ar' ? 'العربية' : 'English'}
            right={
              <div className="flex gap-1 rounded-full bg-[var(--bg-elev)] p-1">
                {(['ar', 'en'] as Locale[]).map((l) => (
                  <button key={l} onClick={() => setLocale(l)} className={`rounded-full px-3 py-1 text-xs font-bold ${locale === l ? 'bg-brand-500 text-white' : 'muted'}`}>
                    {l === 'ar' ? 'ع' : 'EN'}
                  </button>
                ))}
              </div>
            }
          />
          <div className="border-t border-[var(--border)]" />
          <Row
            icon={theme === 'light' ? <IconSun className="text-amber-400" /> : <IconMoon className="text-indigo-400" />}
            title={t('set.theme')}
            right={
              <div className="flex gap-1 rounded-full bg-[var(--bg-elev)] p-1">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                  <button key={m} onClick={() => setTheme(m)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${theme === m ? 'bg-brand-500 text-white' : 'muted'}`}>
                    {m === 'light' ? t('set.light') : m === 'dark' ? t('set.dark') : t('set.system')}
                  </button>
                ))}
              </div>
            }
          />
          <div className="border-t border-[var(--border)]" />
          <Row
            icon={<span className="text-lg">📅</span>}
            title={locale === 'ar' ? 'بداية الأسبوع' : 'Week start'}
            right={
              <div className="flex gap-1 rounded-full bg-[var(--bg-elev)] p-1">
                {(['sunday', 'monday'] as const).map((d) => (
                  <button key={d} onClick={() => updateProfile({ weekStart: d })} className={`rounded-full px-3 py-1 text-xs font-bold ${profile.weekStart === d ? 'bg-brand-500 text-white' : 'muted'}`}>
                    {d === 'sunday' ? (locale === 'ar' ? 'الأحد' : 'Sun') : (locale === 'ar' ? 'الإثنين' : 'Mon')}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>

      {/* Reminders */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold muted">{t('set.notifications')}</h2>
        <div className="card px-4">
          {([
            ['meals', locale === 'ar' ? 'تذكير الوجبات' : 'Meal reminders', '🍽️'],
            ['water', locale === 'ar' ? 'تذكير الماء' : 'Water reminders', '💧'],
            ['workout', locale === 'ar' ? 'تذكير التمرين' : 'Workout reminders', '🏋️'],
            ['weight', locale === 'ar' ? 'تذكير الوزن' : 'Weight reminders', '⚖️'],
            ['fasting', locale === 'ar' ? 'تذكير الصيام' : 'Fasting reminders', '⏳'],
          ] as [keyof ReminderPrefs, string, string][]).map(([key, label, emoji], i) => (
            <div key={key}>
              {i > 0 && <div className="border-t border-[var(--border)]" />}
              <div className="flex items-center gap-3 py-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--bg-elev)]">{emoji}</span>
                <span className="flex-1 font-semibold">{label}</span>
                <Toggle
                  on={reminders[key]}
                  onChange={async (v) => {
                    if (v) await requestNotifications();
                    saveReminders({ ...reminders, [key]: v });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Install + account */}
      <div className="card px-4">
        {!installed && (
          <>
            <Row
              icon={<span className="text-lg">📲</span>}
              title={t('set.install')}
              subtitle={iosHint ? (locale === 'ar' ? 'شارك ← أضف إلى الشاشة الرئيسية' : 'Share → Add to Home Screen') : (locale === 'ar' ? 'ثبّت NutriAI كتطبيق' : 'Install NutriAI as an app')}
              onClick={() => canInstall && install()}
              right={canInstall ? <span className="btn-primary px-3 py-1.5 text-xs">{t('common.add')}</span> : undefined}
            />
            <div className="border-t border-[var(--border)]" />
          </>
        )}
        <Row icon={<span className="text-lg">🔐</span>} title={locale === 'ar' ? 'الحساب والمزامنة' : 'Account & sync'} subtitle={locale === 'ar' ? 'Google · Apple · البريد' : 'Google · Apple · Email'} onClick={() => (window.location.href = '/login')} />
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm(locale === 'ar' ? 'متأكد من تصفير كل البيانات؟' : 'Reset all data?')) reset();
        }}
        className="btn-ghost w-full text-rose-400"
      >
        {t('set.reset')}
      </button>

      <p className="muted pb-4 text-center text-xs">NutriAI · v1.0 · {locale === 'ar' ? 'صُنع بحب 💚' : 'Made with 💚'}</p>

      {/* Goals editor sheet */}
      <Sheet open={goalsOpen} onClose={() => setGoalsOpen(false)} title={t('set.goals')}>
        <div className="space-y-3">
          <button
            onClick={() => {
              const g = deriveGoals(recommended, useStore.getState().weights[0]?.weight ?? 90, form.weightTarget);
              setForm({ ...form, calories: g.calories, protein: g.protein, carbs: g.carbs, fat: g.fat });
            }}
            className="w-full rounded-2xl bg-brand-500/10 py-3 text-sm font-semibold text-brand-500"
          >
            ✨ {locale === 'ar' ? `احسب تلقائيًا (${recommended} سعرة موصى بها)` : `Auto-calculate (${recommended} kcal recommended)`}
          </button>
          {([
            ['calories', t('dash.calories'), t('common.kcal')],
            ['protein', t('dash.protein'), 'g'],
            ['carbs', t('dash.carbs'), 'g'],
            ['fat', t('dash.fat'), 'g'],
            ['water', t('dash.water'), 'ml'],
            ['steps', t('dash.steps'), locale === 'ar' ? 'خطوة' : 'steps'],
            ['weightTarget', t('dash.goal'), 'kg'],
          ] as [keyof typeof form, string, string][]).map(([key, label, unit]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="flex-1 text-sm font-medium">{label}</label>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })}
                className="input w-28 text-center"
              />
              <span className="muted w-12 text-xs">{unit}</span>
            </div>
          ))}
          <button
            className="btn-primary w-full"
            onClick={() => {
              setGoals(form);
              setGoalsOpen(false);
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Sheet>

      {/* Profile sheet (kept for completeness) */}
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)} title={t('set.profile')}>
        <div className="space-y-3">
          <input className="input" placeholder={locale === 'ar' ? 'الاسم' : 'Name'} value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} />
          <button
            className="btn-primary w-full"
            onClick={() => {
              updateProfile(pForm as any);
              setProfileOpen(false);
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Hydrated>
      <SettingsInner />
    </Hydrated>
  );
}
