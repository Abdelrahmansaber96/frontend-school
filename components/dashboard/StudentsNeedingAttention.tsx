import Link from 'next/link';
import { UserRoundSearch } from 'lucide-react';
import type { DashboardAttentionStudent } from '@/types';
import DashboardSection from './DashboardSection';

export default function StudentsNeedingAttention({ students }: { students: DashboardAttentionStudent[] }) {
  return (
    <DashboardSection title="طلاب يحتاجون متابعة" description="الأعلى بحسب الغياب والتأخر والسلوك">
      {students.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-dim"><UserRoundSearch className="mx-auto mb-2 h-6 w-6 text-ink-faint" />لا توجد حالات متابعة في هذه الفترة.</div>
      ) : (
        <div className="divide-y divide-stroke">
          {students.map((item) => (
            <Link key={item.id} href={`/students?studentId=${item.student._id}`} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3.5 hover:bg-glaze/[0.035] sm:px-5">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{item.student.name}</p><p className="mt-0.5 truncate text-[11px] text-ink-faint">{item.class ? `${item.class.grade} · ${item.class.name}` : 'دون فصل'}</p></div>
              <div className="flex items-center gap-1.5 text-[10px] tabular-nums"><span className="rounded-md bg-red-500/10 px-2 py-1 text-red-500">غياب {item.absences}</span><span className="rounded-md bg-orange-500/10 px-2 py-1 text-orange-500">تأخر {item.lates}</span><span className="hidden rounded-md bg-red-500/10 px-2 py-1 text-red-500 sm:inline">سلوك {item.negativeBehaviors}</span></div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
