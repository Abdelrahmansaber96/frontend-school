'use client';

import { Cloud, Globe, Zap, Palette } from 'lucide-react';
import Section, { SectionTitle } from './Section';
import { FadeInUp, StaggerContainer } from './MotionWrapper';
import { motion } from 'framer-motion';

const reasons = [
  {
    icon: Cloud,
    title: 'نظام SaaS',
    description: 'لا حاجة لتثبيت أو خوادم — كل شيء جاهز في السحابة',
  },
  {
    icon: Globe,
    title: 'يدعم آلاف المدارس',
    description: 'بنية تحتية قوية تدعم عدد غير محدود من المدارس والمستخدمين',
  },
  {
    icon: Zap,
    title: 'سريع وآمن',
    description: 'سرعة فائقة في الأداء مع حماية عالية للبيانات والخصوصية',
  },
  {
    icon: Palette,
    title: 'تصميم حديث',
    description: 'واجهة مستخدم عصرية وسهلة الاستخدام بتصميم احترافي',
  },
];

export default function WhyBasma() {
  return (
    <Section>
      <FadeInUp>
        <SectionTitle subtitle="لماذا تختار بصمة لإدارة مدرستك؟">
          لماذا بصمة؟
        </SectionTitle>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {reasons.map((reason, i) => (
          <FadeInUp key={reason.title} delay={i}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4 rounded-2xl border border-[#0B5D4B]/10 bg-white/90 p-6 shadow-[0_12px_34px_rgba(18,59,93,0.07)] backdrop-blur-xl transition-colors duration-300 hover:border-[#14866D]/30 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0B5D4B]/15 bg-[#E9F4EF] dark:bg-[#14866D]/15">
                <reason.icon className="h-6 w-6 text-[#0B5D4B] dark:text-emerald-300" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold text-[#123B5D] dark:text-white">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">{reason.description}</p>
              </div>
            </motion.div>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
