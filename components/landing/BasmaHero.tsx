'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FadeInUp } from './MotionWrapper';
import BrandLogo from '@/components/ui/BrandLogo';

const stats = [
  { value: '+500', label: 'مدرسة' },
  { value: '+50 ألف', label: 'طالب وطالبة' },
  { value: '99.9%', label: 'استمرارية الخدمة' },
];

export default function BasmaHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#EAF5F0] via-[#F7FAF8] to-white dark:from-[#0A3434] dark:via-[#071F24] dark:to-[#071F24]" />
      <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#14866D]/10 blur-3xl" />
      <div className="absolute -left-20 bottom-8 h-64 w-64 rounded-full bg-[#B89647]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="order-2 text-center lg:order-1 lg:text-right">
          <FadeInUp><span className="inline-flex items-center gap-2 rounded-full border border-[#0B5D4B]/15 bg-white/80 px-4 py-2 text-sm font-bold text-[#0B5D4B] shadow-sm dark:bg-white/5 dark:text-emerald-200"><ShieldCheck className="h-4 w-4" /> منصة سعودية لإدارة المدارس</span></FadeInUp>
          <FadeInUp delay={1}><h1 className="mt-6 text-4xl font-black leading-[1.25] text-[#123B5D] sm:text-5xl lg:text-6xl dark:text-white">إدارة مدرستك أصبحت أبسط مع <span className="text-[#0B5D4B] dark:text-emerald-300">بصمة</span></h1></FadeInUp>
          <FadeInUp delay={2}><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 lg:mx-0">منصة تعليمية متكاملة تجمع الإدارة والمعلمين والطلاب وأولياء الأمور، وتحوّل الحضور والسلوك والدرجات والتقارير إلى تجربة يومية واضحة وآمنة.</p></FadeInUp>
          <FadeInUp delay={3}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/register" className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#0B5D4B] to-[#14866D] px-7 py-3.5 text-base font-black text-white shadow-lg shadow-[#0B5D4B]/20 transition hover:-translate-y-0.5 hover:shadow-xl">سجّل مدرستك بكود الدعوة <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /></Link>
              <Link href="/login" className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-[#0B5D4B]/15 bg-white px-7 py-3.5 text-base font-black text-[#123B5D] shadow-sm transition hover:border-[#0B5D4B]/35 hover:text-[#0B5D4B] dark:bg-white/5 dark:text-white">تسجيل الدخول</Link>
            </div>
          </FadeInUp>
          <FadeInUp delay={4}>
            <div className="mt-10 grid grid-cols-3 divide-x divide-x-reverse divide-[#0B5D4B]/10 rounded-2xl border border-[#0B5D4B]/10 bg-white/70 p-4 shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
              {stats.map((stat) => <div key={stat.label} className="px-2 text-center"><div className="text-xl font-black text-[#B89647] sm:text-2xl">{stat.value}</div><div className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs dark:text-slate-300">{stat.label}</div></div>)}
            </div>
          </FadeInUp>
        </div>
        <FadeInUp className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[32px] border-[6px] border-white bg-white shadow-[0_28px_80px_rgba(11,93,75,0.20)] dark:border-white/10 dark:bg-[#0B2730]">
            <div className="relative aspect-[4/3] sm:aspect-[16/11]">
              <Image src="/brand/basma-saudi-campus.png" alt="بوابة مدرسة سعودية حديثة" fill priority sizes="(min-width: 1024px) 52vw, 92vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#073F37]/75 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-[#071F24]/85 sm:inset-x-6 sm:bottom-6 sm:p-4"><BrandLogo variant="wordmark" size="sm" /><span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5D4B] dark:text-emerald-200"><CheckCircle2 className="h-4 w-4" /> إدارة مدرسية موثوقة</span></div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
