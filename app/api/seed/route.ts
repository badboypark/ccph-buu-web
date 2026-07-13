import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

// GET /api/seed — สร้าง admin users เริ่มต้น (เรียกครั้งเดียว)
export async function GET() {
  const db = getServiceSupabase();

  const users = [
    { username: 'admin', password: 'admin1234', role: 'superadmin', name: 'Admin', email: 'admin@buu.ac.th' },
    { username: 'editor1', password: 'editor1234', role: 'editor', name: 'Editor', email: 'editor@buu.ac.th' },
    { username: 'finance1', password: 'finance1234', role: 'finance', name: 'Finance', email: 'finance@buu.ac.th' },
  ];

  const results = [];
  for (const u of users) {
    const { data: existing } = await db.from('users').select('id').eq('username', u.username).maybeSingle();
    if (existing) {
      results.push(`${u.username}: already exists`);
      continue;
    }
    const hash = await hashPassword(u.password);
    await db.from('users').insert({
      username: u.username, password_hash: hash, role: u.role, name: u.name, email: u.email,
    });
    results.push(`${u.username}: created ✅`);
  }

  // สร้างหลักสูตรตัวอย่าง
  const { data: existingCourse } = await db.from('courses').select('id').eq('id', 'CCPH-C1').maybeSingle();
  if (!existingCourse) {
    await db.from('courses').insert({
      id: 'CCPH-C1', name: 'การวิจัยทางสุขภาพฯ', date: '21-22 ก.ค. 2568',
      time: '08:30-16:30 น.', hours: '14 ชั่วโมง', cpd: '13.5 คะแนน',
      seats: 100, place: 'Online ผ่าน Zoom', fee: 900, color: '#2E8B57',
    });
    results.push('CCPH-C1: created ✅');
  }

  return NextResponse.json({ success: true, results });
}
