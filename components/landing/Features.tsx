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
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: CalendarCheck,
    title: 'متابعة الحضور',
    description: 'تسجيل الحضور والغياب يوميًا مع تقارير تفصيلية وإشعارات تلقائية',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'تسجيل السلوك',
    description: 'متابعة سلوك الطلاب وتسجيل الملاحظات الإيجابية والسلبية',
    color: 'from-violet-400 to-violet-600',
  },
  {
    icon: MessageCircle,
    title: 'تواصل مباشر',
    description: 'نظام مراسلة فوري بين المعلمين وأولياء الأمور والإدارة',
    color: 'from-rose-400 to-rose-600',
  },
  {
    icon: BarChart3,
    title: 'تقارير احترافية',
    description: 'تقارير شاملة ورسوم بيانية تفاعلية لتحليل الأداء',
    color: 'from-amber-400 to-amber-600',
  },
  {
    icon: Bell,
    title: 'إشعارات فورية',
    description: 'إشعارات لحظية لجميع الأحداث المهمة والتحديثات',
    color: 'from-cyan-400 to-cyan-600',
  },
];

export default function Features() {
  return (
    <Section id="features" className="bg-[#0F172A]">
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
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.description}</p>
            </GlassCard>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </Section>
  );
}
