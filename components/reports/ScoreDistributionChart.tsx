'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnalyticsPanel from './AnalyticsPanel';
import type { PerformanceDistributionDatum } from './student-performance';

interface ScoreDistributionChartProps {
  rows: PerformanceDistributionDatum[];
  isLoading?: boolean;
}

export default function ScoreDistributionChart({ rows, isLoading }: ScoreDistributionChartProps) {
  const hasData = rows.some((row) => row.count > 0);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const leadingBucket = rows.reduce<PerformanceDistributionDatum | null>((current, row) => {
    if (!current || row.count > current.count) return row;
    return current;
  }, null);
  const countFormatter = new Intl.NumberFormat('ar-EG');
  const percentageFormatter = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <AnalyticsPanel
      title="توزيع الدرجات"
      subtitle="تصنيف الأداء حسب شرائح النقاط داخل الفترة الحالية"
      badge="مخطط أعمدة"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-ink-faint">
          لا توجد بيانات كافية لعرض التوزيع.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
              <p className="text-xs text-ink-faint">الشريحة الأوسع</p>
              <p className="mt-1 text-sm font-medium text-ink">{leadingBucket?.label ?? '—'}</p>
              <p className="mt-1 text-xs text-ink-dim">
                {leadingBucket ? `${countFormatter.format(leadingBucket.count)} طالب` : 'لا توجد بيانات'}
              </p>
            </div>
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
              <p className="text-xs text-ink-faint">إجمالي الطلاب في التوزيع</p>
              <p className="mt-1 text-sm font-medium text-ink">{countFormatter.format(total)} طالب</p>
              <p className="mt-1 text-xs text-ink-dim">يعكس عدد الطلاب الذين دخلوا في حساب المؤشر</p>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}>
              <defs>
                <linearGradient id="barHighlight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F0D78C" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#A47E1B" stopOpacity={0.9} />
                </linearGradient>
              </defs>
                <CartesianGrid vertical={false} stroke="var(--stroke)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: 'var(--ink-dim)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-faint)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: 'rgba(10, 14, 26, 0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 18,
                    color: '#F8FAFC',
                  }}
                  formatter={(value) => {
                    const count = typeof value === 'number' ? value : Number(value ?? 0);
                    const share = total ? (count / total) * 100 : 0;

                    return [`${countFormatter.format(count)} طالب • ${percentageFormatter.format(share)}%`, 'عدد الطلاب'];
                  }}
                />
                <Bar dataKey="count" radius={[14, 14, 6, 6]} maxBarSize={56} animationDuration={700}>
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AnalyticsPanel>
  );
}