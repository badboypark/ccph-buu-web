-- ============================================================
-- PART 2: เปิด RLS + สร้าง Policies
-- รันหลังจาก Part 1 สำเร็จแล้ว
-- ============================================================

-- เปิด RLS
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Config: อ่านได้ทุกคน, เขียนผ่าน service key
CREATE POLICY "config_read" ON config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "config_write" ON config FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Courses: อ่านได้ทุกคน, เขียนผ่าน service key
CREATE POLICY "courses_read" ON courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "courses_write" ON courses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Registrants: เขียน/อ่านผ่าน service key
CREATE POLICY "registrants_all" ON registrants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "registrants_insert" ON registrants FOR INSERT TO anon WITH CHECK (true);

-- Payments: เขียน/อ่านผ่าน service key
CREATE POLICY "payments_all" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "payments_insert" ON payments FOR INSERT TO anon WITH CHECK (true);

-- Users: service key เท่านั้น
CREATE POLICY "users_all" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Requests: ส่งได้ทุกคน, อ่าน/แก้ผ่าน service key
CREATE POLICY "requests_all" ON requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "requests_insert" ON requests FOR INSERT TO anon WITH CHECK (true);
