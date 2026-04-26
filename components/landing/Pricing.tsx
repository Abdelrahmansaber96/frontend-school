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
    price: 'مجاني',
    description: 'مثالي للمدارس الصغيرة والتجربة',
    features: [
      'حتى 100 طالب',
      'معلمان',
      'تسجيل الحضور',
      'الإشعارات الأساسية',
      'دعم فني بالبريد',
    ],
    cta: 'ابدأ مجانًا',
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
    <Section id="pricing" className="bg-[#0F172A]">
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
                  ? 'border-gold-500/30 bg-gold-500/[0.05] ring-1 ring-gold-500/20'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-[#020617] text-xs font-bold px-4 py-1 rounded-full">
                  الأكثر شيوعاً
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm text-gold-400 font-semibold mb-1">{plan.nameEn}</div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-white/40 mt-1">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.currency && (
                  <span className="text-sm text-white/40 mr-1">{plan.currency}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-4 h-4 text-gold-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block text-center font-semibold py-3 rounded-xl transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-[#020617] hover:shadow-lg hover:shadow-gold-500/25'
                    : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.1]'
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
