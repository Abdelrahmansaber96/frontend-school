import { AlertTriangle, Bell, Building2, Clock3, School, ShieldAlert, Users } from 'lucide-react';
import type { DashboardKpi, DashboardSummary } from '@/types';

const operational = [
  { key: 'absences', label: 'الغياب', icon: AlertTriangle, tone: 'text-red-500 bg-red-500/10' },
  { key: 'lates', label: 'التأخر', icon: Clock3, tone: 'text-orange-500 bg-orange-500/10' },
  { key: 'negativeBehaviors', label: 'السلوك السلبي', icon: ShieldAlert, tone: 'text-red-500 bg-red-500/10' },
  { key: 'unreadNotifications', label: 'غير المقروء', icon: Bell, tone: 'text-blue-500 bg-blue-500/10' },
] as const;

const platform = [
  { key: 'schools', label: 'إجمالي المدارس', icon: School, tone: 'text-gold-500 bg-gold-500/10' },
  { key: 'activeSchools', label: 'المدارس النشطة', icon: Building2, tone: 'text-emerald-500 bg-emerald-500/10' },
  { key: 'users', label: 'المستخدمون', icon: Users, tone: 'text-blue-500 bg-blue-500/10' },
  { key: 'newSchools', label: 'مدارس جديدة', icon: School, tone: 'text-purple-500 bg-purple-500/10' },
] as const;

const trendText = (kpi?: DashboardKpi) => {
  if (!kpi || kpi.direction === 'stable') return 'دون تغيير عن الفترة السابقة';
  return `${kpi.direction === 'up' ? 'ارتفاع' : 'انخفاض'} ${Math.abs(kpi.changePercent)}% عن الفترة السابقة`;
};

export default function DailyKpiGrid({ dashboard }: { dashboard: DashboardSummary }) {
  const items = dashboard.role === 'super_admin' ? platform : operational;
  return (
    <section aria-label="المؤشرات الأساسية" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ key, label, icon: Icon, tone }) => {
        const kpi = dashboard.kpis[key];
        return (
          <article key={key} className="rounded-2xl border border-stroke bg-glaze/[0.025] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-ink-dim">{label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-ink sm:text-3xl">{kpi?.value ?? 0}</p>
              </div>
              <span className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
            </div>
            <p className="mt-3 line-clamp-1 text-[10px] text-ink-faint sm:text-[11px]">{trendText(kpi)}</p>
          </article>
        );
      })}
    </section>
  );
}
