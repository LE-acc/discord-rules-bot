import type { FoodDbEntry, Macros } from '@/types';

// Helper to build macros with sensible defaults.
function m(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber = 0,
  sugar = 0,
  sodium = 0,
): Macros {
  return { calories, protein, carbs, fat, fiber, sugar, sodium };
}

/**
 * Local food database. Macros are for the reference `serving` (grams unless a
 * `servingLabel` describes a unit). Used for search, favourites, recent, and
 * as the ground truth for the offline Saudi/Arabic meal parser.
 */
export const FOOD_DB: FoodDbEntry[] = [
  // ── Saudi & Gulf mains ────────────────────────────────────
  { id: 'kabsa-chicken', name: 'Chicken Kabsa', nameAr: 'كبسة دجاج', category: 'saudi', emoji: '🍛', serving: 300, servingLabel: 'صحن', macros: m(560, 30, 68, 18, 3, 4, 780), tags: ['رز', 'كبسة', 'دجاج', 'kabsa', 'rice'] },
  { id: 'kabsa-lamb', name: 'Lamb Kabsa', nameAr: 'كبسة لحم', category: 'saudi', emoji: '🍛', serving: 300, servingLabel: 'صحن', macros: m(640, 33, 66, 26, 3, 4, 820), tags: ['رز', 'كبسة', 'لحم', 'kabsa', 'meat'] },
  { id: 'mandi-chicken', name: 'Chicken Mandi', nameAr: 'مندي دجاج', category: 'saudi', emoji: '🍗', serving: 320, servingLabel: 'صحن', macros: m(590, 32, 70, 19, 3, 3, 760), tags: ['مندي', 'دجاج', 'رز', 'mandi'] },
  { id: 'madbi-chicken', name: 'Chicken Madbi', nameAr: 'مضبي دجاج', category: 'saudi', emoji: '🍗', serving: 320, servingLabel: 'صحن', macros: m(610, 34, 68, 22, 3, 3, 800), tags: ['مضبي', 'دجاج', 'رز', 'madbi', 'madhbi'] },
  { id: 'mathbi-half-chicken', name: 'Half Madbi Chicken with Rice', nameAr: 'نص دجاجة مضبي مع رز', category: 'saudi', emoji: '🍗', serving: 450, servingLabel: 'نص دجاجة', macros: m(880, 52, 92, 34, 4, 4, 1100), tags: ['مضبي', 'نص دجاجة', 'رز', 'madbi'] },
  { id: 'mofatah', name: 'Mofatah Lamb', nameAr: 'مفطح', category: 'saudi', emoji: '🍖', serving: 350, servingLabel: 'صحن', macros: m(720, 40, 60, 34, 3, 3, 900), tags: ['مفطح', 'لحم', 'رز'] },
  { id: 'jareesh', name: 'Jareesh', nameAr: 'جريش', category: 'saudi', emoji: '🥣', serving: 300, servingLabel: 'صحن', macros: m(360, 14, 52, 10, 6, 4, 620), tags: ['جريش', 'قمح'] },
  { id: 'qursan', name: 'Qursan', nameAr: 'قرصان', category: 'saudi', emoji: '🍲', serving: 350, servingLabel: 'صحن', macros: m(430, 20, 55, 14, 5, 6, 700), tags: ['قرصان', 'مرقوق'] },
  { id: 'marqoq', name: 'Marqoq', nameAr: 'مرقوق', category: 'saudi', emoji: '🍲', serving: 350, servingLabel: 'صحن', macros: m(410, 19, 54, 12, 5, 6, 680), tags: ['مرقوق'] },
  { id: 'hanith', name: 'Haneeth Lamb', nameAr: 'حنيذ', category: 'saudi', emoji: '🍖', serving: 320, servingLabel: 'صحن', macros: m(650, 38, 62, 28, 3, 3, 850), tags: ['حنيذ', 'لحم', 'رز'] },
  { id: 'saleeg', name: 'Saleeg', nameAr: 'سليق', category: 'saudi', emoji: '🍚', serving: 320, servingLabel: 'صحن', macros: m(480, 26, 62, 14, 2, 5, 640), tags: ['سليق', 'رز', 'دجاج'] },
  { id: 'harees', name: 'Harees', nameAr: 'هريس', category: 'gulf', emoji: '🥣', serving: 300, servingLabel: 'صحن', macros: m(340, 18, 44, 10, 4, 2, 520), tags: ['هريس', 'قمح', 'لحم'] },
  { id: 'thareed', name: 'Thareed', nameAr: 'ثريد', category: 'gulf', emoji: '🍲', serving: 350, servingLabel: 'صحن', macros: m(400, 20, 46, 14, 6, 7, 720), tags: ['ثريد', 'خبز', 'مرق'] },
  { id: 'margoog', name: 'Maraq Lahm', nameAr: 'مرق لحم', category: 'gulf', emoji: '🍲', serving: 300, servingLabel: 'صحن', macros: m(280, 22, 14, 15, 3, 5, 760), tags: ['مرق', 'لحم', 'خضار'] },
  { id: 'masoub', name: 'Masoub', nameAr: 'معصوب', category: 'saudi', emoji: '🍌', serving: 250, servingLabel: 'صحن', macros: m(520, 8, 78, 20, 5, 40, 180), tags: ['معصوب', 'موز', 'حلى'] },
  { id: 'mutabbaq', name: 'Mutabbaq', nameAr: 'مطبق', category: 'saudi', emoji: '🫓', serving: 180, servingLabel: 'حبة', macros: m(420, 16, 34, 24, 2, 4, 560), tags: ['مطبق', 'لحم'] },
  { id: 'sambosa', name: 'Samosa', nameAr: 'سمبوسة', category: 'saudi', emoji: '🥟', serving: 40, servingLabel: 'حبة', macros: m(120, 4, 12, 6, 1, 1, 180), tags: ['سمبوسة', 'رمضان'] },
  { id: 'foul', name: 'Foul Medames', nameAr: 'فول', category: 'saudi', emoji: '🫘', serving: 250, servingLabel: 'صحن', macros: m(280, 16, 38, 8, 11, 3, 480), tags: ['فول', 'فطور'] },
  { id: 'tameez', name: 'Tamees Bread', nameAr: 'تميس', category: 'saudi', emoji: '🫓', serving: 120, servingLabel: 'رغيف', macros: m(320, 10, 60, 4, 3, 2, 480), tags: ['تميس', 'خبز', 'فطور'] },
  { id: 'shakshuka', name: 'Shakshuka', nameAr: 'شكشوكة', category: 'saudi', emoji: '🍳', serving: 250, servingLabel: 'صحن', macros: m(240, 13, 12, 15, 3, 7, 620), tags: ['شكشوكة', 'بيض', 'فطور'] },

  // ── Proteins ──────────────────────────────────────────────
  { id: 'egg', name: 'Egg', nameAr: 'بيض', category: 'protein', emoji: '🥚', serving: 50, servingLabel: 'بيضة', macros: m(72, 6.3, 0.4, 5, 0, 0.2, 71), tags: ['بيض', 'بيضة', 'egg'] },
  { id: 'chicken-breast', name: 'Grilled Chicken Breast', nameAr: 'صدر دجاج مشوي', category: 'protein', emoji: '🍗', serving: 100, macros: m(165, 31, 0, 3.6, 0, 0, 74), tags: ['دجاج', 'صدر', 'chicken', 'breast'] },
  { id: 'chicken-whole', name: 'Grilled Chicken', nameAr: 'دجاج مشوي', category: 'protein', emoji: '🍗', serving: 100, macros: m(215, 27, 0, 12, 0, 0, 90), tags: ['دجاج', 'chicken', 'مشوي'] },
  { id: 'beef', name: 'Grilled Beef', nameAr: 'لحم بقري مشوي', category: 'protein', emoji: '🥩', serving: 100, macros: m(250, 26, 0, 15, 0, 0, 72), tags: ['لحم', 'beef', 'بقر'] },
  { id: 'lamb', name: 'Grilled Lamb', nameAr: 'لحم غنم', category: 'protein', emoji: '🍖', serving: 100, macros: m(294, 25, 0, 21, 0, 0, 72), tags: ['لحم', 'غنم', 'lamb'] },
  { id: 'fish', name: 'Grilled Fish', nameAr: 'سمك مشوي', category: 'protein', emoji: '🐟', serving: 100, macros: m(160, 22, 0, 7, 0, 0, 90), tags: ['سمك', 'fish'] },
  { id: 'shrimp', name: 'Shrimp', nameAr: 'روبيان', category: 'protein', emoji: '🦐', serving: 100, macros: m(99, 24, 0.2, 0.3, 0, 0, 111), tags: ['روبيان', 'قريدس', 'shrimp'] },
  { id: 'tuna', name: 'Canned Tuna', nameAr: 'تونة', category: 'protein', emoji: '🐟', serving: 100, macros: m(116, 26, 0, 1, 0, 0, 320), tags: ['تونة', 'tuna'] },
  { id: 'whey', name: 'Whey Protein Scoop', nameAr: 'بروتين واي', category: 'protein', emoji: '🥤', serving: 30, servingLabel: 'مكيال', macros: m(120, 24, 3, 1.5, 0, 2, 60), tags: ['بروتين', 'whey', 'protein', 'واي'] },

  // ── Carbs & staples ───────────────────────────────────────
  { id: 'white-rice', name: 'White Rice (cooked)', nameAr: 'رز أبيض', category: 'carb', emoji: '🍚', serving: 100, macros: m(130, 2.7, 28, 0.3, 0.4, 0.1, 1), tags: ['رز', 'rice', 'أرز'] },
  { id: 'kabsa-rice', name: 'Kabsa Rice', nameAr: 'رز كبسة', category: 'carb', emoji: '🍚', serving: 100, macros: m(190, 3.5, 30, 6.5, 1, 1.5, 320), tags: ['رز', 'كبسة', 'rice'] },
  { id: 'bread-arabic', name: 'Arabic Bread', nameAr: 'خبز عربي', category: 'carb', emoji: '🫓', serving: 60, servingLabel: 'رغيف', macros: m(165, 5.5, 33, 1, 1.5, 0.8, 320), tags: ['خبز', 'bread', 'صمون'] },
  { id: 'pasta', name: 'Pasta (cooked)', nameAr: 'معكرونة', category: 'carb', emoji: '🍝', serving: 100, macros: m(157, 5.8, 31, 0.9, 1.8, 0.6, 5), tags: ['معكرونة', 'باستا', 'pasta'] },
  { id: 'fries', name: 'French Fries', nameAr: 'بطاطس مقلية', category: 'carb', emoji: '🍟', serving: 100, macros: m(312, 3.4, 41, 15, 3.8, 0.3, 210), tags: ['بطاطس', 'fries', 'مقلية'] },
  { id: 'oats', name: 'Oats', nameAr: 'شوفان', category: 'carb', emoji: '🥣', serving: 40, servingLabel: 'كوب جاف', macros: m(150, 5, 27, 2.5, 4, 0.5, 2), tags: ['شوفان', 'oats'] },
  { id: 'potato', name: 'Potato', nameAr: 'بطاطس', category: 'carb', emoji: '🥔', serving: 150, servingLabel: 'حبة', macros: m(116, 3, 26, 0.2, 3, 1.2, 8), tags: ['بطاطس', 'potato'] },

  // ── Fruits & veg ──────────────────────────────────────────
  { id: 'banana', name: 'Banana', nameAr: 'موز', category: 'fruit', emoji: '🍌', serving: 120, servingLabel: 'حبة', macros: m(105, 1.3, 27, 0.4, 3.1, 14, 1), tags: ['موز', 'banana'] },
  { id: 'apple', name: 'Apple', nameAr: 'تفاح', category: 'fruit', emoji: '🍎', serving: 180, servingLabel: 'حبة', macros: m(95, 0.5, 25, 0.3, 4.4, 19, 2), tags: ['تفاح', 'apple'] },
  { id: 'dates', name: 'Dates', nameAr: 'تمر', category: 'fruit', emoji: '🌴', serving: 24, servingLabel: '3 حبات', macros: m(66, 0.4, 18, 0, 1.6, 16, 0), tags: ['تمر', 'dates', 'رطب'] },
  { id: 'salad', name: 'Mixed Salad', nameAr: 'سلطة', category: 'veg', emoji: '🥗', serving: 150, servingLabel: 'صحن', macros: m(70, 2, 8, 3.5, 3, 4, 180), tags: ['سلطة', 'salad', 'خضار'] },
  { id: 'avocado', name: 'Avocado', nameAr: 'أفوكادو', category: 'fruit', emoji: '🥑', serving: 100, macros: m(160, 2, 9, 15, 7, 0.7, 7), tags: ['أفوكادو', 'avocado'] },

  // ── Dairy & drinks ────────────────────────────────────────
  { id: 'laban', name: 'Laban', nameAr: 'لبن', category: 'dairy', emoji: '🥛', serving: 250, servingLabel: 'كوب', macros: m(110, 8, 12, 2.5, 0, 12, 130), tags: ['لبن', 'laban'] },
  { id: 'greek-yogurt', name: 'Greek Yogurt', nameAr: 'زبادي يوناني', category: 'dairy', emoji: '🥛', serving: 170, servingLabel: 'علبة', macros: m(100, 17, 6, 0.7, 0, 4, 65), tags: ['زبادي', 'yogurt', 'يوناني'] },
  { id: 'milk', name: 'Milk', nameAr: 'حليب', category: 'dairy', emoji: '🥛', serving: 250, servingLabel: 'كوب', macros: m(150, 8, 12, 8, 0, 12, 105), tags: ['حليب', 'milk'] },
  { id: 'cheese', name: 'Cheese', nameAr: 'جبن', category: 'dairy', emoji: '🧀', serving: 30, servingLabel: 'شريحة', macros: m(110, 7, 1, 9, 0, 0.5, 180), tags: ['جبن', 'cheese'] },
  { id: 'karak', name: 'Karak Tea', nameAr: 'شاي كرك', category: 'drink', emoji: '☕', serving: 150, servingLabel: 'كوب', macros: m(120, 3, 18, 4, 0, 17, 60), tags: ['كرك', 'شاي', 'karak'] },
  { id: 'cola', name: 'Cola', nameAr: 'كولا', category: 'drink', emoji: '🥤', serving: 330, servingLabel: 'علبة', macros: m(139, 0, 35, 0, 0, 35, 15), tags: ['كولا', 'بيبسي', 'cola', 'pepsi'] },

  // ── Fast food & restaurants ───────────────────────────────
  { id: 'albaik-4pc', name: 'AlBaik Broasted 4pc', nameAr: 'بروست البيك ٤ قطع', brand: 'AlBaik', category: 'restaurant', emoji: '🍗', serving: 320, servingLabel: 'وجبة', macros: m(760, 46, 44, 44, 3, 1, 1400), tags: ['البيك', 'albaik', 'بروست', 'دجاج'] },
  { id: 'albaik-nuggets', name: 'AlBaik Nuggets', nameAr: 'ناجتس البيك', brand: 'AlBaik', category: 'restaurant', emoji: '🍗', serving: 150, servingLabel: 'علبة', macros: m(420, 24, 26, 24, 2, 1, 820), tags: ['البيك', 'albaik', 'ناجتس'] },
  { id: 'albaik-shrimp', name: 'AlBaik Broasted Shrimp', nameAr: 'روبيان البيك', brand: 'AlBaik', category: 'restaurant', emoji: '🍤', serving: 200, servingLabel: 'وجبة', macros: m(560, 28, 40, 30, 2, 1, 1100), tags: ['البيك', 'albaik', 'روبيان'] },
  { id: 'mcd-bigmac', name: 'Big Mac', nameAr: 'بيج ماك', brand: "McDonald's", category: 'restaurant', emoji: '🍔', serving: 219, servingLabel: 'ساندويتش', macros: m(563, 26, 45, 33, 3, 9, 1010), tags: ['ماكدونالدز', 'mcdonalds', 'بيج ماك', 'bigmac'] },
  { id: 'mcd-mcchicken', name: 'McChicken', nameAr: 'ماك تشيكن', brand: "McDonald's", category: 'restaurant', emoji: '🍔', serving: 143, servingLabel: 'ساندويتش', macros: m(400, 14, 39, 21, 2, 5, 560), tags: ['ماكدونالدز', 'mcchicken'] },
  { id: 'kfc-zinger', name: 'Zinger Sandwich', nameAr: 'زنجر', brand: 'KFC', category: 'restaurant', emoji: '🍔', serving: 200, servingLabel: 'ساندويتش', macros: m(450, 25, 42, 21, 3, 5, 990), tags: ['كنتاكي', 'kfc', 'زنجر', 'zinger'] },
  { id: 'kfc-piece', name: 'KFC Chicken Piece', nameAr: 'قطعة دجاج كنتاكي', brand: 'KFC', category: 'restaurant', emoji: '🍗', serving: 120, servingLabel: 'قطعة', macros: m(320, 20, 11, 22, 0, 0, 900), tags: ['كنتاكي', 'kfc', 'دجاج'] },
  { id: 'herfy-super', name: 'Herfy Super Burger', nameAr: 'سوبر برجر هرفي', brand: 'Herfy', category: 'restaurant', emoji: '🍔', serving: 240, servingLabel: 'ساندويتش', macros: m(610, 29, 46, 34, 3, 8, 1050), tags: ['هرفي', 'herfy', 'برجر'] },
  { id: 'shawarmer-chicken', name: 'Chicken Shawarma', nameAr: 'شاورما دجاج', brand: 'Shawarmer', category: 'restaurant', emoji: '🌯', serving: 220, servingLabel: 'ساندويتش', macros: m(480, 26, 45, 22, 3, 4, 900), tags: ['شاورما', 'shawarma', 'شاورمر', 'دجاج'] },
  { id: 'shawarmer-meat', name: 'Meat Shawarma', nameAr: 'شاورما لحم', brand: 'Shawarmer', category: 'restaurant', emoji: '🌯', serving: 220, servingLabel: 'ساندويتش', macros: m(520, 27, 44, 26, 3, 4, 960), tags: ['شاورما', 'shawarma', 'لحم'] },
  { id: 'buffalo-classic', name: 'Buffalo Classic Burger', nameAr: 'برجر كلاسيك', brand: 'Buffalo Burger', category: 'restaurant', emoji: '🍔', serving: 250, servingLabel: 'ساندويتش', macros: m(640, 30, 44, 38, 3, 8, 1000), tags: ['بفلو', 'buffalo', 'برجر'] },
  { id: 'subway-sub', name: 'Subway 6" Sub', nameAr: 'ساندويتش صب واي', brand: 'Subway', category: 'restaurant', emoji: '🥖', serving: 230, servingLabel: 'ساندويتش', macros: m(380, 20, 46, 12, 4, 7, 780), tags: ['صب واي', 'subway'] },
  { id: 'pizzahut-slice', name: 'Pizza Hut Slice', nameAr: 'شريحة بيتزا هت', brand: 'Pizza Hut', category: 'restaurant', emoji: '🍕', serving: 110, servingLabel: 'شريحة', macros: m(280, 12, 30, 12, 2, 4, 640), tags: ['بيتزا', 'pizza', 'هت', 'hut'] },
  { id: 'dominos-slice', name: "Domino's Slice", nameAr: 'شريحة دومينوز', brand: "Domino's", category: 'restaurant', emoji: '🍕', serving: 110, servingLabel: 'شريحة', macros: m(290, 12, 32, 12, 2, 4, 660), tags: ['بيتزا', 'pizza', 'دومينوز', 'dominos'] },
  { id: 'hardees-thickburger', name: 'Hardee’s Thickburger', nameAr: 'ثيك برجر هارديز', brand: "Hardee's", category: 'restaurant', emoji: '🍔', serving: 280, servingLabel: 'ساندويتش', macros: m(700, 33, 47, 42, 3, 9, 1300), tags: ['هارديز', 'hardees', 'برجر'] },
  { id: 'texas-chicken', name: 'Texas Chicken Piece', nameAr: 'قطعة تكساس', brand: 'Texas Chicken', category: 'restaurant', emoji: '🍗', serving: 130, servingLabel: 'قطعة', macros: m(340, 21, 13, 23, 0, 0, 920), tags: ['تكساس', 'texas', 'دجاج'] },
  { id: 'bk-whopper', name: 'Whopper', nameAr: 'وابر', brand: 'Burger King', category: 'restaurant', emoji: '🍔', serving: 270, servingLabel: 'ساندويتش', macros: m(657, 28, 49, 40, 2, 11, 980), tags: ['برجر كنج', 'burger king', 'وابر', 'whopper'] },
];

