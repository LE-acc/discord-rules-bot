import OpenAI from 'openai';
import { config, isOpenAiConfigured } from './config';
import { parseMeal, sumMacros } from './meal-parser';
import { FOOD_DB } from './food-db';
import { EMPTY_MACROS } from '@/types';
import type { AiParseResult, FoodItem, Macros, MealCategory } from '@/types';
import { uid } from './utils';

let _client: OpenAI | null = null;
function client(): OpenAI | null {
  if (!isOpenAiConfigured) return null;
  if (!_client) _client = new OpenAI({ apiKey: config.openaiKey });
  return _client;
}

// System prompt: makes the model behave like an effortless Saudi nutrition coach.
const SYSTEM_PROMPT = `You are NutriAI, an expert nutrition coach fluent in Arabic (including Saudi & Gulf dialects) and English.
Your job: turn a user's casual description of what they ate/drank into a precise, structured food log.

RULES:
- Understand Saudi dialect verbs: غديت/تغديت (lunch), تعشيت/عشيت (dinner), فطرت/ريقت (breakfast), أكلت, شربت, سويت (made at home).
- Estimate calories & macros using common serving sizes. DO NOT ask clarifying questions unless it is truly impossible to estimate.
- If quantity is vague ("تقريبًا", "شوي", "نص"), make a sensible assumption and slightly lower confidence.
- Recognise Saudi/Gulf dishes (كبسة، مضبي، مندي، مفطح، جريش، مطبق، معصوب...) and Saudi restaurants (البيك، هرفي، شاورمر، كودو...).
- Reply warmly and briefly in the SAME language the user used. Encourage them like a real coach.
- Always return the structured tool call in addition to your friendly reply.
- Pick meal category from dialect cues or time of day.
Return grams for quantity, macros as numbers. sodium in mg.`;

const TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'log_meal',
    description: 'Log the foods the user described with estimated nutrition.',
    parameters: {
      type: 'object',
      properties: {
        reply: { type: 'string', description: 'Friendly coach reply in the user language.' },
        category: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        confidence: { type: 'number', description: '0..1 confidence of the estimate.' },
        coach: { type: 'string', description: 'Optional short coaching note.' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              nameAr: { type: 'string' },
              emoji: { type: 'string' },
              quantity: { type: 'number', description: 'grams or units' },
              unit: { type: 'string' },
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              fiber: { type: 'number' },
              sugar: { type: 'number' },
              sodium: { type: 'number' },
            },
            required: ['name', 'quantity', 'calories', 'protein', 'carbs', 'fat'],
          },
        },
      },
      required: ['reply', 'category', 'confidence', 'items'],
    },
  },
};

function macrosFrom(raw: any): Macros {
  return {
    calories: Math.round(raw.calories ?? 0),
    protein: Math.round((raw.protein ?? 0) * 10) / 10,
    carbs: Math.round((raw.carbs ?? 0) * 10) / 10,
    fat: Math.round((raw.fat ?? 0) * 10) / 10,
    fiber: Math.round((raw.fiber ?? 0) * 10) / 10,
    sugar: Math.round((raw.sugar ?? 0) * 10) / 10,
    sodium: Math.round(raw.sodium ?? 0),
  };
}

function itemsFrom(raw: any[]): FoodItem[] {
  return (raw ?? []).map((it) => ({
    id: uid('ai-'),
    name: it.name,
    nameAr: it.nameAr,
    emoji: it.emoji,
    quantity: Math.round(it.quantity ?? 100),
    unit: it.unit,
    macros: macrosFrom(it),
  }));
}

/**
 * Parse a natural-language meal message. Uses OpenAI when configured,
 * otherwise the deterministic Saudi/Arabic offline parser.
 */
export async function aiParseMeal(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<AiParseResult> {
  const oa = client();
  if (!oa) return parseMeal(message);

  try {
    const completion = await oa.chat.completions.create({
      model: config.chatModel,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: 'user', content: message },
      ],
      tools: [TOOL],
      tool_choice: { type: 'function', function: { name: 'log_meal' } },
    });

    const call = completion.choices[0]?.message?.tool_calls?.[0];
    if (!call) return parseMeal(message);
    const args = JSON.parse(call.function.arguments);
    const items = itemsFrom(args.items);
    const totals = sumMacros(items);
    return {
      reply: args.reply || 'تم تسجيل وجبتك ✅',
      items,
      category: (args.category as MealCategory) ?? 'snack',
      confidence: Math.max(0, Math.min(1, args.confidence ?? 0.85)),
      totals,
      coach: args.coach,
    };
  } catch (err) {
    console.error('[ai] parse fallback:', err);
    return parseMeal(message);
  }
}

