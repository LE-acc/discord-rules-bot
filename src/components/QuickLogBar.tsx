'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAiLog } from '@/hooks/useAiLog';
import { useT } from '@/lib/i18n';
import { IconCamera, IconSend, IconSparkle } from '@/components/ui/Icons';
import { compressImage } from '@/lib/image';

export function QuickLogBar() {
  const { t, locale } = useT();
  const router = useRouter();
  const { sendText, sendImage, loading } = useAiLog();
  const [text, setText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit() {
    const value = text.trim();
    if (!value || loading) return;
    setText('');
    const res = await sendText(value, { source: 'chat' });
    setToast(res.reply.split('\n')[0]);
    setTimeout(() => setToast(null), 4000);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setToast(locale === 'ar' ? 'يحلّل الصورة...' : 'Analyzing photo...');
    const res = await sendImage(dataUrl);
    setToast(res.reply.split('\n')[0]);
    setTimeout(() => setToast(null), 4500);
    e.target.value = '';
  }

  const chips = locale === 'ar'
    ? ['أكلت ٣ بيضات', 'غديت مضبي نص دجاجة', 'شربت بروتين ٤٠ جرام', 'أكلت من البيك']
    : ['3 eggs', 'chicken kabsa 200g', 'protein shake 40g', 'Big Mac'];

  return (
    <div className="card overflow-hidden p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-elev)] text-brand-500"
          aria-label="camera"
        >
          <IconCamera width={20} height={20} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        <input
          className="input flex-1 border-0 bg-transparent px-1 py-2"
          placeholder={t('chat.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={submit}
          disabled={loading}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white disabled:opacity-50"
          aria-label="send"
        >
          {loading ? <IconSparkle className="animate-pulse" width={20} height={20} /> : <IconSend width={18} height={18} />}
        </motion.button>
      </div>

      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setText(c)}
            className="chip shrink-0 whitespace-nowrap text-xs"
          >
            {c}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => router.push('/chat')}
            className="mt-2 flex w-full items-center gap-2 rounded-2xl bg-brand-500/10 p-3 text-start text-sm text-brand-600 dark:text-brand-300"
          >
            <IconSparkle width={18} height={18} className="shrink-0" />
            <span className="line-clamp-2">{toast}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
