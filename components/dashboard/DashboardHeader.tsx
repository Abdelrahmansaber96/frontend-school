import { Clock3, RefreshCw } from 'lucide-react';
import type { DashboardRange } from '@/types';

const ranges: Array<{ value: DashboardRange; label: string }> = [
  { value: 'today', label: 'اليوم' },
  { value: '7d', label: '7 أيام' },
  { value: '30d', label: '30 يومًا' },
];

export default function DashboardHeader({ name, schoolName, generatedAt, range, loading, onRangeChange, onRefresh }: {
  name: string;
  schoolName?: string | null;
  generatedAt?: string;
  range: DashboardRange;
  loading: boolean;
  onRangeChange: (range: DashboardRange) => void;
  onRefresh: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
  const today = new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <header className="rounded-2xl border border-stroke bg-glaze/[0.025] p-4 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gold-500">{schoolName || 'منصة بصمة التعليمية'}</p>
          <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">{greeting}، {name}</h1>
          <p className="mt-2 text-xs text-ink-dim sm:text-sm">{today}</p>
          {generatedAt && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              آخر تحديث {new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date(generatedAt))}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 rounded-xl border border-stroke bg-glaze/[0.03] p-1" aria-label="الفترة الزمنية">
            {ranges.map((item) => (
              <button key={item.value} type="button" onClick={() => onRangeChange(item.value)}
                aria-pressed={range === item.value}
                className={`min-h-9 rounded-lg px-3 text-xs font-medium transition-colors ${range === item.value ? 'bg-gold-500 text-navy-950' : 'text-ink-dim hover:bg-glaze/[0.05] hover:text-ink'}`}>
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onRefresh} disabled={loading} aria-label="تحديث لوحة التحكم"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stroke px-3 text-xs font-medium text-ink-muted hover:border-stroke-strong hover:bg-glaze/[0.04] disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            تحديث
          </button>
        </div>
      </div>
    </header>
  );
}
