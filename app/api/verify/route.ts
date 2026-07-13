import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pid = String(body.query || '').replace(/[^0-9]/g, '').trim();
  if (pid.length !== 13) return NextResponse.json({ found: false, data: [] });

  const db = getServiceSupabase();
  let query = db.from('registrants').select('*').eq('pid', pid);
  if (body.courseId) query = query.eq('course', body.courseId);

  const { data: regs } = await query;
  if (!regs || !regs.length) return NextResponse.json({ found: false, data: [] });

  // ดึงราคาหลักสูตร
  const { data: courses } = await db.from('courses').select('id, fee, special_fee');
  const courseMap: Record<string, any> = {};
  (courses || []).forEach((c: any) => { courseMap[c.id] = c; });

  const found = regs.map((r: any) => {
    const c = courseMap[r.course] || {};
    return {
      pid: r.pid,
      licenseNo: r.license_no,
      prefix: r.prefix,
      fname: r.fname,
      lname: r.lname,
      approveDate: r.approve_date,
      expireDate: r.expire_date,
      receiptName: r.receipt_name,
      deliveryAddr: r.delivery_addr,
      course: r.course,
      payStatus: r.pay_status,
      email: r.email,
      phone: r.phone,
      lineId: r.line_id,
      discountType: r.discount_type,
      feeDue: r.fee_due,
      fee: c.fee || 0,
      specialFee: c.special_fee,
    };
  });

  return NextResponse.json({ found: true, data: found });
}
