'use client';

import { Sparkles, Shield, TrendingUp, Trophy } from 'lucide-react';
import AnalyticsPanel from './AnalyticsPanel';
import type { PerformanceInsight } from './student-performance';

interface PerformanceInsightsPanelProps {
  insights: PerformanceInsight[];
}

const toneClasses = {
  gold: 'border-gold-400/20 bg-gold-400/10 text-gold-200',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  sky: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
} as const;

const insightIcons = [Trophy, TrendingUp, Shield, Sparkles];

export default function PerformanceInsightsPanel({ insights }: PerformanceInsightsPanelProps) {
  return (
    <AnalyticsPanel
      title="ملاحظات ذكية"
      subtitle="ملخصات تلقائية مبنية على مؤشرات الفترة الحالية"
      badge="تحليل آلي"
      className="h-full"
    >
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insightIcons[index % insightIcons.length];

          return (
            <div key={`${insight.title}-${index}`} className="rounded-2xl border border-stroke bg-glaze/[0.03] p-4">
              <div className="flex items-start gap-3">
                <div className={`rounded-2xl border p-2.5 ${toneClasses[insight.tone]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{insight.title}</p>
                    <span className="text-xs font-semibold text-gold-400">{insight.metric}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-ink-muted">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsPanel>
  );
}