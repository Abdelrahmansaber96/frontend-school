'use client';

import {
  Users,
  CalendarCheck,
  ShieldCheck,
  MessageCircle,
  BarChart3,
  Bell,
} from 'lucide-react';
import Section, { SectionTitle } from './Section';
import GlassCard from './GlassCard';
import { FadeInUp, StaggerContainer } from './MotionWrapper';

const features = [
  {
    icon: Users,
    title: 'إدارة الطلاب',
    description: 'إدارة شاملة لبيانات الطلاب والملفات الشخصية والسجلات الأكاديمية',
    color: 'from-[#123B5D] to-[#1E5D7D]',
  },
  {
    icon: CalendarCheck,
    title: 'متابعة الحضور',
    description: 'تسجيل الحضور والغياب يوميًا مع تقارير تفصيلية وإشعارات تلقائية',
    color: 'from-[#14866D] to-[#0B5D4B]',
  },
  {
    icon: ShieldCheck,
    title: 'تسجيل السلوك',
    description: 'متابعة سلوك الطلاب وتسجيل الملاحظات الإيجابية والسلبية',
    color: 'from-[#0B5D4B] to-[#123B5D]',
  },
  {
    icon: MessageCircle,
    title: 'تواصل مباشر',
    description: 'نظام مراسلة فوري بين المعلمين وأولياء الأمور والإدارة',
    color: 'from-[#14866D] to-[#46A787]',
  },
  {
    icon: BarChart3,
    title: 'تقارير احترافية',
    description: 'تقارير شاملة ورسوم بيانية تفاعلية لتحليل الأداء',
    color: 'from-[#B89647] to-[#8C6D2E]',
  },
  {
    icon: Bell,
    title: 'إشعارات فورية',
    description: 'إشعارات لحظية لجميع الأحداث المهمة والتحديثات',
    color: 'from-[#1E5D7D] to-[#14866D]',
  },
];

export default function Features() {
  return (
    <Section id="features" className="bg-white dark:bg-[#0B2730]">
      <FadeInUp>
        <SectionTitle subtitle="كل ما تحتاجه لإدارة مدرستك في مكان واحد">
          مميزات المنصة
        </SectionTitle>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <FadeInUp key={feature.title} delay={i}>
            <GlassCard className="p-6 h-full">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#123B5D] dark:text-white">{feature.title}</h3>
              <p className="leading-relaxed text-slate-500 dark:text-slate-300">{feature.description}</p>
            </GlassCard>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
