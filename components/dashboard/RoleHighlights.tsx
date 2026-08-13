import Link from 'next/link';
import { AlertTriangle, BookOpen, Building2, CheckCircle2, Clock3, GraduationCap, Users } from 'lucide-react';
import type { DashboardSummary } from '@/types';
import DashboardSection from './DashboardSection';

export default function RoleHighlights({ dashboard }: { dashboard: DashboardSummary }) {
  if (dashboard.role === 'super_admin') {
    return (
      <DashboardSection title="متابعة تشغيل المنصة" description="المدارس التي تحتاج مراجعة إدارية">
        {dashboard.platform.schoolsNeedingAttention.length === 0 ? (
          <div className="px-5 py-8 text-center"><CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" /><p className="mt-2 text-sm font-medium text-ink">جميع المدارس تعمل بصورة طبيعية</p></div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
            {dashboard.platform.schoolsNeedingAttention.map((school) => (
              <Link key={school._id} href={`/schools/${school._id}`} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 hover:bg-red-500/10">
                <div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-red-500" /><div><p className="text-sm font-semibold text-ink">{school.nameAr || school.name}</p><p className="mt-1 text-[11px] text-red-500">مدرسة غير نشطة — تحتاج مراجعة</p></div></div>
              </Link>
            ))}
          </div>
        )}
      </DashboardSection>
    );
  }

  if (dashboard.role === 'parent' || dashboard.role === 'student') {
    return (
      <DashboardSection title={dashboard.role === 'parent' ? 'حالة الأبناء' : 'حالتي اليوم'} description="الحضور وآخر نتيجة والسلوك في مكان واحد">
        {dashboard.children.length === 0 ? <p className="px-5 py-10 text-center text-xs text-ink-dim">لم يتم ربط ملف طالب بهذا الحساب. تواصل مع إدارة المدرسة لإتمام الربط.</p> : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {dashboard.children.map((child) => (
              <article key={child.student._id} className="rounded-xl border border-stroke bg-glaze/[0.025] p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink">{child.student.name}</p><p className="mt-1 text-[11px] text-ink-dim">{child.class ? `${child.class.grade} · ${child.class.name}` : 'لم يحدد الفصل'}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${child.status === 'absent' ? 'bg-red-500/10 text-red-500' : child.status === 'late' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{child.status === 'absent' ? 'غائب' : child.status === 'late' ? 'متأخر' : 'لا توجد ملاحظات اليوم'}</span></div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-glaze/[0.035] p-2"><Clock3 className="mx-auto h-4 w-4 text-orange-500" /><p className="mt-1 text-sm font-bold text-ink">{child.lates}</p><p className="text-[9px] text-ink-faint">تأخر</p></div><div className="rounded-lg bg-glaze/[0.035] p-2"><AlertTriangle className="mx-auto h-4 w-4 text-red-500" /><p className="mt-1 text-sm font-bold text-ink">{child.absences}</p><p className="text-[9px] text-ink-faint">غياب</p></div><div className="rounded-lg bg-glaze/[0.035] p-2"><GraduationCap className="mx-auto h-4 w-4 text-gold-500" /><p className="mt-1 text-sm font-bold text-ink">{child.latestGrade ? `${child.latestGrade.percentage}%` : '—'}</p><p className="text-[9px] text-ink-faint">آخر درجة</p></div></div>
              </article>
            ))}
          </div>
        )}
      </DashboardSection>
    );
  }

  const permissionCount = dashboard.kpis.permissions?.value ?? 0;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="flex items-center gap-3 rounded-xl border border-stroke bg-glaze/[0.025] p-4"><Users className="h-5 w-5 text-blue-500" /><div><p className="text-lg font-bold text-ink">{dashboard.totals?.students ?? 0}</p><p className="text-[11px] text-ink-dim">طالب ضمن نطاقك</p></div></article>
      <article className="flex items-center gap-3 rounded-xl border border-stroke bg-glaze/[0.025] p-4"><BookOpen className="h-5 w-5 text-emerald-500" /><div><p className="text-lg font-bold text-ink">{dashboard.totals?.classes ?? 0}</p><p className="text-[11px] text-ink-dim">فصل دراسي</p></div></article>
      <article className="flex items-center gap-3 rounded-xl border border-stroke bg-glaze/[0.025] p-4"><Clock3 className="h-5 w-5 text-blue-500" /><div><p className="text-lg font-bold text-ink">{permissionCount}</p><p className="text-[11px] text-ink-dim">إذن خلال الفترة</p></div></article>
      <article className="flex items-center gap-3 rounded-xl border border-stroke bg-glaze/[0.025] p-4"><GraduationCap className="h-5 w-5 text-gold-500" /><div><p className="text-lg font-bold text-ink">{dashboard.academic.length}</p><p className="text-[11px] text-ink-dim">درجة حديثة</p></div></article>
    </div>
  );
}
