'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { publicFlags } from '@/lib/config';
import { useT } from '@/lib/i18n';
import { IconSparkle } from '@/components/ui/Icons';

export default function LoginPage() {
  const { locale, t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function oauth(provider: 'google' | 'apple') {
    if (!supabase) {
      router.push('/dashboard');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  }

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!supabase) {
      router.push('/dashboard');
      return;
    }
    setLoading(true);
    try {
      const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn({ email, password });
      if (error) setError(error.message);
      else router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <IconSparkle width={28} height={28} />
          </div>
          <h1 className="text-2xl font-extrabold">NutriAI</h1>
          <p className="muted text-sm">{t('land.tagline')}</p>
        </div>

        {!publicFlags.supabase && (
          <div className="mb-4 rounded-2xl bg-amber-500/10 p-3 text-center text-xs text-amber-500">
            {locale === 'ar'
              ? 'وضع تجريبي: بياناتك تُحفظ محليًا على جهازك. أضف مفاتيح Supabase للمزامنة السحابية.'
              : 'Demo mode: data is stored locally. Add Supabase keys for cloud sync.'}
          </div>
        )}

        <div className="space-y-2.5">
          <button onClick={() => oauth('google')} className="btn w-full border border-[var(--border)] bg-[var(--bg-elev)]">
            <span className="text-lg">🔵</span> {locale === 'ar' ? 'المتابعة مع Google' : 'Continue with Google'}
          </button>
          <button onClick={() => oauth('apple')} className="btn w-full border border-[var(--border)] bg-[var(--bg-elev)]">
            <span className="text-lg"></span> {locale === 'ar' ? 'المتابعة مع Apple' : 'Continue with Apple'}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="muted text-xs">{locale === 'ar' ? 'أو بالبريد' : 'or with email'}</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={emailAuth} className="space-y-3">
          <input className="input" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="text-center text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {mode === 'signin' ? t('land.login') : (locale === 'ar' ? 'إنشاء حساب' : 'Create account')}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="muted mt-4 w-full text-center text-sm"
        >
          {mode === 'signin'
            ? (locale === 'ar' ? 'ليس لديك حساب؟ سجّل الآن' : "Don't have an account? Sign up")
            : (locale === 'ar' ? 'لديك حساب؟ سجّل الدخول' : 'Have an account? Sign in')}
        </button>

        <Link href="/dashboard" className="btn-ghost mt-2 w-full text-sm text-brand-500">
          {locale === 'ar' ? 'المتابعة كضيف →' : 'Continue as guest →'}
        </Link>
      </motion.div>
    </main>
  );
}
