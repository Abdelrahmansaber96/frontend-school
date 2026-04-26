'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnalyticsPanel from './AnalyticsPanel';
import type { PerformanceTrendDatum } from './student-performance';

interface PerformanceTrendChartProps {
  rows: PerformanceTrendDatum[];
  isLoading?: boolean;
}

export default function PerformanceTrendChart({ rows, isLoading }: PerformanceTrendChartProps) {
  const countFormatter = new Intl.NumberFormat('ar-EG');
  const latestPoint = rows[rows.length - 1];
  const totalPositive = rows.reduce((sum, row) => sum + row.positive, 0);
  const totalNegative = rows.reduce((sum, row) => sum + row.negative, 0);
  const maxEventCount = Math.max(1, ...rows.map((row) => Math.max(row.positive, row.negative)));

  return (
    <AnalyticsPanel
      title="اتجاه الأداء"
      subtitle="تغير مؤشر الأداء اليومي عبر الفترة المختارة"
      badge="اتجاهات"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
        </div>
      ) : rows.length < 2 ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-ink-faint">
          أضف بيانات أكثر لإظهار اتجاه الأداء.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
              <p className="text-xs text-ink-faint">آخر مؤشر أداء</p>
              <p className="mt-1 text-sm font-medium text-ink">{countFormatter.format(latestPoint?.score ?? 0)} / 100</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
              <p className="text-xs text-ink-faint">إجمالي الإشارات الإيجابية</p>
              <p className="mt-1 text-sm font-medium text-emerald-300">{countFormatter.format(totalPositive)}</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
              <p className="text-xs text-ink-faint">إجمالي الإشارات السلبية</p>
              <p className="mt-1 text-sm font-medium text-rose-300">{countFormatter.format(totalNegative)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-gold-300">
              <span className="h-2 w-2 rounded-full bg-gold-400" /> مؤشر الأداء
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> إشارات إيجابية
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> إشارات سلبية
            </span>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 10, right: 8, left: -18, bottom: 4 }}>
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E6C36A" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#E6C36A" stopOpacity={0} />
                </linearGradient>
              </defs>
                <CartesianGrid vertical={false} stroke="var(--stroke)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: 'var(--ink-dim)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis yAxisId="score" domain={[0, 100]} tick={{ fill: 'var(--ink-faint)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="events" orientation="left" allowDecimals={false} domain={[0, maxEventCount]} hide />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 14, 26, 0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 18,
                    color: '#F8FAFC',
                  }}
                  formatter={(value, label) => {
                    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                    const series = label === 'score'
                      ? 'مؤشر الأداء'
                      : label === 'positive'
                        ? 'إشارات إيجابية'
                        : 'إشارات سلبية';

                    return [label === 'score' ? `${countFormatter.format(numericValue)} / 100` : countFormatter.format(numericValue), series];
                  }}
                />
                <Area yAxisId="score" type="monotone" dataKey="score" stroke="#E6C36A" fill="url(#trendArea)" strokeWidth={3} />
                <Line yAxisId="events" type="monotone" dataKey="positive" stroke="#34D399" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="events" type="monotone" dataKey="negative" stroke="#FB7185" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AnalyticsPanel>
  );
}