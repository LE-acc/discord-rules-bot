import { NextResponse } from 'next/server';
import { aiAnalyzeImage } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  let image: string | undefined;
  try {
    ({ image } = await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  if (!image) return NextResponse.json({ error: 'no image' }, { status: 400 });

  const result = await aiAnalyzeImage(image);
  return NextResponse.json({ ...result, kind: 'meal' });
}
