-- ============================================================
-- PART 1: สร้าง Tables + ข้อมูลเริ่มต้น
-- วางใน Supabase SQL Editor แล้วกด Run
-- ============================================================

-- 1. Config
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

-- 2. Courses
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  image TEXT DEFAULT '',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  cpd TEXT DEFAULT '',
  seats INTEGER DEFAULT 100,
  place TEXT DEFAULT '',
  fee INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  color TEXT DEFAULT '#2E8B57',
  form_url TEXT DEFAULT '',
  special_fee INTEGER,
  drive_folder_id TEXT DEFAULT '',
  payment_enabled BOOLEAN DEFAULT TRUE,
  manual_reg_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Registrants
CREATE TABLE registrants (
  id SERIAL PRIMARY KEY,
  pid TEXT NOT NULL,
  license_no TEXT DEFAULT '',
  prefix TEXT DEFAULT '',
  fname TEXT NOT NULL DEFAULT '',
  lname TEXT NOT NULL DEFAULT '',
  approve_date TEXT DEFAULT '',
  expire_date TEXT DEFAULT '',
  receipt_name TEXT DEFAULT '',
  receipt_addr TEXT DEFAULT '',
  delivery_addr TEXT DEFAULT '',
  course TEXT NOT NULL,
  pay_status TEXT DEFAULT 'รอชำระเงิน',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  line_id TEXT DEFAULT '',
  discount_type TEXT DEFAULT '',
  discount_note TEXT DEFAULT '',
  fee_due INTEGER DEFAULT 0,
  doc_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pid, course)
);

-- 4. Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  fullname TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL,
  transfer_date TEXT DEFAULT '',
  amount INTEGER DEFAULT 0,
  slip_filename TEXT DEFAULT '',
  slip_url TEXT DEFAULT '',
  status TEXT DEFAULT 'รอตรวจสอบ',
  review_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 6. Requests
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  pid TEXT NOT NULL,
  course TEXT NOT NULL,
  fullname TEXT DEFAULT '',
  fields TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'รอดำเนินการ',
  admin_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_registrants_pid ON registrants(pid);
CREATE INDEX idx_registrants_course ON registrants(course);
CREATE INDEX idx_payments_course ON payments(course);
CREATE INDEX idx_requests_status ON requests(status);

-- ข้อมูลเริ่มต้น Config
INSERT INTO config (key, value) VALUES
  ('heroSub', 'ศูนย์การศึกษาต่อเนื่องด้านสาธารณสุข'),
  ('heroTitle', 'CCPH บูรพา'),
  ('heroDesc', 'ศูนย์บริการวิชาการและฝึกอบรม คณะสาธารณสุขศาสตร์ มหาวิทยาลัยบูรพา'),
  ('s1v', '500+'), ('s1l', 'ผู้เข้าอบรม'),
  ('s2v', '50+'),  ('s2l', 'หลักสูตร'),
  ('s3v', '13.5'), ('s3l', 'คะแนน CPD'),
  ('s4v', '98%'),  ('s4l', 'ความพึงพอใจ'),
  ('bankName', 'ธนาคารกรุงไทย'),
  ('bankAccount', '386-1-00000-0'),
  ('bankHolder', 'มหาวิทยาลัยบูรพา (คณะสาธารณสุขศาสตร์)'),
  ('bankNote', 'โอนแล้วแนบสลิปในหน้าชำระเงิน'),
  ('addr', 'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยบูรพา 169 ถ.ลงหาดบางแสน ต.แสนสุข อ.เมือง จ.ชลบุรี 20131'),
  ('phone', '038-102-xxx'),
  ('contactEmail', 'ccph@buu.ac.th'),
  ('contactLine', 'https://line.me/ti/p/xxx'),
  ('lineUrl', 'https://line.me/ti/p/xxx'),
  ('registerEnabled', 'true'),
  ('stepsJson', ''),
  ('docFolderId', ''),
  ('announcement', '📢 เปิดรับสมัครหลักสูตรใหม่แล้ว!'),
  ('certSignatureUrl', ''),
  ('certSignerName', ''),
  ('certSignerTitle', '');

-- หลักสูตรตัวอย่าง
INSERT INTO courses (id, name, date, time, hours, cpd, seats, place, fee, color) VALUES
  ('CCPH-C1', 'การวิจัยทางสุขภาพฯ', '21-22 ก.ค. 2568', '08:30-16:30 น.', '14 ชั่วโมง', '13.5 คะแนน', 100, 'Online ผ่าน Zoom', 900, '#2E8B57');
