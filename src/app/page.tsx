'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { useStore } from '@/store';
import { IconSparkle, IconCamera, IconMic, IconBarcode, IconChart, IconTimer } from '@/components/ui/Icons';

const FEATURES = [
  { icon: IconSparkle, ar: 'محادثة ذكية', en: 'AI Chat', dAr: 'اكتب أكلك بطبيعتك ونحسبها لك', dEn: 'Type naturally, we crunch the numbers' },
  { icon: IconCamera, ar: 'تصوير الأكل', en: 'Photo AI', dAr: 'صوّر صحنك ونكتشف كل صنف', dEn: 'Snap your plate, we detect every food' },
  { icon: IconMic, ar: 'التسجيل الصوتي', en: 'Voice logging', dAr: 'تكلّم ونسجّل لك تلقائيًا', dEn: 'Speak and we log it automatically' },
  { icon: IconBarcode, ar: 'مسح الباركود', en: 'Barcode scan', dAr: 'امسح أي منتج واحصل على تغذيته', dEn: 'Scan any product for instant nutrition' },
  { icon: IconChart, ar: 'تحليلات وأهداف', en: 'Analytics & goals', dAr: 'رسوم بيانية لتقدمك ووزنك', dEn: 'Beautiful charts for progress & weight' },
  { icon: IconTimer, ar: 'الصيام المتقطع', en: 'Fasting timer', dAr: 'عدّاد صيام ونوافذ أكل', dEn: 'Fasting countdown & eating windows' },
];

export default function Landing() {
  const { locale, t } = useT();
  const setLocale = useStore((s) => s.setLocale);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-5xl px-5 py-6">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <IconSparkle width={22} height={22} />
          </div>
          <span className="text-xl font-extrabold">NutriAI</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="chip text-xs">
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>
          <Link href="/login" className="btn-ghost text-sm">{t('land.login')}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-16 text-center md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-500"
        >
          <IconSparkle width={16} height={16} />
          {locale === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-6xl"
        >
          {locale === 'ar' ? (
            <>سجّل أكلك بمجرد أن <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">تكتبه</span></>
          ) : (
            <>Log your food just by <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">typing it</span></>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="muted mx-auto mt-5 max-w-xl text-lg"
        >
          {locale === 'ar'
            ? '«غديت مضبي نص دجاجة مع رز» — ونحسب لك السعرات والبروتين فورًا. يفهم اللهجة السعودية والخليجية.'
            : '"Half a madbi chicken with rice" — and we instantly calculate calories & macros. Understands Saudi & Gulf dialects.'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-lg">
            {t('land.cta')} →
          </Link>
          <Link href="/chat" className="btn-ghost border border-[var(--border)] px-8 py-3.5 text-lg">
            {locale === 'ar' ? 'جرّب المساعد' : 'Try the AI'}
          </Link>
        </motion.div>

        {/* Chat mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card mx-auto mt-14 max-w-md space-y-3 p-5 text-start"
        >
          <div className="flex justify-start">
            <div className="rounded-3xl rounded-tr-md bg-[var(--bg-elev)] px-4 py-2.5 text-sm">
              {locale === 'ar' ? 'أكلت رز كبسة تقريبًا ٢٠٠ جرام 🍛' : 'I ate ~200g chicken kabsa 🍛'}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-2.5 text-sm text-white">
              {locale === 'ar'
                ? 'سجّلتها ✅ كبسة دجاج ٢٠٠غ = ٣٧٣ سعرة · ٢٠غ بروتين. باقي لك ١٨٢٧ سعرة اليوم 💪'
                : 'Logged ✅ Chicken kabsa 200g = 373 kcal · 20g protein. 1,827 kcal left today 💪'}
            </div>
          </div>
          <div className="flex justify-end">
            <span className="chip text-xs text-brand-500">92% {locale === 'ar' ? 'ثقة' : 'confidence'}</span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.en}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="card p-6"
          >
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-500">
              <f.icon />
            </div>
            <h3 className="text-lg font-bold">{locale === 'ar' ? f.ar : f.en}</h3>
            <p className="muted mt-1 text-sm">{locale === 'ar' ? f.dAr : f.dEn}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="card my-10 overflow-hidden p-10 text-center">
        <div className="pointer-events-none absolute" />
        <h2 className="text-3xl font-black">{locale === 'ar' ? 'ابدأ رحلتك الصحية اليوم' : 'Start your health journey today'}</h2>
        <p className="muted mx-auto mt-3 max-w-md">
          {locale === 'ar' ? 'مجاني تمامًا · يعمل على iPhone و Android · بدون تعقيد' : 'Completely free · Works on iPhone & Android · No hassle'}
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex px-8 py-3.5 text-lg">
          {t('land.cta')} →
        </Link>
      </section>

      <footer className="muted py-8 text-center text-sm">
        NutriAI © {new Date().getFullYear()} · {locale === 'ar' ? 'صُنع بحب في السعودية 💚' : 'Made with 💚'}
      </footer>
    </main>
  );
}
