import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CCPH-BUU | ศูนย์การศึกษาต่อเนื่องด้านสาธารณสุข',
  description: 'ศูนย์บริการวิชาการและฝึกอบรม คณะสาธารณสุขศาสตร์ มหาวิทยาลัยบูรพา',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
