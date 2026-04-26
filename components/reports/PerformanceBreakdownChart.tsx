'use client';

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import AnalyticsPanel from './AnalyticsPanel';
import type { PerformanceTierDatum } from './student-performance';

interface PerformanceBreakdownChartProps {
  rows: PerformanceTierDatum[];
  successRate: number;
  isLoading?: boolean;
}

export default function PerformanceBreakdownChart({ rows, successRate, isLoading }: PerformanceBreakdownChartProps) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const countFormatter = new Intl.NumberFormat('ar-EG');
  const percentageFormatter = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <AnalyticsPanel
      title="التوزيع النسبي"
      subtitle="توزيع الطلاب بين مستويات الأداء"
      badge="مخطط حلقي"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
        </div>
      ) : !total ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-ink-faint">
          لا توجد نسب متاحة ضمن الفترة المحددة.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 14, 26, 0.88)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 18,
                    color: '#F8FAFC',
                  }}
                  formatter={(value, _name, item) => {
                    const count = typeof value === 'number' ? value : Number(value ?? 0);
                    const label = typeof item?.payload?.label === 'string' ? item.payload.label : 'الفئة';

                    return [`${count} طالب`, label];
                  }}
                />
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={78}
                  outerRadius={108}
                  paddingAngle={4}
                  stroke="rgba(10, 14, 26, 0.55)"
                  strokeWidth={4}
                  animationDuration={700}
                >
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.fill} />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" fill="var(--ink)" fontSize="34" fontWeight="700">
                  {percentageFormatter.format(successRate)}%
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" fill="var(--ink-faint)" fontSize="12">
                  نسبة النجاح
                </text>
                <text x="50%" y="66%" textAnchor="middle" dominantBaseline="central" fill="var(--ink-dim)" fontSize="11">
                  {countFormatter.format(total)} طالب
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.key} className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.fill }} />
                    <span className="text-sm text-ink-muted">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">{percentageFormatter.format(row.percentage)}%</span>
                </div>
                <p className="mt-2 text-xs text-ink-faint">{countFormatter.format(row.value)} طالب</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnalyticsPanel>
  );
}