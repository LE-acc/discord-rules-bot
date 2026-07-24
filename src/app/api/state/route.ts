import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Local-first snapshot sync for authenticated users.
export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ authed: false, state: null });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authed: false, state: null });

  const { data } = await supabase
    .from('user_state')
    .select('state, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ authed: true, state: data?.state ?? null, updatedAt: data?.updated_at ?? null });
}

export async function PUT(req: Request) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ authed: false }, { status: 200 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authed: false }, { status: 401 });

  let state: unknown;
  try {
    ({ state } = await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_state')
    .upsert({ user_id: user.id, state, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
