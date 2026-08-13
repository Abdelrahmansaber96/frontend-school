import type { DashboardAcademicItem } from '@/types';
import DashboardSection from './DashboardSection';

export default function RecentGrades({ grades }: { grades: DashboardAcademicItem[] }) {
  return (
    <DashboardSection title="أحدث الدرجات" description="آخر التقييمات المنشورة ضمن نطاق الحساب">
      {grades.length === 0 ? <p className="px-5 py-10 text-center text-xs text-ink-dim">لا توجد درجات منشورة بعد. ستظهر أحدث النتائج هنا تلقائيًا.</p> : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
          {grades.map((grade) => (
            <article key={grade._id} className="rounded-xl border border-stroke bg-glaze/[0.025] p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{grade.title}</p><p className="mt-1 truncate text-[11px] text-ink-dim">{grade.subject?.name || 'مادة غير محددة'}{grade.student ? ` · ${grade.student.name}` : ''}</p></div><span className={`rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${grade.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : grade.percentage >= 60 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>{grade.percentage}%</span></div>
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
