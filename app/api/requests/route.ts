import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/auth';

// POST /api/requests — submit (public) or admin actions
export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getServiceSupabase();

  // ── Public: ส่งแจ้งแก้ไข ──
  if (body.action === 'submit') {
    const { error } = await db.from('requests').insert({
      pid: body.pid || '', course: body.course || '', fullname: body.fullname || '',
      fields: body.fields || '', message: body.message || '',
    });
    if (error) return NextResponse.json({ success: false, error: error.message });
    return NextResponse.json({ success: true });
  }

  // ── Admin: ดู/อัพเดตรายการ ──
  const user = await checkAuth(body.username, body.password);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  if (body.action === 'list') {
    const { data } = await db.from('requests').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ success: true, data });
  }

  if (body.action === 'update') {
    await db.from('requests').update({
      status: body.status, admin_note: body.adminNote || '',
    }).eq('id', body.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' });
}