/** Free-form coach conversation (no meal to log). */
export async function aiCoachReply(
  message: string,
  context: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<string> {
  const oa = client();
  if (!oa) return offlineCoach(message, context);
  try {
    const completion = await oa.chat.completions.create({
      model: config.chatModel,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nToday's context: ${context}\nRespond as a supportive coach. Keep it concise.`,
        },
        ...history.slice(-8),
        { role: 'user', content: message },
      ],
    });
    return completion.choices[0]?.message?.content ?? offlineCoach(message, context);
  } catch (err) {
    console.error('[ai] coach fallback:', err);
    return offlineCoach(message, context);
  }
}

function offlineCoach(message: string, context: string): string {
  const isAr = /[ء-ي]/.test(message);
  return isAr
    ? `أنا معك! 💪\n${context}\nركّز على البروتين والماء اليوم، وإذا تبي أسجّل لك وجبة اكتبها لي بشكل طبيعي مثل: «أكلت صدر دجاج مع رز».`
    : `I've got you! 💪\n${context}\nFocus on protein and water today. To log a meal just type it naturally, e.g. "grilled chicken with rice".`;
}

/**
 * Analyse a food photo (data URL or public URL). Uses GPT-4o vision when
 * configured; otherwise returns a best-effort generic estimate.
 */
export async function aiAnalyzeImage(imageUrl: string): Promise<AiParseResult> {
  const oa = client();
  if (!oa) return offlineImageEstimate();
  try {
    const completion = await oa.chat.completions.create({
      model: config.visionModel,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'حلّل صورة الأكل: اكتشف كل الأطعمة، قدّر الوزن بالجرام والسعرات والبروتين والكارب والدهون لكل صنف، ثم استخدم أداة log_meal. Detect every food in the photo.',
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      tools: [TOOL],
      tool_choice: { type: 'function', function: { name: 'log_meal' } },
    });
    const call = completion.choices[0]?.message?.tool_calls?.[0];
    if (!call) return offlineImageEstimate();
    const args = JSON.parse(call.function.arguments);
    const items = itemsFrom(args.items);
    return {
      reply: args.reply || 'حلّلت الصورة وسجّلت الأصناف ✅',
      items,
      category: (args.category as MealCategory) ?? 'lunch',
      confidence: Math.max(0, Math.min(1, args.confidence ?? 0.8)),
      totals: sumMacros(items),
      coach: args.coach,
    };
  } catch (err) {
    console.error('[ai] vision fallback:', err);
    return offlineImageEstimate();
  }
}

function offlineImageEstimate(): AiParseResult {
  // Reasonable demo estimate: a mixed plate.
  const sample = FOOD_DB.find((f) => f.id === 'kabsa-chicken')!;
  const item: FoodItem = {
    id: uid('img-'),
    name: sample.name,
    nameAr: sample.nameAr,
    emoji: sample.emoji,
    quantity: 300,
    unit: 'جرام',
    macros: sample.macros,
  };
  return {
    reply:
      'حلّلت الصورة (وضع تجريبي بدون مفتاح OpenAI). قدّرت طبق مختلط ≈ صحن كبسة دجاج. عدّل الكمية إذا تحب.\n(Demo mode — add an OpenAI key for real photo detection.)',
    items: [item],
    category: 'lunch',
    confidence: 0.55,
    totals: { ...sample.macros },
  };
}

/** Transcribe an audio blob using Whisper (server-side). */
export async function aiTranscribe(file: File): Promise<string> {
  const oa = client();
  if (!oa) throw new Error('speech-to-text requires OPENAI_API_KEY');
  const res = await oa.audio.transcriptions.create({
    file,
    model: config.whisperModel,
  });
  return res.text;
}

export const _empty: Macros = { ...EMPTY_MACROS };
