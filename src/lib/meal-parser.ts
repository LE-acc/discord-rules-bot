import { EMPTY_MACROS } from '@/types';
import type { AiParseResult, FoodItem, Macros, MealCategory } from '@/types';
import { FOOD_DB, normalizeArabic } from './food-db';
import type { FoodDbEntry } from '@/types';

// ─────────────────────────────────────────────────────────────
// Offline Saudi/Arabic natural-language meal parser.
// This is a deterministic fallback used when no OpenAI key is set,
// and as a safety net if the model call fails. It understands
// Arabic-Indic numerals, Saudi dialect verbs, quantities, and units.
// ─────────────────────────────────────────────────────────────

/** Convert Arabic-Indic (٠-٩) and Persian digits to Western. */
export function toWesternDigits(input: string): string {
  const map: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  };
  return input.replace(/[٠-٩۰-۹]/g, (d) => map[d] ?? d);
}

// Spelled-out Arabic quantity words → number.
const ARABIC_NUMBER_WORDS: Record<string, number> = {
  'نص': 0.5, 'نصف': 0.5, 'ربع': 0.25, 'ثلث': 0.33,
  'وحده': 1, 'وحدة': 1, 'حبه': 1, 'حبة': 1,
  'واحد': 1, 'واحده': 1, 'ثنتين': 2, 'اثنين': 2, 'ثنين': 2,
  'ثلاث': 3, 'ثلاثه': 3, 'ثلاثة': 3, 'اربع': 4, 'اربعه': 4, 'أربع': 4,
  'خمس': 5, 'خمسه': 5, 'ست': 6, 'سته': 6, 'سبع': 7, 'سبعه': 7,
  'ثمان': 8, 'ثمانيه': 8, 'تسع': 9, 'عشر': 10, 'عشره': 10,
};

// Meal-category cues (Saudi dialect verbs + explicit words).
const CATEGORY_CUES: Array<{ words: string[]; category: MealCategory }> = [
  { words: ['فطرت', 'ريوق', 'ريقت', 'فطور', 'الفطور', 'صباح', 'breakfast'], category: 'breakfast' },
  { words: ['غديت', 'تغديت', 'غدا', 'الغداء', 'غداء', 'lunch'], category: 'lunch' },
  { words: ['تعشيت', 'عشيت', 'عشا', 'العشاء', 'عشاء', 'dinner'], category: 'dinner' },
  { words: ['سناك', 'وجبه خفيفه', 'تصبيره', 'snack', 'بينزو'], category: 'snack' },
];

// Verbs that indicate consumption (used to detect intent).
const CONSUME_VERBS = [
  'اكلت', 'كلت', 'شربت', 'تناولت', 'خذيت', 'اخذت', 'سويت', 'طبخت',
  'غديت', 'تغديت', 'تعشيت', 'عشيت', 'فطرت', 'ريقت', 'عندي', 'ate', 'had',
  'drank', ' عشان',
];

// Unit words mapped to grams (for count-based foods handled separately).
const UNIT_GRAMS: Record<string, number> = {
  'جرام': 1, 'غرام': 1, 'جم': 1, 'g': 1, 'gram': 1, 'grams': 1,
  'كيلو': 1000, 'كجم': 1000, 'kg': 1000,
  'ملعقه': 15, 'ملعقة': 15, 'م ك': 15,
  'كوب': 240, 'كاسه': 240, 'كاسة': 240, 'cup': 240,
  'علبه': 330, 'علبة': 330, 'can': 330,
  'مكيال': 30, 'scoop': 30, 'سكوب': 30,
};

