'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BellRing,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import type { OperationalDashboard } from '@/types';

interface Props {
  dashboard: OperationalDashboard;
  firstName: string;
  schoolName?: string | null;
}

const cardClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(78,70,150,0.06)] dark:border-white/10 dark:bg-navy-800/80';
const formatHijri = (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
const formatGregorian = (date: Date) => new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
const formatShortDate = (value: string) => new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(value));

export default function StudentDashboard({ dashboard, firstName, schoolName }: Props) {
  const now = new Date();
  const child = dashboard.children[0] || null;
  const absences = child?.absences ?? dashboard.kpis.absences?.value ?? 0;
  const lates = child?.lates ?? dashboard.kpis.lates?.value ?? 0;
  const permissions = child?.permissions ?? dashboard.kpis.permissions?.value ?? 0;
  const negativeBehaviors = child?.negativeBehaviors ?? dashboard.kpis.negativeBehaviors?.value ?? 0;
  const attendanceRate = Math.max(0, Math.min(100, Math.round(((dashboard.period.days - absences) / Math.max(dashboard.period.days, 1)) * 100)));
  const behaviorScore = Math.max(0, 100 - (negativeBehaviors * 5));
  const classRank = dashboard.academic.length ? Math.max(1, Math.min(9, 10 - Math.round((dashboard.academic.reduce((total, grade) => total + grade.percentage, 0) / dashboard.academic.length) / 12))) : null;
  const announcements = dashboard.alerts.filter((item) => item.type === 'unread_notification').slice(0, 3);
  const weeklyDays = dashboard.weeklyTrend.slice(-7);
  const highGrades = dashboard.academic.filter((grade) => grade.percentage >= 85).slice(0, 3);
  const stats = [
    { label: 'النقاط السلوكية', value: behaviorScore, suffix: '', hint: behaviorScore >= 85 ? 'ممتاز' : 'يحتاج متابعة', icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'معدل الحضور', value: attendanceRate, suffix: '%', hint: attendanceRate >= 90 ? 'ممتاز' : 'خلال 30 يومًا', icon: UserCheck, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
    { label: 'عدد الغيابات', value: absences, suffix: '', hint: 'خلال 30 يومًا', icon: Users, tone: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
    { label: 'عدد التأخيرات', value: lates, suffix: '', hint: 'خلال 30 يومًا', icon: Clock3, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10' },
    { label: 'ترتيبك التقديري', value: classRank ?? 0, suffix: classRank ? '' : '—', hint: child?.class?.name || 'الفصل الدراسي', icon: Trophy, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
  ];

  return (
    <div dir="rtl" className="space-y-5 pb-5 text-slate-900 dark:text-slate-100">
      <section className={`${cardClass} relative min-h-[170px] overflow-hidden bg-gradient-to-l from-violet-50 via-indigo-50/70 to-white px-5 py-7 dark:from-violet-500/10 dark:via-indigo-500/5 dark:to-navy-800 sm:px-8`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] sm:block">
          <div className="absolute bottom-7 left-7 h-3 w-56 rounded-full bg-amber-300/60" />
          <div className="absolute bottom-10 left-14 h-16 w-14 rounded-lg bg-gradient-to-b from-indigo-500 to-violet-700 shadow-xl"><span className="absolute -top-3 left-3 h-4 w-8 rounded-full border-4 border-indigo-600" /></div>
          <div className="absolute bottom-10 left-32 h-12 w-5 rounded-t-full bg-emerald-400" />
          <div className="absolute bottom-10 left-44 h-10 w-4 rotate-6 rounded-t-full bg-amber-400" />
          <div className="absolute left-24 top-8 text-3xl text-indigo-400/70">✈</div>
          <div className="absolute left-52 top-6 text-lg text-amber-400">✦</div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-black sm:text-3xl">مرحبًا بك {firstName} <span aria-hidden="true">👋</span></h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-300">نتمنى لك يومًا دراسيًا مليئًا بالنجاح والتفوق ✨</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><CalendarDays className="h-4 w-4 text-violet-600" /> {formatHijri(now)} — {formatGregorian(now)} م</p>
          <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-300">{schoolName || 'المدرسة'}</span>{child?.class && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300">{child.class.grade} — {child.class.name}</span>}</div>
        </div>
      </section>

      <section aria-label="ملخص أداء الطالب" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, suffix, hint, icon: Icon, tone }) => <article key={label} className={`${cardClass} flex min-h-[112px] items-center gap-3 p-4`}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-black tabular-nums">{suffix === '—' ? '—' : `${new Intl.NumberFormat('ar-EG').format(value)}${suffix}`}</p><p className="mt-1 truncate text-[10px] font-semibold text-emerald-600">{hint}</p></div></article>)}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10"><h2 className="flex items-center gap-2 text-base font-black"><Users className="h-5 w-5 text-violet-600" /> الحضور والغياب</h2><Link href="/attendance" className="text-xs font-bold text-violet-600">عرض التفاصيل</Link></div>
            <div className="grid gap-5 p-5 lg:grid-cols-[190px_minmax(0,1fr)]">
              <div className="text-center"><div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#22c55e ${attendanceRate * 3.6}deg, #e8eef5 0deg)` }}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-navy-800"><span className="text-3xl font-black">{attendanceRate}%</span><span className="mt-1 text-[10px] text-slate-500">معدل الحضور</span></div></div><p className="mt-3 text-xs font-bold text-emerald-600">{attendanceRate >= 90 ? 'ممتاز' : 'استمر في تحسين التزامك'}</p><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-500/10"><b className="text-emerald-600">{Math.max(0, dashboard.period.days - absences)}</b><p className="text-[9px] text-slate-500">يوم ملتزم</p></div><div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-500/10"><b className="text-rose-600">{absences}</b><p className="text-[9px] text-slate-500">غياب</p></div><div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-500/10"><b className="text-amber-600">{lates}</b><p className="text-[9px] text-slate-500">تأخر</p></div></div></div>
              <div><p className="mb-4 text-center text-xs font-bold text-slate-500">آخر سبعة أيام</p><div className="grid grid-cols-7 gap-2">{weeklyDays.map((day) => { const absent = day.absences > 0; const late = day.lates > 0; const permission = day.permissions > 0; const Icon = absent ? Users : late ? Clock3 : permission ? CalendarDays : Check; const tone = absent ? 'bg-rose-500 text-white' : late ? 'bg-amber-500 text-white' : permission ? 'bg-violet-500 text-white' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'; return <div key={day.date} className="text-center"><p className="mb-2 text-[9px] text-slate-400">{new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(new Date(day.date))}</p><span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></span><p className="mt-2 text-[9px] text-slate-400">{new Date(day.date).getDate()}</p></div>; })}</div><div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] text-slate-500"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ملتزم</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-rose-500" /> غائب</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" /> متأخر</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" /> إذن</span></div><div className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-white/[0.03]">لديك <b className="text-violet-600">{permissions}</b> إذن خلال الفترة الحالية</div></div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-3">
            <section className={`${cardClass} overflow-hidden`}><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10"><ClipboardCheck className="h-5 w-5 text-violet-600" /><h2 className="text-sm font-black">أحدث النتائج</h2></div><div className="space-y-2 p-3">{dashboard.academic.slice(0, 3).map((grade) => <Link key={grade._id} href="/grades" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${grade.percentage >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{grade.percentage}%</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{grade.title}</p><p className="mt-1 truncate text-[9px] text-slate-500">{grade.subject?.name || 'مادة دراسية'}</p></div></Link>)}{!dashboard.academic.length && <p className="py-8 text-center text-xs text-slate-500">لا توجد نتائج منشورة بعد.</p>}</div><Link href="/grades" className="flex min-h-11 items-center gap-2 border-t border-slate-100 px-4 text-[11px] font-bold text-violet-600 dark:border-white/10">عرض جميع النتائج <ArrowLeft className="h-3.5 w-3.5" /></Link></section>

            <section className={`${cardClass} overflow-hidden`}><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10"><Trophy className="h-5 w-5 text-violet-600" /><h2 className="text-sm font-black">مشاركتي وإنجازاتي</h2></div><div className="grid grid-cols-3 gap-2 p-4">{(highGrades.length ? highGrades : dashboard.academic.slice(0, 3)).map((grade, index) => { const Icon = [ShieldCheck, Medal, Award][index] || Star; return <div key={`achievement-${grade._id}`} className="text-center"><span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${['bg-violet-50 text-violet-600', 'bg-orange-50 text-orange-600', 'bg-amber-50 text-amber-600'][index]}`}><Icon className="h-6 w-6" /></span><p className="mt-2 line-clamp-2 text-[10px] font-black">{grade.title}</p><p className="mt-1 text-[9px] text-slate-400">{grade.percentage}%</p></div>})}{!dashboard.academic.length && <p className="col-span-3 py-8 text-center text-xs text-slate-500">ستظهر إنجازاتك هنا.</p>}</div><Link href="/grades" className="flex min-h-11 items-center gap-2 border-t border-slate-100 px-4 text-[11px] font-bold text-violet-600 dark:border-white/10">عرض جميع الإنجازات <ArrowLeft className="h-3.5 w-3.5" /></Link></section>

            <section className={`${cardClass} overflow-hidden`}><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10"><ShieldCheck className="h-5 w-5 text-violet-600" /><h2 className="text-sm font-black">السلوك</h2></div><div className="p-5 text-center"><div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl ${behaviorScore >= 85 ? 'bg-emerald-100' : 'bg-amber-100'}`}>{behaviorScore >= 85 ? '🙂' : '💪'}</div><p className="mt-3 text-lg font-black">{behaviorScore >= 85 ? 'ممتاز' : 'جيد'}</p><p className="mt-2 text-xs leading-5 text-slate-500">{negativeBehaviors ? `لديك ${negativeBehaviors} ملاحظة سلوكية خلال الفترة.` : 'أنت ملتزم بقوانين المدرسة، استمر في هذا التميز.'}</p></div></section>
          </div>
        </div>

        <aside className="space-y-5">
          <section className={`${cardClass} overflow-hidden`}><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10"><h2 className="flex items-center gap-2 text-base font-black"><BellRing className="h-5 w-5 text-violet-600" /> الإعلانات</h2><Link href="/notifications" className="text-xs font-bold text-violet-600">عرض الكل</Link></div><div className="space-y-2 p-4">{announcements.map((item, index) => <Link key={item.id} href={item.href} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${['bg-violet-500', 'bg-orange-500', 'bg-emerald-500'][index]}`} /><div className="min-w-0"><p className="truncate text-xs font-black">{item.title}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{item.description || 'إشعار جديد من المدرسة'}</p><p className="mt-2 text-[9px] text-slate-400">{formatShortDate(item.occurredAt)}</p></div></Link>)}{!announcements.length && <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" /><p className="mt-2 text-xs font-bold">لا توجد إعلانات جديدة</p></div>}</div></section>

          <section className={`${cardClass} overflow-hidden`}><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10"><h2 className="flex items-center gap-2 text-base font-black"><CalendarDays className="h-5 w-5 text-violet-600" /> أحدث التقييمات</h2><Link href="/grades" className="text-xs font-bold text-violet-600">عرض الكل</Link></div><div className="space-y-2 p-4">{dashboard.academic.slice(0, 4).map((item, index) => <Link key={`appointment-${item._id}`} href="/grades" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]"><span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl ${['bg-rose-50 text-rose-600', 'bg-emerald-50 text-emerald-600', 'bg-violet-50 text-violet-600', 'bg-blue-50 text-blue-600'][index]}`}><b className="text-sm">{new Date(item.examDate).getDate()}</b><small className="text-[8px]">{new Intl.DateTimeFormat('ar-EG', { month: 'short' }).format(new Date(item.examDate))}</small></span><div className="min-w-0"><p className="truncate text-xs font-black">{item.title}</p><p className="mt-1 truncate text-[10px] text-slate-500">{item.subject?.name || 'تقييم دراسي'} — {item.percentage}%</p></div></Link>)}{!dashboard.academic.length && <p className="py-8 text-center text-xs text-slate-500">لا توجد تقييمات حتى الآن.</p>}</div></section>

          <section className={`${cardClass} p-4`}><h2 className="mb-3 flex items-center gap-2 text-sm font-black"><Sparkles className="h-4 w-4 text-violet-600" /> وصول سريع</h2><div className="grid grid-cols-3 gap-2"><Link href="/subjects" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl bg-indigo-50 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"><BookOpen className="h-5 w-5" /> المواد</Link><Link href="/grades" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><GraduationCap className="h-5 w-5" /> النتائج</Link><Link href="/profile" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl bg-violet-50 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"><Star className="h-5 w-5" /> ملفي</Link></div></section>
        </aside>
      </div>
    </div>
  );
}
