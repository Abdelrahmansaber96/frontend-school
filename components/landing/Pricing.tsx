'use client';

import { Check } from 'lucide-react';
import Section, { SectionTitle } from './Section';
import GlassCard from './GlassCard';
import { FadeInUp, StaggerContainer } from './MotionWrapper';
import Link from 'next/link';

const plans = [
  {
    name: 'الأساسية',
    nameEn: 'Basic',
    price: 'حسب الاشتراك',
    description: 'مثالي للمدارس الصغيرة والتجربة',
    features: [
      'حتى 100 طالب',
      'معلمان',
      'تسجيل الحضور',
      'الإشعارات الأساسية',
      'دعم فني بالبريد',
    ],
    cta: 'سجّل بكود الدعوة',
    highlight: false,
  },
  {
    name: 'الاحترافية',
    nameEn: 'Pro',
    price: '99',
    currency: 'ر.س/شهرياً',
    description: 'للمدارس المتوسطة والكبيرة',
    features: [
      'حتى 1000 طالب',
      'عدد غير محدود من المعلمين',
      'جميع المميزات',
      'تقارير متقدمة',
      'تواصل مباشر',
      'دعم فني مباشر',
    ],
    cta: 'اشترك الآن',
    highlight: true,
  },
  {
    name: 'المؤسسية',
    nameEn: 'Enterprise',
    price: 'مخصص',
    description: 'لمجموعات المدارس والمؤسسات التعليمية',
    features: [
      'عدد غير محدود من الطلاب',
      'عدد غير محدود من المدارس',
      'API مخصص',
      'تخصيص كامل',
      'مدير حساب مخصص',
      'SLA متقدم',
    ],
    cta: 'تواصل معنا',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <Section id="pricing" className="bg-white dark:bg-[#0B2730]">
      <FadeInUp>
        <SectionTitle subtitle="خطط مرنة تناسب جميع أحجام المدارس">
          الأسعار
        </SectionTitle>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <FadeInUp key={plan.nameEn} delay={i}>
            <GlassCard
              hover
              className={`p-8 h-full flex flex-col ${
                plan.highlight
                  ? 'border-[#B89647]/40 bg-[#FFF9EA] ring-1 ring-[#B89647]/20 dark:bg-[#B89647]/10'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#B89647] to-[#D1B56F] px-4 py-1 text-xs font-bold text-[#123B5D]">
                  الأكثر شيوعاً
                </div>
              )}

              <div className="mb-6">
                <div className="mb-1 text-sm font-semibold text-[#B89647]">{plan.nameEn}</div>
                <h3 className="text-2xl font-bold text-[#123B5D] dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-[#0B5D4B] dark:text-emerald-300">{plan.price}</span>
                {plan.currency && (
                  <span className="mr-1 text-sm text-slate-500 dark:text-slate-300">{plan.currency}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 shrink-0 text-[#14866D]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block text-center font-semibold py-3 rounded-xl transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[#0B5D4B] to-[#14866D] text-white hover:shadow-lg hover:shadow-[#0B5D4B]/25'
                    : 'border border-[#0B5D4B]/15 bg-[#E9F4EF] text-[#0B5D4B] hover:bg-[#D3E9DF] dark:border-white/10 dark:bg-white/5 dark:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </GlassCard>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