/** Determine meal category from text, falling back to time-of-day. */
function detectCategory(normalized: string, now = new Date()): MealCategory {
  for (const cue of CATEGORY_CUES) {
    if (cue.words.some((w) => normalized.includes(normalizeArabic(w)))) {
      return cue.category;
    }
  }
  const h = now.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

interface Detection {
  entry: FoodDbEntry;
  index: number;
  anchor: string;
}

// Words that carry no food meaning and must not drive detection.
const STOP_TOKENS = new Set<string>([
  ...CONSUME_VERBS.map(normalizeArabic),
  ...Object.keys(ARABIC_NUMBER_WORDS).map(normalizeArabic),
  ...Object.keys(UNIT_GRAMS).map(normalizeArabic),
  ...CATEGORY_CUES.flatMap((c) => c.words.map(normalizeArabic)),
  'من', 'مع', 'في', 'على', 'او', 'و', 'بال', 'بيت', 'بالبيت', 'تقريبا',
  'شوي', 'حبه', 'حبات', 'كل', 'اليوم', 'الحين', 'عندي', 'صار', 'بعد',
  'the', 'a', 'an', 'of', 'with', 'and', 'at', 'home', 'made', 'today',
]);

/** Split text into lowercase word tokens (letters/digits only). */
function tokenize(text: string): string[] {
  return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** Content words the user actually named a food with (no verbs/units/numbers). */
function contentTokens(normalized: string): string[] {
  return tokenize(normalized).filter(
    (w) => w.length >= 2 && !STOP_TOKENS.has(w) && !/^\d+$/.test(w),
  );
}

/** True when two Arabic/English tokens refer to the same word (handles plurals). */
function tokenMatch(userTok: string, sigTok: string): boolean {
  if (userTok === sigTok) return true;
  if (userTok.length >= 3 && sigTok.length >= 3) {
    return userTok.includes(sigTok) || sigTok.includes(userTok);
  }
  return false;
}

interface Signature {
  entry: FoodDbEntry;
  nameToks: string[]; // combined, used for coverage scoring
  nameToksAr: string[]; // Arabic dish-name tokens
  nameToksEn: string[]; // English dish-name tokens
  tagToks: string[]; // from tags (secondary)
}

function signatureOf(entry: FoodDbEntry): Signature {
  const keep = (w: string) => w.length >= 2 && !STOP_TOKENS.has(w);
  const nameToksAr = [...new Set(tokenize(normalizeArabic(entry.nameAr)).filter(keep))];
  const nameToksEn = [...new Set(tokenize(normalizeArabic(entry.name)).filter(keep))];
  const tagToks = [
    ...new Set(entry.tags.flatMap((t) => tokenize(normalizeArabic(t))).filter(keep)),
  ];
  return {
    entry,
    nameToks: [...new Set([...nameToksAr, ...nameToksEn])],
    nameToksAr,
    nameToksEn,
    tagToks,
  };
}

const SIGNATURES = FOOD_DB.map(signatureOf);

/**
 * Detect foods via token-coverage scoring. Each accepted food must cover at
 * least one user word not already claimed by a higher-scoring food, so a single
 * dish ("مضبي نص دجاجة") maps to one entry instead of every chicken dish.
 */
function detectFoods(normalized: string): Detection[] {
  const userToks = contentTokens(normalized);
  if (userToks.length === 0) return [];
  const isArabic = /[ء-ي]/.test(normalized);

  // Score every entry against the user tokens.
  const scored = SIGNATURES.map((sig) => {
    const covered = new Set<string>();
    let score = 0;
    for (const ut of userToks) {
      if (sig.nameToks.some((s) => tokenMatch(ut, s))) {
        score += 2;
        covered.add(ut);
      } else if (sig.tagToks.some((s) => tokenMatch(ut, s))) {
        score += 1;
        covered.add(ut);
      }
    }
    // Precision penalty: dish-name tokens (in the user's language) that were
    // never mentioned make the match less specific — e.g. don't pick
    // "نص دجاجة مضبي مع رز" when the user only said "رز".
    const primaryName = isArabic ? sig.nameToksAr : sig.nameToksEn;
    const unmatchedName = primaryName.filter(
      (s) => !userToks.some((ut) => tokenMatch(ut, s)),
    ).length;
    score -= unmatchedName * 1.5;
    // Phrase bonus: consecutive name tokens the user also said consecutively
    // (e.g. "صدر دجاج", "رز أبيض") signal a real, specific match.
    for (let i = 0; i + 1 < primaryName.length; i++) {
      const [a, b] = [primaryName[i], primaryName[i + 1]];
      for (let j = 0; j + 1 < userToks.length; j++) {
        const [u1, u2] = [userToks[j], userToks[j + 1]];
        if (
          (tokenMatch(u1, a) && tokenMatch(u2, b)) ||
          (tokenMatch(u1, b) && tokenMatch(u2, a))
        ) {
          score += 1.5;
          break;
        }
      }
    }
    // Bonus when the full Arabic dish name appears verbatim.
    if (normalized.includes(normalizeArabic(sig.entry.nameAr))) score += 5;
    return { entry: sig.entry, score, covered };
  })
    .filter((s) => s.covered.size > 0)
    .sort((a, b) => b.score - a.score);

  // Greedily accept foods that add newly-covered user tokens.
  const consumed = new Set<string>();
  const found: Detection[] = [];
  for (const s of scored) {
    const addsNew = [...s.covered].some((t) => !consumed.has(t));
    if (!addsNew) continue;
    s.covered.forEach((t) => consumed.add(t));
    const anchor = [...s.covered][0];
    found.push({ entry: s.entry, index: Math.max(0, normalized.indexOf(anchor)), anchor });
    if (consumed.size >= userToks.length) break;
  }
  return found.sort((a, b) => a.index - b.index);
}

// English count words → value.
const EN_NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5,
};

/** Resolve a token to a numeric quantity, if it is one. */
function tokenToNumber(tok: string): number | null {
  if (/^\d+(\.\d+)?$/.test(tok)) return parseFloat(tok);
  if (ARABIC_NUMBER_WORDS[tok] != null) return ARABIC_NUMBER_WORDS[tok];
  if (EN_NUMBER_WORDS[tok] != null) return EN_NUMBER_WORDS[tok];
  return null;
}

/**
 * Extract a quantity for a food. Grams/units are found in a tight character
 * window (locality); counts use token adjacency so "2 eggs and a banana"
 * gives the banana 1, not 2.
 */
function extractQuantity(
  text: string,
  tokens: string[],
  tokenIdx: number,
  foodIndex: number,
): { qty: number; grams?: number; explicit: boolean } {
  const isUnit = (tok?: string) => tok != null && UNIT_GRAMS[tok] != null;

  // Scan tokens nearest-first (±3). Prefer an explicit "<number> <unit>"
  // (grams); otherwise remember the nearest bare number as a count.
  let countCandidate: number | null = null;
  for (let d = 1; d <= 3; d++) {
    for (const idx of [tokenIdx - d, tokenIdx + d]) {
      const tok = tokens[idx];
      if (tok == null) continue;
      const num = tokenToNumber(tok);
      if (num != null) {
        // "<num> <unit>" on either side → grams.
        if (isUnit(tokens[idx + 1])) {
          return { qty: num, grams: num * UNIT_GRAMS[tokens[idx + 1]!], explicit: true };
        }
        if (isUnit(tokens[idx - 1])) {
          return { qty: num, grams: num * UNIT_GRAMS[tokens[idx - 1]!], explicit: true };
        }
        if (countCandidate == null) countCandidate = num;
      }
    }
    if (countCandidate != null) break; // nearest count wins
  }
  if (countCandidate != null) return { qty: countCandidate, explicit: true };

  // Bare unit token adjacent with no number, e.g. "كوب لبن".
  for (const idx of [tokenIdx - 1, tokenIdx + 1]) {
    const tok = tokens[idx];
    if (isUnit(tok) && UNIT_GRAMS[tok!] >= 15) {
      return { qty: 1, grams: UNIT_GRAMS[tok!], explicit: true };
    }
  }

  return { qty: 1, explicit: false };
}

function scaleMacros(base: Macros, factor: number): Macros {
  const r = (n: number) => Math.round(n * factor * 10) / 10;
  return {
    calories: Math.round(base.calories * factor),
    protein: r(base.protein),
    carbs: r(base.carbs),
    fat: r(base.fat),
    fiber: r(base.fiber),
    sugar: r(base.sugar),
    sodium: Math.round(base.sodium * factor),
  };
}

export function sumMacros(items: FoodItem[]): Macros {
  return items.reduce<Macros>((acc, it) => ({
    calories: acc.calories + it.macros.calories,
    protein: acc.protein + it.macros.protein,
    carbs: acc.carbs + it.macros.carbs,
    fat: acc.fat + it.macros.fat,
    fiber: acc.fiber + it.macros.fiber,
    sugar: acc.sugar + it.macros.sugar,
    sodium: acc.sodium + it.macros.sodium,
  }), { ...EMPTY_MACROS });
}

/** Build a FoodItem from a DB entry + parsed quantity. */
function buildItem(entry: FoodDbEntry, q: { qty: number; grams?: number }): FoodItem {
  let factor: number;
  let quantity: number;
  let unit: string | undefined;

  const isUnitFood = !!entry.servingLabel && !q.grams;
  if (q.grams) {
    factor = q.grams / entry.serving;
    quantity = q.grams;
    unit = 'جرام';
  } else if (isUnitFood) {
    // Count-based: "3 eggs" -> qty * serving grams.
    factor = q.qty;
    quantity = q.qty;
    unit = entry.servingLabel;
  } else {
    // Assume a standard serving of the reference size.
    factor = q.qty;
    quantity = q.qty * entry.serving;
    unit = 'جرام';
  }

  return {
    id: `${entry.id}-${Math.random().toString(36).slice(2, 8)}`,
    name: entry.name,
    nameAr: entry.nameAr,
    brand: entry.brand,
    quantity: Math.round(quantity),
    unit,
    emoji: entry.emoji,
    macros: scaleMacros(entry.macros, factor),
    perServing: entry.macros,
  };
}

const REMAINING_HINT = (m: Macros) => m;

/**
 * Parse a free-text meal description into structured food items.
 * Returns null-ish confidence 0 with empty items if nothing matched.
 */
export function parseMeal(rawInput: string, now = new Date()): AiParseResult {
  const western = toWesternDigits(rawInput);
  const normalized = normalizeArabic(western);
  const tokens = tokenize(normalized);
  const category = detectCategory(normalized, now);
  const detections = detectFoods(normalized);

  const items: FoodItem[] = detections.map((d) => {
    const tokenIdx = tokens.indexOf(d.anchor);
    const q = extractQuantity(normalized, tokens, tokenIdx, d.index);
    return buildItem(d.entry, q);
  });

  const totals = sumMacros(items);
  const isArabic = /[ء-ي]/.test(rawInput);

  if (items.length === 0) {
    return {
      reply: isArabic
        ? 'ما قدرت أتعرف على أكل واضح في رسالتك. جرب مثلاً: «أكلت ٣ بيضات» أو «غديت كبسة دجاج ٢٠٠ جرام» 🍽️'
        : "I couldn't detect a clear food. Try e.g. \"3 eggs\" or \"chicken kabsa 200g\" 🍽️",
      items: [],
      category,
      confidence: 0,
      totals: { ...EMPTY_MACROS },
    };
  }

  // Confidence: explicit quantities + strong name matches raise it.
  const anyExplicit = detections.some((d) =>
    extractQuantity(normalized, tokens, tokens.indexOf(d.anchor), d.index).explicit,
  );
  const hasVerb = CONSUME_VERBS.some((v) => normalized.includes(normalizeArabic(v)));
  let confidence = 0.72;
  if (anyExplicit) confidence += 0.15;
  if (hasVerb) confidence += 0.06;
  if (items.length === 1) confidence += 0.03;
  confidence = Math.min(0.98, confidence);

  const reply = composeReply(items, totals, category, confidence, isArabic);
  const coach = buildCoachNote(totals, isArabic);

  return {
    reply,
    items,
    category,
    confidence,
    totals,
    coach,
    suggestions: isArabic
      ? ['كم باقي لي اليوم؟', 'اقترح لي عشاء عالي بروتين', 'سجل كوب ماء']
      : ["What's left today?", 'Suggest a high-protein dinner', 'Log a glass of water'],
  };
}

const CATEGORY_LABEL_AR: Record<MealCategory, string> = {
  breakfast: 'فطور',
  lunch: 'غداء',
  dinner: 'عشاء',
  snack: 'سناك',
};
const CATEGORY_LABEL_EN: Record<MealCategory, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'a snack',
};

