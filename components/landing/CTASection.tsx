'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Section from './Section';
import { FadeInUp } from './MotionWrapper';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-[#0F172A] to-gold-600/10" />
        <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-3xl" />

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold-500/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gold-400/10 blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 text-center py-16 md:py-20 px-6">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              ابدأ الآن وأنشئ مدرستك خلال دقائق
            </h2>
          </FadeInUp>
          <FadeInUp delay={1}>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
              انضم لمئات المدارس التي تستخدم بصمة لإدارة العملية التعليمية بكفاءة
            </p>
          </FadeInUp>
          <FadeInUp delay={2}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-[#020617] font-bold px-10 py-4 rounded-2xl text-lg hover:shadow-2xl hover:shadow-gold-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              إنشاء حساب
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </FadeInUp>
        </div>
      </div>
    </Section>
  );
}
