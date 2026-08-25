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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B5D4B] via-[#0A4A44] to-[#123B5D]" />

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#B89647]/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#14866D]/30 blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 text-center py-16 md:py-20 px-6">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              سجّل مدرستك وابدأ رحلتك مع بصمة
            </h2>
          </FadeInUp>
          <FadeInUp delay={1}>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
              التسجيل متاح للمدارس الحاصلة على كود دعوة من إدارة المنصة
            </p>
          </FadeInUp>
          <FadeInUp delay={2}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-[#0B5D4B] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F7FAF8]"
            >
              سجّل مدرستك بكود الدعوة
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </FadeInUp>
        </div>
      </div>
    </Section>
  );
}
