# 🚀 CCPH-BUU Web — Setup Guide

## ขั้นตอนการ Deploy (ใช้เวลา ~30 นาที)

---

### Step 1: สร้าง Supabase Project (ฟรี)

1. ไปที่ https://supabase.com → **Start your project**
2. สมัครด้วย GitHub
3. กด **New Project** →
   - Organization: เลือก default
   - Name: `ccph-buu`
   - Database Password: จดไว้!
   - Region: **Singapore** (ใกล้ไทยสุด)
4. รอ 1-2 นาที project จะพร้อม

### Step 2: สร้าง Database Tables

1. ไปที่ **SQL Editor** (เมนูซ้าย)
2. กด **New query**
3. Copy เนื้อหาจากไฟล์ `supabase-schema.sql` วางลงไป
4. กด **Run** → จะสร้าง 6 tables + indexes + RLS policies

### Step 3: สร้าง Storage Bucket

1. ไปที่ **Storage** (เมนูซ้าย)
2. กด **New bucket**
   - Name: `uploads`
   - Public: ✅ เปิด
   - File size limit: 10MB
3. กด **Create**

### Step 4: จด API Keys

1. ไปที่ **Settings** → **API**
2. จดไว้ 3 ค่า:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon key**: `eyJhbGci...` (public)
   - **service_role key**: `eyJhbGci...` (secret!)

### Step 5: Deploy ขึ้น Vercel (ฟรี)

#### วิธี A: ผ่าน GitHub (แนะนำ)
1. สร้าง GitHub repo ใหม่ เช่น `ccph-buu-web`
2. Push โค้ดทั้งหมดขึ้น GitHub
3. ไปที่ https://vercel.com → **Import Project** → เลือก repo
4. ตั้ง **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...
   ```
5. กด **Deploy** → รอ 1-2 นาที
6. ได้ URL เช่น `ccph-buu.vercel.app`

#### วิธี B: ผ่าน Vercel CLI
```bash
npm i -g vercel
cd ccph-buu-web
vercel
# ตอบคำถาม → ตั้ง env vars → deploy
```

### Step 6: สร้าง Admin Users เริ่มต้น

เปิด browser ไปที่:
```
https://ccph-buu.vercel.app/api/seed
```

จะสร้าง users 3 คน:
- admin / admin1234 (superadmin)
- editor1 / editor1234 (editor)
- finance1 / finance1234 (finance)

**⚠️ อย่าลืมเปลี่ยนรหัสผ่านหลังจาก login ครั้งแรก!**

---

## 📁 โครงสร้างไฟล์

```
ccph-buu-web/
├── app/
│   ├── layout.tsx         ← HTML wrapper
│   ├── page.tsx           ← หน้าหลัก (render app.html)
│   └── api/
│       ├── config/        ← จัดการ Config
│       ├── courses/       ← จัดการหลักสูตร
│       ├── register/      ← ลงทะเบียน
│       ├── payment/       ← แจ้งชำระเงิน
│       ├── verify/        ← เช็คสถานะ
│       ├── admin/         ← Admin (login, registrants, payments, users)
│       ├── requests/      ← แจ้งแก้ไขข้อมูล
│       └── seed/          ← สร้าง admin เริ่มต้น
├── lib/
│   ├── supabase.ts        ← Supabase client
│   └── auth.ts            ← Authentication
├── public/
│   └── app.html           ← Frontend (จาก index.html + GAS shim)
├── supabase-schema.sql    ← SQL สร้าง tables
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.example
```

## 🔄 เทียบกับ GAS เดิม

| GAS | Vercel + Supabase |
|-----|-------------------|
| `google.script.run.apiXxx()` | ผ่าน GAS shim → `fetch('/api/xxx')` |
| Google Sheets | Supabase PostgreSQL |
| Google Drive (สลิป) | Supabase Storage |
| Users Sheet | users table + bcrypt |
| Deploy ทุกครั้งแก้ Code.gs | Auto deploy ผ่าน GitHub push |

## ⚡ ข้อดีที่ได้

- URL สั้น: `ccph-buu.vercel.app`
- โหลดเร็ว < 1 วินาที (ไม่มี GAS overhead)
- Database PostgreSQL (เร็วกว่า Sheets 10x)
- Storage ฟรี 1GB สำหรับสลิป
- Auth ปลอดภัยกว่า (bcrypt hash)
- Auto deploy เมื่อ push GitHub
- Free tier เพียงพอสำหรับใช้งานจริง
