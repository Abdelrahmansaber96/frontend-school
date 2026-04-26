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
    gradient: 'from-blue-500/20 to-violet-500/20',
    iconBg: 'from-blue-500 to-violet-500',
  },
  {
    icon: BookOpen,
    title: 'المعلم',
    description:
      'تسجيل الحضور والسلوك، التواصل مع أولياء الأمور، إدارة الفصول والطلاب بسهولة.',
    features: ['تسجيل الحضور', 'متابعة السلوك', 'التواصل المباشر', 'إدارة الفصول'],
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconBg: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Heart,
    title: 'ولي الأمر',
    description:
      'متابعة أبنائك لحظة بلحظة: الحضور، السلوك، الإشعارات، والتواصل المباشر مع المعلمين.',
    features: ['متابعة الأبناء', 'استلام الإشعارات', 'التواصل مع المعلمين', 'تقارير الأداء'],
    gradient: 'from-rose-500/20 to-pink-500/20',
    iconBg: 'from-rose-500 to-pink-500',
  },
];

export default function Roles() {
  return (
    <Section id="roles" className="bg-[#0F172A]">
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

              <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
              <p className="text-white/50 leading-relaxed mb-6">{role.description}</p>

              <ul className="mt-auto space-y-3">
                {role.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
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
