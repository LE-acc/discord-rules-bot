import { NextResponse } from 'next/server';
import { aiParseMeal, aiCoachReply } from '@/lib/ai';
import { normalizeArabic } from '@/lib/food-db';
import { EMPTY_MACROS } from '@/types';
import type { Goals, Macros } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  context?: { consumed: Macros; goals: Goals; water: number };
}

// Words that signal a question/coaching request rather than a meal to log.
const COACH_CUES = [
  'كم', 'باقي', 'متبقي', 'وش', 'ايش', 'كيف', 'اقترح', 'نصيحه', 'نصيحة',
  'ليش', 'متى', 'هل', 'ممكن', 'ابي اعرف', 'وزني', 'هدفي', 'رايك',
  'how', 'what', 'why', 'suggest', 'recommend', 'should', 'remaining', 'advice',
  '?', '؟',
];
// Words that strongly signal eating/logging.
const MEAL_CUES = [
  'اكلت', 'كلت', 'شربت', 'تناولت', 'غديت', 'تغديت', 'تعشيت', 'عشيت',
  'فطرت', 'ريقت', 'سويت', 'طبخت', 'خذيت', 'ate', 'drank', 'had', 'ligged',
];

function isMealIntent(msg: string): boolean {
  const n = normalizeArabic(msg);
  const hasMeal = MEAL_CUES.some((c) => n.includes(normalizeArabic(c)));
  const hasCoach = COACH_CUES.some((c) => n.includes(normalizeArabic(c)));
  if (hasMeal && !hasCoach) return true;
  if (hasCoach && !hasMeal) return false;
  // Ambiguous — default to attempting a log; the parser returns 0 items if none.
  return hasMeal;
}

function buildContext(ctx?: Body['context'], isAr = true): string {
  if (!ctx) return '';
  const rem = ctx.goals.calories - ctx.consumed.calories;
  const remP = ctx.goals.protein - ctx.consumed.protein;
  if (isAr) {
    return `المستهلك اليوم: ${ctx.consumed.calories} سعرة، ${ctx.consumed.protein}غ بروتين. المتبقي: ${rem} سعرة و ${remP}غ بروتين. الماء: ${ctx.water}/${ctx.goals.water} مل.`;
  }
  return `Consumed today: ${ctx.consumed.calories} kcal, ${ctx.consumed.protein}g protein. Remaining: ${rem} kcal and ${remP}g protein. Water: ${ctx.water}/${ctx.goals.water} ml.`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const message = (body.message ?? '').trim();
  if (!message) return NextResponse.json({ error: 'empty message' }, { status: 400 });

  const isAr = /[ء-ي]/.test(message);
  const contextStr = buildContext(body.context, isAr);

  if (isMealIntent(message)) {
    const result = await aiParseMeal(message, body.history);
    if (result.items.length > 0) {
      return NextResponse.json({ ...result, kind: 'meal' });
    }
    // Nothing recognised — fall through to coach reply.
  }

  const reply = await aiCoachReply(message, contextStr, body.history);
  return NextResponse.json({
    kind: 'coach',
    reply,
    items: [],
    category: 'snack',
    confidence: 1,
    totals: { ...EMPTY_MACROS },
    suggestions: isAr
      ? ['سجّل وجبتي', 'كم بروتين باقي؟', 'اقترح لي سناك صحي']
      : ['Log my meal', 'How much protein is left?', 'Suggest a healthy snack'],
  });
}
