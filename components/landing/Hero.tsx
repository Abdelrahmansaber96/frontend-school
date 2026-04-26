'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeInUp } from './MotionWrapper';
import { Play, ArrowLeft } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0F172A] to-[#1E293B]" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating glass shapes */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[15%] w-20 h-20 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[10%] w-16 h-16 rounded-full bg-gold-500/[0.06] backdrop-blur-sm border border-gold-500/[0.1] hidden lg:block"
      />
      <motion.div
        animate={{ y: [-8, 12, -8], rotate: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 right-[20%] w-24 h-24 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hidden lg:block"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <FadeInUp>
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/70">نظام إدارة مدرسي متكامل</span>
          </div>
        </FadeInUp>

        {/* Title */}
        <FadeInUp delay={1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            منصة{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 bg-clip-text text-transparent">
                بصمة
              </span>
              <motion.span
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-1 mb-4 right-0 h-1 bg-gradient-to-r from-gold-500 to-gold-400/50 rounded-full"
              />
            </span>{' '}
            التعليمية
          </h1>
        </FadeInUp>

        {/* Subtitle */}
        <FadeInUp delay={2}>
          <p className="text-lg md:text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto  mb-10 leading-relaxed">
            نظام متكامل لإدارة المدارس والتواصل بين الإدارة والمعلمين وأولياء الأمور
          </p>
        </FadeInUp>

        {/* CTA Buttons */}
        <FadeInUp delay={3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-[#020617] font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-2xl hover:shadow-gold-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              ابدأ الآن
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <button className="group inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 font-medium px-8 py-4 rounded-2xl text-lg hover:bg-white/[0.1] hover:text-white transition-all duration-300">
              <Play className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
              مشاهدة العرض
            </button>
          </div>
        </FadeInUp>

        {/* Stats */}
        <FadeInUp delay={4}>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '+500', label: 'مدرسة' },
              { value: '+50K', label: 'طالب' },
              { value: '99.9%', label: 'وقت التشغيل' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeInUp>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
    </section>
  );
}
