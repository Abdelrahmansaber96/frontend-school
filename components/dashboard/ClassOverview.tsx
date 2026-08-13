import type { DashboardClassOverview } from '@/types';
import DashboardSection from './DashboardSection';

export default function ClassOverview({ classes }: { classes: DashboardClassOverview[] }) {
  return (
    <DashboardSection title="ملخص الفصول" description="حركة السجلات خلال الفترة المحددة">
      {classes.length === 0 ? <p className="px-5 py-10 text-center text-xs text-ink-dim">لا توجد فصول مرتبطة بهذا الحساب بعد.</p> : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {classes.slice(0, 6).map((item) => (
            <article key={item.class._id} className="rounded-xl border border-stroke bg-glaze/[0.025] p-3.5">
              <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-ink">{item.class.name}</p><span className="text-[11px] text-ink-faint">{item.studentCount} طالب</span></div>
              <p className="mt-1 text-[11px] text-ink-dim">{item.class.grade}{item.class.section ? ` · ${item.class.section}` : ''}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]"><span className="rounded-md bg-red-500/10 px-1 py-1.5 text-red-500">غياب {item.absences}</span><span className="rounded-md bg-orange-500/10 px-1 py-1.5 text-orange-500">تأخر {item.lates}</span><span className="rounded-md bg-red-500/10 px-1 py-1.5 text-red-500">سلوك {item.negativeBehaviors}</span></div>
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
