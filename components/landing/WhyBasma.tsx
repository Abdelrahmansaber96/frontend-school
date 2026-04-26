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
              className="flex gap-4 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-gold-500/20 transition-colors duration-300"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <reason.icon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{reason.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{reason.description}</p>
              </div>
            </motion.div>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
