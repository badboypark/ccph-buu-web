import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/auth';

// GET /api/config — public
export async function GET() {
  const db = getServiceSupabase();
  const { data } = await db.from('config').select('key, value');
  const cfg: Record<string, string> = {};
  (data || []).forEach((r: any) => { cfg[r.key] = r.value; });
  return NextResponse.json(cfg);
}

// POST /api/config — admin only (save config)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password, updates } = body;

  const user = await checkAuth(username, password);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const db = getServiceSupabase();
  for (const [key, value] of Object.entries(updates)) {
    await db.from('config').upsert({ key, value: String(value) }, { onConflict: 'key' });
  }

  return NextResponse.json({ success: true });
}
