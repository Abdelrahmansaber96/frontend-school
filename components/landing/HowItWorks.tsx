'use client';

import { School, UserPlus, Users, Rocket } from 'lucide-react';
import Section, { SectionTitle } from './Section';
import { FadeInUp } from './MotionWrapper';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: School,
    title: 'تسجيل المدرسة',
    description: 'أنشئ حساب مدرستك في دقائق مع إعدادات مخصصة',
    step: '١',
  },
  {
    icon: UserPlus,
    title: 'إضافة المعلمين',
    description: 'أضف المعلمين وحدد صلاحياتهم والفصول المسؤولين عنها',
    step: '٢',
  },
  {
    icon: Users,
    title: 'إضافة الطلاب',
    description: 'سجّل بيانات الطلاب وربطهم بأولياء أمورهم',
    step: '٣',
  },
  {
    icon: Rocket,
    title: 'بدء الاستخدام',
    description: 'ابدأ باستخدام جميع مميزات المنصة فوراً',
    step: '٤',
  },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <FadeInUp>
        <SectionTitle subtitle="أربع خطوات بسيطة للبدء">
          كيف يعمل النظام
        </SectionTitle>
      </FadeInUp>

      <div className="relative">
        {/* Connector line */}
        <div className="hidden lg:block absolute top-1/2 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent -translate-y-1/2" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <FadeInUp key={step.title} delay={i}>
              <div className="relative text-center group">
                {/* Step number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/20 flex items-center justify-center mb-6"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                    {step.step}
                  </span>
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </Section>
  );
}
