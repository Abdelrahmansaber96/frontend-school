'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

const links = [
  { label: 'المميزات', href: '#features' },
  { label: 'كيف يعمل', href: '#how-it-works' },
  { label: 'الأدوار', href: '#roles' },
  { label: 'الأسعار', href: '#pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#0B5D4B]/10 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#071F24]/90">
      <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo variant="wordmark" size="sm" className="dark:[&>span>span:first-child]:text-white dark:[&>span>span:last-child]:text-emerald-100" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#123B5D]/70 transition-colors duration-200 hover:text-[#0B5D4B] dark:text-white/65 dark:hover:text-emerald-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-[#123B5D] transition-colors hover:text-[#0B5D4B] dark:text-white/80 dark:hover:text-white"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-gradient-to-r from-brand-700 to-brand-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
          >
            سجّل مدرستك
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-[#123B5D] hover:bg-[#E9F4EF] dark:text-white/80 dark:hover:bg-white/10 md:hidden"
          aria-label="فتح القائمة"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-[#0B5D4B]/10 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#071F24]/95 md:hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#123B5D]/70 transition-colors hover:text-[#0B5D4B] dark:text-white/65 dark:hover:text-emerald-300"
                >
                  {link.label}
                </a>
              ))}
              <div className="space-y-2 border-t border-[#0B5D4B]/10 pt-3 dark:border-white/[0.06]">
                <Link
                  href="/login"
                  className="block py-2 text-sm font-semibold text-[#123B5D] hover:text-[#0B5D4B] dark:text-white/75 dark:hover:text-white"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="block text-center text-sm font-semibold bg-gradient-to-r from-brand-700 to-brand-500 text-white px-5 py-2.5 rounded-xl"
                >
                  سجّل مدرستك
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