/** Restaurants featured on the food/restaurant browse screen. */
export const RESTAURANTS = [
  { id: 'albaik', name: 'AlBaik', nameAr: 'البيك', emoji: '🍗', color: '#e11d48' },
  { id: 'mcdonalds', name: "McDonald's", nameAr: 'ماكدونالدز', emoji: '🍟', color: '#f59e0b' },
  { id: 'kfc', name: 'KFC', nameAr: 'كنتاكي', emoji: '🍗', color: '#dc2626' },
  { id: 'herfy', name: 'Herfy', nameAr: 'هرفي', emoji: '🍔', color: '#ea580c' },
  { id: 'shawarmer', name: 'Shawarmer', nameAr: 'شاورمر', emoji: '🌯', color: '#16a34a' },
  { id: 'buffalo', name: 'Buffalo Burger', nameAr: 'بفلو برجر', emoji: '🍔', color: '#7c3aed' },
  { id: 'subway', name: 'Subway', nameAr: 'صب واي', emoji: '🥖', color: '#059669' },
  { id: 'pizzahut', name: 'Pizza Hut', nameAr: 'بيتزا هت', emoji: '🍕', color: '#dc2626' },
  { id: 'dominos', name: "Domino's", nameAr: 'دومينوز', emoji: '🍕', color: '#2563eb' },
  { id: 'hardees', name: "Hardee's", nameAr: 'هارديز', emoji: '🍔', color: '#f97316' },
  { id: 'texas', name: 'Texas Chicken', nameAr: 'تكساس تشيكن', emoji: '🍗', color: '#b91c1c' },
  { id: 'burgerking', name: 'Burger King', nameAr: 'برجر كنج', emoji: '🍔', color: '#c2410c' },
];

/** Simple normaliser: strip Arabic diacritics, unify alef/hamza, lowercase. */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ٰٟ]/g, '') // tashkeel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

/** Search the local DB by name (Ar/En), brand, or tags. */
export function searchFoods(query: string, limit = 20): FoodDbEntry[] {
  const q = normalizeArabic(query);
  if (!q) return FOOD_DB.slice(0, limit);
  const scored = FOOD_DB.map((f) => {
    const haystack = normalizeArabic(
      [f.name, f.nameAr, f.brand ?? '', ...f.tags].join(' '),
    );
    let score = 0;
    if (haystack.includes(q)) score += 5;
    for (const term of q.split(' ')) {
      if (term && haystack.includes(term)) score += 2;
    }
    return { f, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.f);
}

export function getFoodById(id: string): FoodDbEntry | undefined {
  return FOOD_DB.find((f) => f.id === id);
}
