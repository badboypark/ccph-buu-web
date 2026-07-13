import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getServiceSupabase();

  // อัปโหลดสลิป
  let slipUrl = '';
  if (body.slipBase64 && body.slipFileName) {
    const buffer = Buffer.from(body.slipBase64, 'base64');
    const path = `slips/${Date.now()}_${body.slipFileName}`;
    const { data: upload } = await db.storage.from('uploads').upload(path, buffer, {
      contentType: 'image/jpeg', upsert: false,
    });
    if (upload) {
      const { data: pub } = db.storage.from('uploads').getPublicUrl(path);
      slipUrl = pub?.publicUrl || '';
    }
  }

  // บันทึก payment
  const { error } = await db.from('payments').insert({
    fullname: body.fullname || '',
    course: body.course || '',
    transfer_date: body.transferDate || '',
    amount: parseInt(body.amount) || 0,
    slip_filename: body.slipFileName || '',
    slip_url: slipUrl,
    status: 'รอตรวจสอบ',
  });

  if (error) return NextResponse.json({ success: false, error: error.message });

  // Sync payStatus → Registrants (exact match)
  const pName = (body.fullname || '').trim();
  if (pName && body.course) {
    const { data: regs } = await db
      .from('registrants')
      .select('id, prefix, fname, lname')
      .eq('course', body.course);

    for (const r of (regs || [])) {
      const full1 = `${r.prefix}${r.fname} ${r.lname}`.trim();
      const full2 = `${r.fname} ${r.lname}`.trim();
      if (pName === full1 || pName === full2 ||
          (r.fname && r.lname && pName.includes(r.fname) && pName.includes(r.lname))) {
        await db.from('registrants').update({ pay_status: 'รอตรวจสอบ' }).eq('id', r.id);
        break;
      }
    }
  }

  return NextResponse.json({ success: true, slipUrl });
}
