'use client';

import { Shield, BookOpen, Heart } from 'lucide-react';
import Section, { SectionTitle } from './Section';
import GlassCard from './GlassCard';
import { FadeInUp, StaggerContainer } from './MotionWrapper';

const roles = [
  {
    icon: Shield,
    title: 'الإدارة',
    description:
      'تحكم كامل في إعدادات المدرسة، إدارة المعلمين والطلاب، متابعة التقارير الشاملة، وإدارة الصلاحيات.',
    features: ['لوحة تحكم شاملة', 'إدارة المستخدمين', 'تقارير وإحصائيات', 'إعدادات المدرسة'],
    gradient: 'from-[#123B5D]/10 to-[#14866D]/10',
    iconBg: 'from-[#123B5D] to-[#14866D]',
  },
  {
    icon: BookOpen,
    title: 'المعلم',
    description:
      'تسجيل الحضور والسلوك، التواصل مع أولياء الأمور، إدارة الفصول والطلاب بسهولة.',
    features: ['تسجيل الحضور', 'متابعة السلوك', 'التواصل المباشر', 'إدارة الفصول'],
    gradient: 'from-[#14866D]/10 to-[#0B5D4B]/10',
    iconBg: 'from-[#14866D] to-[#0B5D4B]',
  },
  {
    icon: Heart,
    title: 'ولي الأمر',
    description:
      'متابعة أبنائك لحظة بلحظة: الحضور، السلوك، الإشعارات، والتواصل المباشر مع المعلمين.',
    features: ['متابعة الأبناء', 'استلام الإشعارات', 'التواصل مع المعلمين', 'تقارير الأداء'],
    gradient: 'from-[#B89647]/10 to-[#14866D]/10',
    iconBg: 'from-[#B89647] to-[#8C6D2E]',
  },
];

export default function Roles() {
  return (
    <Section id="roles" className="bg-white dark:bg-[#0B2730]">
      <FadeInUp>
        <SectionTitle subtitle="واجهة مخصصة لكل دور في المنظومة التعليمية">
          لكل دور واجهته
        </SectionTitle>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {roles.map((role, i) => (
          <FadeInUp key={role.title} delay={i}>
            <GlassCard className="p-8 h-full flex flex-col">
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
              />

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.iconBg} flex items-center justify-center mb-6 shadow-lg`}
              >
                <role.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-[#123B5D] dark:text-white">{role.title}</h3>
              <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-300">{role.description}</p>

              <ul className="mt-auto space-y-3">
                {role.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#B89647]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
