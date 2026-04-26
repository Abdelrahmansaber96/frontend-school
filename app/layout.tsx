import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'بصمة — منصة إدارة المدارس',
  description:
    'نظام متكامل لإدارة المدارس والتواصل بين الإدارة والمعلمين وأولياء الأمور. ابدأ الآن مجانًا.',
  keywords: ['إدارة مدارس', 'نظام تعليمي', 'بصمة', 'SaaS', 'حضور', 'سلوك'],
  openGraph: {
    title: 'بصمة — منصة إدارة المدارس',
    description:
      'نظام متكامل لإدارة المدارس والتواصل بين الإدارة والمعلمين وأولياء الأمور',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
