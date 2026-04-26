'use client';

import { BellRing, TriangleAlert } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';
import type { PerformanceAlert } from './student-performance';

interface PerformanceAlertsPanelProps {
  alerts: PerformanceAlert[];
}

export default function PerformanceAlertsPanel({ alerts }: PerformanceAlertsPanelProps) {
  return (
    <AnalyticsPanel
      title="التنبيهات المبكرة"
      subtitle="طلاب يحتاجون متابعة فورية بناءً على الأداء والسلوك"
      badge={`${alerts.length} تنبيه`}
      className="h-full"
    >
      {alerts.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 text-sm text-emerald-200">
          لا توجد تنبيهات حرجة ضمن الفترة الحالية.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.studentId}
              className={`rounded-2xl border p-4 ${alert.severity === 'critical' ? 'border-red-400/20 bg-red-400/10' : 'border-amber-400/20 bg-amber-400/10'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-2xl border p-2 ${alert.severity === 'critical' ? 'border-red-400/20 bg-red-400/10 text-red-300' : 'border-amber-400/20 bg-amber-400/10 text-amber-200'}`}>
                  {alert.severity === 'critical' ? <TriangleAlert className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{alert.studentName}</p>
                      <p className="text-xs text-ink-faint">{alert.classLabel}</p>
                    </div>
                    <span className="rounded-full border border-stroke bg-glaze/[0.06] px-2.5 py-1 text-xs font-medium text-ink">
                      {alert.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{alert.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnalyticsPanel>
  );
}