'use client';

// หน้านี้จะ render ไฟล์ public/app.html ซึ่งคือ index.html เดิมที่แก้ API layer แล้ว
// ใช้ iframe approach เพื่อให้ย้ายจาก GAS ได้เร็วที่สุดโดยแก้โค้ดน้อยที่สุด

export default function Home() {
  return (
    <iframe
      src="/app.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
