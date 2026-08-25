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
        <div className="absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#14866D]/30 to-transparent lg:block" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <FadeInUp key={step.title} delay={i}>
              <div className="relative text-center group">
                {/* Step number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#0B5D4B]/15 bg-gradient-to-br from-[#E9F4EF] to-white shadow-sm dark:from-[#14866D]/20 dark:to-white/5"
                >
                  <span className="bg-gradient-to-r from-[#0B5D4B] to-[#14866D] bg-clip-text text-2xl font-black text-transparent">
                    {step.step}
                  </span>
                  <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0B5D4B] to-[#14866D] shadow-lg shadow-[#0B5D4B]/20">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                <h3 className="mb-2 text-lg font-bold text-[#123B5D] dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">{step.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </Section>
  );
}