function composeReply(
  items: FoodItem[],
  totals: Macros,
  category: MealCategory,
  confidence: number,
  isArabic: boolean,
): string {
  const pct = Math.round(confidence * 100);
  if (isArabic) {
    const list = items
      .map((i) => `• ${i.emoji ?? ''} ${i.nameAr ?? i.name} — ${i.macros.calories} سعرة`)
      .join('\n');
    return `سجّلت لك ${CATEGORY_LABEL_AR[category]} ✅\n${list}\n\nالإجمالي: **${totals.calories} سعرة** · ${totals.protein}غ بروتين · ${totals.carbs}غ كارب · ${totals.fat}غ دهون\nنسبة الثقة: ${pct}٪`;
  }
  const list = items
    .map((i) => `• ${i.emoji ?? ''} ${i.name} — ${i.macros.calories} kcal`)
    .join('\n');
  return `Logged ${CATEGORY_LABEL_EN[category]} ✅\n${list}\n\nTotal: **${totals.calories} kcal** · ${totals.protein}g protein · ${totals.carbs}g carbs · ${totals.fat}g fat\nConfidence: ${pct}%`;
}

function buildCoachNote(totals: Macros, isArabic: boolean): string | undefined {
  const notes: string[] = [];
  if (totals.protein >= 35) {
    notes.push(isArabic ? 'بروتين ممتاز في هالوجبة 💪' : 'Great protein in this meal 💪');
  }
  if (totals.sodium >= 1000) {
    notes.push(isArabic ? 'الصوديوم مرتفع، خفف الملح وزد الماء 💧' : 'Sodium is high — ease the salt and add water 💧');
  }
  if (totals.sugar >= 30) {
    notes.push(isArabic ? 'السكر مرتفع شوي، انتبه للحلى 🍬' : 'Sugar is a bit high — watch the sweets 🍬');
  }
  return notes.length ? notes.join(' ') : undefined;
}

export { REMAINING_HINT };
