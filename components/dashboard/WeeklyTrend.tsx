import type { DashboardTrendDay } from '@/types';
import DashboardSection from './DashboardSection';

export default function WeeklyTrend({ days }: { days: DashboardTrendDay[] }) {
  const max = Math.max(1, ...days.map((day) => day.absences + day.lates + day.negativeBehaviors));
  return (
    <DashboardSection title="الاتجاه الأسبوعي" description="ملخص تنفيذي لآخر سبعة أيام">
      {days.length === 0 ? <p className="px-5 py-10 text-center text-xs text-ink-dim">ستظهر الاتجاهات بعد توفر سجلات كافية.</p> : (
        <div className="p-4 sm:p-5">
          <div className="flex h-44 items-end justify-between gap-2" role="img" aria-label="مخطط اتجاه الغياب والتأخر والسلوك خلال الأسبوع">
            {days.map((day) => {
              const total = day.absences + day.lates + day.negativeBehaviors;
              return <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] tabular-nums text-ink-faint">{total}</span><div className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-red-500/70 to-orange-400/70" style={{ height: `${Math.max(4, (total / max) * 120)}px` }} title={`${day.date}: ${total}`} /><span className="truncate text-[9px] text-ink-faint sm:text-[10px]">{new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`))}</span></div>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] text-ink-dim"><span>● الغياب + التأخر + السلوك السلبي</span></div>
        </div>
      )}
    </DashboardSection>
  );
}
