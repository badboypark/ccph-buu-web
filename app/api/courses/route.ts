import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { checkAuth } from '@/lib/auth';

// GET /api/courses — public (รายชื่อหลักสูตร + จำนวนผู้สมัคร)
export async function GET() {
  const db = getServiceSupabase();
  const { data: courses } = await db.from('courses').select('*').order('id');

  // นับจำนวนผู้สมัครแต่ละหลักสูตร
  const { data: stats } = await db
    .from('registrants')
    .select('course')
    .then(r => {
      const counts: Record<string, number> = {};
      (r.data || []).forEach((row: any) => {
        counts[row.course] = (counts[row.course] || 0) + 1;
      });
      return { data: counts };
    });

  return NextResponse.json({ courses: courses || [], stats: stats || {} });
}

// POST /api/courses — admin save all courses
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password, courses } = body;

  const user = await checkAuth(username, password);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const db = getServiceSupabase();

  // ลบหลักสูตรที่ไม่อยู่ใน list ใหม่
  const newIds = courses.map((c: any) => c.id);
  const { data: existing } = await db.from('courses').select('id');
  const oldIds = (existing || []).map((r: any) => r.id);
  const toDelete = oldIds.filter((id: string) => !newIds.includes(id));
  if (toDelete.length) {
    await db.from('courses').delete().in('id', toDelete);
  }

  // Upsert ทั้งหมด
  for (const c of courses) {
    await db.from('courses').upsert({
      id: c.id,
      name: c.name || '',
      image: c.image || '',
      date: c.date || '',
      time: c.time || '',
      hours: c.hours || '',
      cpd: c.cpd || '',
      seats: Number(c.seats) || 100,
      place: c.place || '',
      fee: Number(c.fee) || 0,
      status: c.status || 'open',
      color: c.color || '#2E8B57',
      form_url: c.formUrl || '',
      special_fee: c.specialFee !== '' && c.specialFee !== undefined ? Number(c.specialFee) : null,
      drive_folder_id: c.driveFolderId || '',
      payment_enabled: c.paymentEnabled !== false,
      manual_reg_count: Number(c.manualRegCount) || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  }

  return NextResponse.json({ success: true });
}
