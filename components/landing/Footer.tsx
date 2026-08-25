'use client';

import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';

const footerLinks = {
  المنصة: [
    { label: 'المميزات', href: '#features' },
    { label: 'الأسعار', href: '#pricing' },
    { label: 'كيف يعمل', href: '#how-it-works' },
  ],
  الشركة: [
    { label: 'عن بصمة', href: '#' },
    { label: 'تواصل معنا', href: '#' },
    { label: 'المدونة', href: '#' },
  ],
  قانوني: [
    { label: 'سياسة الخصوصية', href: '#' },
    { label: 'شروط الاستخدام', href: '#' },
    { label: 'اتفاقية الخدمة', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#071F24]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <BrandLogo variant="wordmark" size="sm" className="[&>span>span:first-child]:text-white [&>span>span:last-child]:text-emerald-100" />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-sm">
              منصة بصمة التعليمية — نظام إدارة مدرسي متكامل يربط بين الإدارة والمعلمين وأولياء
              الأمور في بيئة رقمية حديثة وآمنة.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 hover:text-emerald-300 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} بصمة. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              شروط الاستخدام
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
