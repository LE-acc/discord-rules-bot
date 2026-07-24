import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { uid } from '@/lib/utils';
import type { FoodItem, Macros } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Open Food Facts is free and keyless. Barcode → nutrition per 100g.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'no barcode' }, { status: 400 });

  try {
    const res = await fetch(
      `${config.openFoodFactsBase}/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_ar,brands,nutriments,image_front_small_url`,
      { headers: { 'User-Agent': 'NutriAI/1.0 (nutrition tracker)' }, next: { revalidate: 86400 } },
    );
    const json = await res.json();
    if (json.status !== 1 || !json.product) {
      return NextResponse.json({ found: false, code }, { status: 404 });
    }
    const p = json.product;
    const n = p.nutriments ?? {};
    const per100: Macros = {
      calories: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
      protein: round(n.proteins_100g),
      carbs: round(n.carbohydrates_100g),
      fat: round(n.fat_100g),
      fiber: round(n.fiber_100g),
      sugar: round(n.sugars_100g),
      sodium: Math.round((n.sodium_100g ?? 0) * 1000),
    };
    const item: FoodItem = {
      id: uid('bar-'),
      name: p.product_name || 'Scanned product',
      nameAr: p.product_name_ar || p.product_name,
      brand: p.brands,
      quantity: 100,
      unit: 'جرام',
      emoji: '📦',
      macros: per100,
      perServing: per100,
    };
    return NextResponse.json({ found: true, code, item, image: p.image_front_small_url });
  } catch (err) {
    console.error('[barcode]', err);
    return NextResponse.json({ error: 'lookup failed', code }, { status: 500 });
  }
}

function round(n: unknown): number {
  const v = typeof n === 'number' ? n : parseFloat(String(n ?? 0));
  return Math.round((isNaN(v) ? 0 : v) * 10) / 10;
}
