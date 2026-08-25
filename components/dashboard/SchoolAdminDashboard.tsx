'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Mail,
  Megaphone,
  RefreshCw,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import type { OperationalDashboard } from '@/types';

interface Props {
  dashboard: OperationalDashboard;
  firstName: string;
  schoolName?: string | null;
  subjectCount: number;
  assessmentCount: number;
  loading: boolean;
  onRefresh: () => void;
}

const cardClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(78,70,150,0.06)] dark:border-white/10 dark:bg-navy-800/80';

const formatGregorian = (date: Date) => new Intl.DateTimeFormat('ar-EG', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(date);

const formatHijri = (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
  day: 'numeric', month: 'long', year: 'numeric',
}).format(date);

const formatTimeAgo = (value: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(value));
};

const actionTone = (type: string) => {
  if (type === 'absence' || type === 'negative_behavior') return { icon: AlertTriangle, shell: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10', row: 'bg-amber-50/70 dark:bg-amber-500/[0.07]' };
  if (type === 'late' || type === 'permission') return { icon: Clock3, shell: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10', row: 'bg-blue-50/70 dark:bg-blue-500/[0.07]' };
  return { icon: CheckCircle2, shell: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10', row: 'bg-emerald-50/70 dark:bg-emerald-500/[0.07]' };
};

export default function SchoolAdminDashboard({ dashboard, firstName, schoolName, subjectCount, assessmentCount, loading, onRefresh }: Props) {
  const now = new Date();
  const calendarDays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index - 2);
    return date;
  });
  const recentActions = dashboard.alerts.slice(0, 3);
  const announcements = dashboard.alerts.filter((item) => item.type === 'unread_notification').slice(0, 2);
  const todaySummary = [
    { label: 'الغياب', value: dashboard.kpis.absences?.value ?? 0, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' },
    { label: 'التأخر', value: dashboard.kpis.lates?.value ?? 0, icon: Clock3, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' },
    { label: 'الأذونات', value: dashboard.kpis.permissions?.value ?? 0, icon: ClipboardCheck, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' },
  ];
  const stats = [
    { label: 'الطلاب', value: dashboard.totals?.students ?? dashboard.totalStudents ?? 0, hint: 'كل الصفوف', icon: Users, tone: 'from-violet-600 to-indigo-500', soft: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'المعلمين', value: dashboard.totals?.teachers ?? dashboard.totalTeachers ?? 0, hint: 'المعلمون', icon: BookOpen, tone: 'from-emerald-500 to-green-400', soft: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'المواد الدراسية', value: subjectCount, hint: 'المواد', icon: GraduationCap, tone: 'from-indigo-500 to-violet-500', soft: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'الاختبارات', value: assessmentCount, hint: 'التقييمات المسجلة', icon: ClipboardCheck, tone: 'from-amber-500 to-orange-400', soft: 'bg-amber-50 dark:bg-amber-500/10' },
  ];
  const quickActions = [
    { label: 'إضافة مادة', href: '/subjects', icon: BookOpen, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'تسجيل حضور', href: '/attendance', icon: ClipboardCheck, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
    { label: 'إرسال رسالة', href: '/messages', icon: Mail, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'إضافة طالب', href: '/students', icon: UserPlus, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
  ];

  return (
    <div dir="rtl" className="space-y-5 pb-5 text-slate-900 dark:text-slate-100">
      <section className={`${cardClass} relative min-h-[156px] overflow-hidden px-5 py-6 sm:px-8`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] sm:block">
          <div className="absolute bottom-6 left-16 h-10 w-32 rounded-md bg-gradient-to-b from-slate-500 to-slate-800 shadow-xl" />
          <div className="absolute bottom-5 left-10 h-2 w-44 rounded-full bg-slate-300/80 dark:bg-slate-700" />
          <div className="absolute bottom-6 left-5 h-9 w-6 rounded-t-full bg-emerald-400/70" />
          <div className="absolute left-44 top-9 h-11 w-11 rounded-full bg-amber-200/70" />
          <div className="absolute left-28 top-7 h-4 w-20 rounded-full bg-indigo-100 dark:bg-indigo-500/10" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">صباح الخير {firstName}</h1>
            <span className="text-2xl" aria-hidden="true">👋</span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatHijri(now)} — {formatGregorian(now)} م</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{schoolName || 'إدارة المدرسة'}</span>
            <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث
            </button>
          </div>
        </div>
      </section>

      <section aria-label="إحصاءات المدرسة" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, tone, soft }) => (
          <article key={label} className={`${cardClass} flex min-h-[116px] items-center gap-4 p-4 sm:p-5`}>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${soft}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-sm`}><Icon className="h-5 w-5" /></span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{new Intl.NumberFormat('ar-EG').format(value)}</p>
              <p className="mt-1 truncate text-[10px] text-slate-400">{hint}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_365px]">
        <div className="space-y-5">
          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-base font-bold"><Clock3 className="h-5 w-5 text-violet-600" /> آخر الإجراءات</h2>
              <Link href="/notifications" className="text-xs font-semibold text-violet-600 hover:text-violet-700">عرض الجميع</Link>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              {recentActions.length ? recentActions.map((item) => {
                const tone = actionTone(item.type);
                const Icon = tone.icon;
                return (
                  <Link key={`${item.type}-${item.id}`} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5 ${tone.row}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.shell}`}><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.student?.name || item.description || 'تم تحديث بيانات النظام'}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-400">{formatTimeAgo(item.occurredAt)}</span>
                  </Link>
                );
              }) : (
                <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-2 text-sm font-semibold">لا توجد إجراءات تحتاج مراجعة الآن</p></div>
              )}
            </div>
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-base font-bold text-violet-700 dark:text-violet-300"><Megaphone className="h-5 w-5" /> إعلانات مهمة</h2>
              <Link href="/notifications" className="text-xs font-semibold text-violet-600">عرض جميع الإعلانات</Link>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
              {(announcements.length ? announcements : dashboard.alerts.slice(0, 2)).map((item) => (
                <Link key={`announcement-${item.id}`} href={item.href} className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4 hover:bg-violet-50 dark:border-violet-500/10 dark:bg-violet-500/[0.06]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-white/10"><BellRing className="h-4 w-4" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{item.description || formatGregorian(new Date(item.occurredAt))}</p></div>
                </Link>
              ))}
              {!dashboard.alerts.length && <p className="col-span-full py-4 text-center text-xs text-slate-500">ستظهر إعلانات المدرسة والإشعارات الجديدة هنا.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="flex items-center gap-2 text-base font-bold"><CalendarDays className="h-5 w-5 text-violet-600" /> التقويم</h2>
              <span className="text-[11px] text-slate-400">{formatHijri(now)}</span>
            </div>
            <div className="grid grid-cols-5 gap-2 p-5">
              {calendarDays.map((date) => {
                const active = date.toDateString() === now.toDateString();
                return <div key={date.toISOString()} className={`rounded-xl py-3 text-center ${active ? 'bg-gradient-to-b from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20' : 'border border-slate-100 bg-slate-50 text-slate-600 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300'}`}><p className="text-[10px]">{new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(date)}</p><p className="mt-1 text-lg font-black">{date.getDate()}</p></div>;
              })}
            </div>
            <div className="border-t border-slate-100 p-5 dark:border-white/10">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Zap className="h-4 w-4 text-violet-600" /> إجراءات سريعة</h3>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map(({ label, href, icon: Icon, tone }) => <Link key={label} href={href} className="group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-1 text-center hover:border-violet-200 hover:bg-violet-50/50 dark:border-white/5 dark:bg-white/[0.03]"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span><span className="text-[10px] font-bold leading-4">{label}</span></Link>)}
              </div>
            </div>
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-base font-bold"><Sparkles className="h-5 w-5 text-violet-600" /> ملخص اليوم</h2>
              <Link href="/attendance" className="text-xs font-semibold text-violet-600">التفاصيل</Link>
            </div>
            <div className="space-y-3 p-4">
              {todaySummary.map(({ label, value, icon: Icon, tone }) => <Link key={label} href="/attendance" className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/[0.03]"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span><span className="flex-1 text-sm font-semibold">{label}</span><span className="text-lg font-black tabular-nums">{new Intl.NumberFormat('ar-EG').format(value)}</span></Link>)}
            </div>
            <Link href="/reports" className="flex min-h-12 items-center gap-2 border-t border-slate-100 px-5 text-xs font-bold text-violet-600 hover:bg-violet-50/50 dark:border-white/10 dark:hover:bg-white/[0.03]">عرض التقرير الكامل <ArrowLeft className="h-4 w-4" /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
