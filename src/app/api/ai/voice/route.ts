import { NextResponse } from 'next/server';
import { aiTranscribe } from '@/lib/ai';
import { isOpenAiConfigured } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isOpenAiConfigured) {
    return NextResponse.json(
      { error: 'speech-to-text requires OPENAI_API_KEY', fallback: 'browser' },
      { status: 501 },
    );
  }
  try {
    const form = await req.formData();
    const file = form.get('audio');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'no audio file' }, { status: 400 });
    }
    const text = await aiTranscribe(file);
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[voice]', err);
    return NextResponse.json({ error: 'transcription failed' }, { status: 500 });
  }
}
