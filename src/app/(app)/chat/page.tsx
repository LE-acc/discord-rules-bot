'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { useAiLog } from '@/hooks/useAiLog';
import { useVoice } from '@/hooks/useVoice';
import { compressImage } from '@/lib/image';
import { Hydrated } from '@/components/ui/Hydrated';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { IconCamera, IconMic, IconSend, IconSparkle } from '@/components/ui/Icons';
import type { ChatMessage } from '@/types';

function ChatInner() {
  const { t, locale } = useT();
  const chat = useStore((s) => s.chat);
  const addChat = useStore((s) => s.addChat);
  const clearChat = useStore((s) => s.clearChat);
  const { sendText, sendImage, loading } = useAiLog();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { start, stop, listening, supported } = useVoice((spoken) => {
    setText((prev) => (prev ? `${prev} ${spoken}` : spoken));
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, loading]);

  function history() {
    return chat.slice(-8).map((m) => ({ role: m.role, content: m.content }));
  }

  async function handleSend() {
    const value = text.trim();
    if (!value || loading) return;
    setText('');
    addChat({ role: 'user', content: value });
    const res = await sendText(value, { source: 'chat', history: history() });
    const assistant: Omit<ChatMessage, 'id' | 'createdAt'> = {
      role: 'assistant',
      content: (res.reply || '') + (res.coach ? `\n\n${res.coach}` : ''),
      suggestions: res.suggestions,
    };
    if (res.kind === 'meal' && res.items.length) {
      // Attach the freshly-logged meal (last one added).
      const latest = useStore.getState().meals[0];
      assistant.meal = latest;
    }
    addChat(assistant);
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    addChat({ role: 'user', content: locale === 'ar' ? '📷 صورة وجبة' : '📷 Meal photo', imageUrl: dataUrl });
    const res = await sendImage(dataUrl);
    const latest = useStore.getState().meals[0];
    addChat({
      role: 'assistant',
      content: (res.reply || '') + (res.coach ? `\n\n${res.coach}` : ''),
      meal: res.items.length ? latest : undefined,
    });
    e.target.value = '';
  }

  const suggestions =
    chat.length === 0
      ? locale === 'ar'
        ? ['أكلت ٣ بيضات', 'غديت مضبي نص دجاجة مع رز', 'شربت بروتين ٤٠ جرام', 'أكلت من البيك']
        : ['I ate 3 eggs', 'Half madbi chicken with rice', 'Protein shake 40g', 'A Big Mac']
      : chat[chat.length - 1]?.suggestions ?? [];

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <IconSparkle width={20} height={20} />
          </div>
          <div>
            <h1 className="font-bold leading-tight">{t('chat.title')}</h1>
            <p className="muted text-xs">{t('chat.hint')}</p>
          </div>
        </div>
        {chat.length > 0 && (
          <button onClick={clearChat} className="muted text-xs hover:text-rose-400">
            {locale === 'ar' ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto pb-2">
        {chat.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-glow">
              {t('chat.welcome').split('\n').map((l, i) => (
                <span key={i} className="block">{l}</span>
              ))}
            </div>
          </motion.div>
        )}

        {chat.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-md bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-3.5 shadow-glow">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setText(s)}
              className="chip shrink-0 whitespace-nowrap text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="card flex items-end gap-2 p-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--bg-elev)] text-brand-500"
          aria-label="camera"
        >
          <IconCamera width={22} height={22} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={handleImage} />

        {supported && (
          <button
            onClick={listening ? stop : start}
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
              listening ? 'bg-rose-500 text-white' : 'bg-[var(--bg-elev)] text-brand-500'
            }`}
            aria-label="voice"
          >
            {listening && <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/50" />}
            <IconMic width={22} height={22} />
          </button>
        )}

        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('chat.placeholder')}
          className="max-h-28 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white disabled:opacity-40"
          aria-label="send"
        >
          <IconSend width={20} height={20} />
        </motion.button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Hydrated>
      <ChatInner />
    </Hydrated>
  );
}
