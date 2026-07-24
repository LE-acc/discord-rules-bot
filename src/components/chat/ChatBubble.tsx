'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MealResultCard } from './MealResultCard';
import type { ChatMessage } from '@/types';

/** Render **bold** and preserve newlines without a full markdown lib. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i} className="block">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex w-full', isUser ? 'justify-start' : 'justify-end')}
    >
      <div className={cn('max-w-[85%]', isUser ? 'order-1' : 'order-2')}>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="meal"
            className="mb-1.5 max-h-56 rounded-2xl object-cover"
          />
        )}
        <div
          className={cn(
            'rounded-3xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-md bg-[var(--bg-elev)] text-[var(--text)]'
              : 'rounded-tl-md bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow',
          )}
        >
          <RichText text={message.content} />
        </div>
        {message.meal && message.meal.items.length > 0 && (
          <MealResultCard meal={message.meal} />
        )}
      </div>
    </motion.div>
  );
}
