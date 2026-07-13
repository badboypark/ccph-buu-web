import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getServiceSupabase();

  // ตรวจสอบซ้ำ (pid + course)
  const { data: dup } = await db
    .from('registrants')
    .select('id')
    .eq('pid', body.pid)
    .eq('course', body.course)
    .maybeSingle();

  if (dup) {
    return NextResponse.json({ success: false, error: 'คุณได้ลงทะเบียนหลักสูตรนี้ไปแล้ว' });
  }

  // หาค่าลงทะเบียน
  const { data: course } = await db.from('courses').select('fee, special_fee').eq('id', body.course).single();
  let feeDue = course?.fee || 0;
  if (body.discountType && course?.special_fee != null) {
    feeDue = course.special_fee;
  }

  // อัปโหลดไฟล์หลักฐานส่วนลด (ถ้ามี)
  let docUrl = '';
  if (body.docBase64 && body.docFileName) {
    const buffer = Buffer.from(body.docBase64, 'base64');
    const path = `discount/${Date.now()}_${body.docFileName}`;
    const { data: upload } = await db.storage.from('uploads').upload(path, buffer, {
      contentType: 'application/octet-stream', upsert: false,
    });
    if (upload) {
      const { data: pub } = db.storage.from('uploads').getPublicUrl(path);
      docUrl = pub?.publicUrl || '';
    }
  }

  // บันทึก
  const { error } = await db.from('registrants').insert({
    pid: body.pid,
    license_no: body.licenseNo || '',
    prefix: body.prefix || '',
    fname: body.fname || '',
    lname: body.lname || '',
    approve_date: body.approveDate || '',
    expire_date: body.expireDate || '',
    receipt_name: body.receiptName || '',
    receipt_addr: body.receiptAddr || '',
    delivery_addr: body.deliveryAddr || '',
    course: body.course,
    pay_status: 'รอชำระเงิน',
    email: body.email || '',
    phone: body.phone || '',
    line_id: body.lineId || '',
    discount_type: body.discountType || '',
    discount_note: body.discountNote || '',
    fee_due: feeDue,
    doc_url: docUrl,
  });

  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true, feeDue });
}
