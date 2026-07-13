import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { checkAuth, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, username, password } = body;

  // ── LOGIN ──
  if (action === 'login') {
    const user = await checkAuth(username, password);
    if (!user) return NextResponse.json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    return NextResponse.json({ success: true, user });
  }

  // ── Auth required for all other actions ──
  const user = await checkAuth(username, password);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const db = getServiceSupabase();

  // ── GET REGISTRANTS ──
  if (action === 'getRegistrants') {
    const { data } = await db.from('registrants').select('*').order('created_at', { ascending: false });
    const mapped = (data || []).map((r: any) => ({
      pid: r.pid, licenseNo: r.license_no, prefix: r.prefix, fname: r.fname, lname: r.lname,
      approveDate: r.approve_date, expireDate: r.expire_date,
      receiptName: r.receipt_name, receiptAddr: r.receipt_addr, deliveryAddr: r.delivery_addr,
      course: r.course, payStatus: r.pay_status, email: r.email, phone: r.phone,
      lineId: r.line_id, discountType: r.discount_type, discountNote: r.discount_note,
      feeDue: r.fee_due, docUrl: r.doc_url, id: r.id,
    }));
    return NextResponse.json({ success: true, data: mapped });
  }

  // ── SAVE REGISTRANT ──
  if (action === 'saveRegistrant') {
    const r = body.registrant;
    if (r.id) {
      await db.from('registrants').update({
        pid: r.pid, license_no: r.licenseNo, prefix: r.prefix, fname: r.fname, lname: r.lname,
        approve_date: r.approveDate, expire_date: r.expireDate,
        receipt_name: r.receiptName, receipt_addr: r.receiptAddr, delivery_addr: r.deliveryAddr,
        course: r.course, pay_status: r.payStatus, email: r.email, phone: r.phone,
        line_id: r.lineId, discount_type: r.discountType, discount_note: r.discountNote, fee_due: r.feeDue,
      }).eq('id', r.id);
    } else {
      await db.from('registrants').insert({
        pid: r.pid, license_no: r.licenseNo, prefix: r.prefix, fname: r.fname, lname: r.lname,
        approve_date: r.approveDate, expire_date: r.expireDate,
        receipt_name: r.receiptName, receipt_addr: r.receiptAddr, delivery_addr: r.deliveryAddr,
        course: r.course, pay_status: r.payStatus || 'รอชำระเงิน', email: r.email, phone: r.phone,
        line_id: r.lineId, discount_type: r.discountType, discount_note: r.discountNote, fee_due: r.feeDue,
      });
    }
    return NextResponse.json({ success: true });
  }

  // ── DELETE REGISTRANT ──
  if (action === 'deleteRegistrant') {
    await db.from('registrants').delete().eq('id', body.id);
    return NextResponse.json({ success: true });
  }

  // ── GET PAYMENTS ──
  if (action === 'getPayments') {
    const { data } = await db.from('payments').select('*').order('created_at', { ascending: false });
    const mapped = (data || []).map((r: any) => ({
      id: r.id, timestamp: r.created_at, fullname: r.fullname, course: r.course,
      transferDate: r.transfer_date, amount: r.amount, slipUrl: r.slip_url,
      status: r.status, reviewNote: r.review_note,
    }));
    return NextResponse.json({ success: true, data: mapped });
  }

  // ── UPDATE PAYMENT STATUS ──
  if (action === 'updatePayment') {
    const { paymentId, status } = body;
    await db.from('payments').update({ status, review_note: body.reviewNote || '' }).eq('id', paymentId);

    // Sync to registrant (exact match)
    const { data: pay } = await db.from('payments').select('fullname, course').eq('id', paymentId).single();
    if (pay) {
      const { data: regs } = await db.from('registrants').select('id, prefix, fname, lname').eq('course', pay.course);
      const pName = (pay.fullname || '').trim();
      for (const r of (regs || [])) {
        const f1 = `${r.prefix}${r.fname} ${r.lname}`.trim();
        const f2 = `${r.fname} ${r.lname}`.trim();
        if (pName === f1 || pName === f2 || (r.fname && r.lname && pName.includes(r.fname) && pName.includes(r.lname))) {
          await db.from('registrants').update({ pay_status: status }).eq('id', r.id);
          break;
        }
      }
    }
    return NextResponse.json({ success: true });
  }

  // ── FINANCE REVIEW ──
  if (action === 'financeReview') {
    const { data: payments } = await db.from('payments').select('*').order('created_at', { ascending: false });
    const { data: regs } = await db.from('registrants').select('*');

    const result = (payments || []).map((p: any) => {
      const pName = (p.fullname || '').trim();
      let matchReg: any = null;

      // Pass 1: exact match
      for (const r of (regs || [])) {
        if (r.course !== p.course) continue;
        const f1 = `${r.prefix}${r.fname} ${r.lname}`.trim();
        const f2 = `${r.fname} ${r.lname}`.trim();
        if (pName === f1 || pName === f2) { matchReg = r; break; }
      }
      // Pass 2: fname+lname both present
      if (!matchReg) {
        for (const r of (regs || [])) {
          if (r.course !== p.course) continue;
          if (r.fname && r.lname && pName.includes(r.fname) && pName.includes(r.lname)) { matchReg = r; break; }
        }
      }

      return {
        id: p.id, timestamp: p.created_at, fullname: p.fullname, course: p.course,
        transferDate: p.transfer_date, amount: p.amount, slipUrl: p.slip_url,
        status: p.status, reviewNote: p.review_note,
        reg: matchReg ? {
          pid: matchReg.pid, licenseNo: matchReg.license_no, fname: matchReg.fname, lname: matchReg.lname,
          receiptName: matchReg.receipt_name, deliveryAddr: matchReg.delivery_addr,
          phone: matchReg.phone, email: matchReg.email, lineId: matchReg.line_id,
          discountType: matchReg.discount_type, payStatus: matchReg.pay_status,
        } : null,
      };
    });
    return NextResponse.json({ success: true, data: result });
  }

  // ── GET USERS ──
  if (action === 'getUsers') {
    if (user.role !== 'superadmin') return NextResponse.json({ success: false, error: 'superadmin เท่านั้น' });
    const { data } = await db.from('users').select('id, username, role, name, email, active, created_at, last_login').order('id');
    return NextResponse.json({ success: true, data });
  }

  // ── SAVE USER ──
  if (action === 'saveUser') {
    if (user.role !== 'superadmin') return NextResponse.json({ success: false, error: 'superadmin เท่านั้น' });
    const u = body.userData;
    if (u.id) {
      const updates: any = { name: u.name, email: u.email, role: u.role, active: u.active };
      if (u.password) updates.password_hash = await hashPassword(u.password);
      await db.from('users').update(updates).eq('id', u.id);
    } else {
      await db.from('users').insert({
        username: u.username, password_hash: await hashPassword(u.password || 'changeme'),
        role: u.role, name: u.name, email: u.email,
      });
    }
    return NextResponse.json({ success: true });
  }

  // ── CHANGE OWN PASSWORD ──
  if (action === 'changePassword') {
    const hash = await hashPassword(body.newPassword);
    await db.from('users').update({ password_hash: hash }).eq('username', username);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' });
}
