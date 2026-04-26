'use client';

import { TriangleAlert, TrendingDown, TrendingUp } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import AnalyticsPanel from './AnalyticsPanel';
import type { StudentPerformanceRow } from './student-performance';

interface StudentPerformanceTableProps {
  rows: StudentPerformanceRow[];
  isLoading?: boolean;
}

const riskStyles = {
  stable: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  watch: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  critical: 'border-red-400/20 bg-red-400/10 text-red-300',
} as const;

const riskLabels = {
  stable: 'مستقر',
  watch: 'مراقبة',
  critical: 'خطر',
} as const;

export default function StudentPerformanceTable({ rows, isLoading }: StudentPerformanceTableProps) {
  return (
    <AnalyticsPanel
      title="سجل أداء الطلاب"
      subtitle="ترتيب مباشر للطلاب حسب مؤشر الأداء المركب"
      badge={`${rows.length} طالب`}
    >
      {isLoading ? (
        <div className="flex h-[360px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">
          لا توجد بيانات طلاب للعرض ضمن الفترة المحددة.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                {['الطالب', 'الصف', 'النتيجة', 'الحضور', 'السلوك', 'الحالة'].map((header) => (
                  <th key={header} className="px-4 pb-2 text-right text-xs font-medium tracking-wide text-ink-faint">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="rounded-2xl border border-stroke bg-glaze/[0.03] transition-all duration-200 hover:bg-glaze/[0.06]"
                >
                  <td className="rounded-r-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-ink">{row.displayName}</p>
                        <p className="text-xs text-ink-faint">{row.scoreBandLabel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{row.classLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-emerald-400"
                          style={{ width: `${row.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-ink">{row.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">
                    <div className="flex items-center gap-2">
                      <span>{row.attendanceIncidents} ملاحظة</span>
                      {row.attendanceIncidents > 0 ? <TrendingDown className="h-4 w-4 text-amber-300" /> : <TrendingUp className="h-4 w-4 text-emerald-300" />}
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      غياب {row.absenceCount} • تأخر {row.lateCount} • إذن {row.permissionCount}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">
                    <span className={row.behaviorIndex >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                      {row.behaviorIndex >= 0 ? '+' : ''}{row.behaviorIndex}
                    </span>
                    <p className="mt-1 text-xs text-ink-faint">
                      إيجابي {row.positiveCount} • سلبي {row.negativeCount}
                    </p>
                  </td>
                  <td className="rounded-l-2xl px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${riskStyles[row.riskLevel]}`}>
                      {row.riskLevel === 'critical' ? <TriangleAlert className="h-3.5 w-3.5" /> : null}
                      {riskLabels[row.riskLevel]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AnalyticsPanel>
  );
}