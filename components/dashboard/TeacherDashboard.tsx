'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { attendanceApi, studentsApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-contracts';
import { fullName } from '@/lib/utils';
import type { AttendanceRecord, OperationalDashboard, Student } from '@/types';

type StudentStatus = 'present' | 'absence' | 'late' | 'permission';

interface Props {
  dashboard: OperationalDashboard;
  firstName: string;
  schoolName?: string | null;
  loading: boolean;
  onRefresh: () => void;
}

const cardClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(78,70,150,0.06)] dark:border-white/10 dark:bg-navy-800/80';
const todayKey = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const statusOptions: Array<{ value: StudentStatus; label: string; tone: string }> = [
  { value: 'present', label: 'حاضر', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300' },
  { value: 'absence', label: 'غائب', tone: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300' },
  { value: 'late', label: 'متأخر', tone: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300' },
  { value: 'permission', label: 'مأذون', tone: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300' },
];

const formatHijri = (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
const formatGregorian = (date: Date) => new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

export default function TeacherDashboard({ dashboard, firstName, schoolName, loading, onRefresh }: Props) {
  const queryClient = useQueryClient();
  const classes = dashboard.classes;
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.class._id || '');
  const [date, setDate] = useState(todayKey());
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, StudentStatus>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const selectedClass = classes.find((item) => item.class._id === selectedClassId) || classes[0] || null;

  useEffect(() => {
    if (!selectedClassId && classes[0]) setSelectedClassId(classes[0].class._id);
  }, [classes, selectedClassId]);

  const studentsQuery = useQuery({
    queryKey: ['teacher-dashboard-students', selectedClassId],
    queryFn: () => studentsApi.list({ page: 1, limit: 100, classId: selectedClassId }).then((response) => response.data.data as Student[]),
    enabled: Boolean(selectedClassId),
    staleTime: 30_000,
  });

  const attendanceQuery = useQuery({
    queryKey: ['teacher-dashboard-attendance', selectedClassId, date],
    queryFn: () => attendanceApi.list({ page: 1, limit: 100, classId: selectedClassId, date }).then((response) => response.data.data as AttendanceRecord[]),
    enabled: Boolean(selectedClassId && date),
    staleTime: 10_000,
  });

  useEffect(() => {
    const next: Record<string, StudentStatus> = {};
    (studentsQuery.data || []).forEach((student) => { next[student._id] = 'present'; });
    (attendanceQuery.data || []).forEach((record) => { next[record.studentId?._id] = record.type; });
    setStatuses(next);
  }, [attendanceQuery.data, studentsQuery.data]);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return studentsQuery.data || [];
    return (studentsQuery.data || []).filter((student) => fullName(student.userId.name).toLowerCase().includes(value) || student.nationalId.includes(value));
  }, [search, studentsQuery.data]);

  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return {
      present: values.filter((item) => item === 'present').length,
      absence: values.filter((item) => item === 'absence').length,
      late: values.filter((item) => item === 'late').length,
      permission: values.filter((item) => item === 'permission').length,
    };
  }, [statuses]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const exceptions = Object.entries(statuses).filter(([, status]) => status !== 'present');
      if (exceptions.length) {
        return attendanceApi.bulkCreate({
          classId: selectedClassId,
          date,
          records: exceptions.map(([studentId, type]) => ({ studentId, type })),
        });
      }
      const existing = attendanceQuery.data || [];
      if (existing.length) await Promise.all(existing.map((record) => attendanceApi.delete(record._id)));
      return null;
    },
    onMutate: () => setFeedback(null),
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'تم حفظ كشف الحضور بنجاح.' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teacher-dashboard-attendance', selectedClassId] }),
        queryClient.invalidateQueries({ queryKey: ['attendance'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
    onError: (error) => setFeedback({ type: 'error', message: getApiErrorMessage(error, 'تعذر حفظ كشف الحضور.') }),
  });

  const periodLabels = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];

  return (
    <div dir="rtl" className="space-y-5 pb-5 text-slate-900 dark:text-slate-100">
      <section className={`${cardClass} relative min-h-[160px] overflow-hidden px-5 py-6 sm:px-8`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[43%] sm:block">
          <div className="absolute bottom-9 left-8 h-2 w-52 rounded-full bg-indigo-300/60 dark:bg-indigo-500/20" />
          <div className="absolute bottom-11 left-24 h-12 w-28 rounded-t-lg bg-gradient-to-b from-slate-600 to-indigo-900 shadow-xl" />
          <div className="absolute bottom-11 left-48 h-12 w-6 rounded-t-full bg-emerald-400/80" />
          <div className="absolute left-8 top-6 h-20 w-32 rounded-md border-4 border-slate-400/60 bg-white dark:bg-white/10"><span className="flex h-full items-center justify-center text-xs font-bold text-slate-400">a² + b²</span></div>
          <div className="absolute bottom-11 left-2 h-7 w-16 rounded-sm bg-amber-300/70" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-black sm:text-3xl">مرحبًا بك أ. {firstName} <span aria-hidden="true">👋</span></h1>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">معلم في {schoolName || 'المدرسة'}</p>
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><CalendarDays className="h-4 w-4 text-violet-600" /> {formatHijri(new Date())} — {formatGregorian(new Date())} م</p>
          <button type="button" onClick={onRefresh} disabled={loading} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:text-violet-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث البيانات</button>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <section className={`${cardClass} p-4 sm:p-5`}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-black">فصولي</h2><Link href="/classes" className="text-xs font-bold text-violet-600">عرض الفصول</Link></div>
            {classes.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {classes.slice(0, 4).map((item, index) => {
                  const active = selectedClass?.class._id === item.class._id;
                  return <button key={item.class._id} type="button" onClick={() => { setSelectedClassId(item.class._id); setFeedback(null); }} className={`rounded-2xl border p-4 text-right transition ${active ? 'border-violet-500 bg-violet-50/60 shadow-md shadow-violet-500/10 dark:bg-violet-500/10' : 'border-slate-100 bg-white hover:border-violet-200 dark:border-white/5 dark:bg-white/[0.02]'}`}><div className="flex items-start justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-black text-white">{index + 1}</span><Users className="h-5 w-5 text-violet-600" /></div><p className="mt-4 text-sm font-black">{item.class.name}</p><p className="mt-1 text-xs text-violet-600">الصف {item.class.grade}{item.class.section ? ` — ${item.class.section}` : ''}</p><p className="mt-4 flex items-center gap-2 text-xs font-bold"><Users className="h-4 w-4" /> {item.studentCount} طالب</p><span className={`mt-4 flex min-h-9 items-center justify-center rounded-lg text-xs font-bold ${active ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'}`}>دخول الفصل</span></button>;
                })}
              </div>
            ) : <div className="py-10 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm font-bold">لم يتم إسناد فصول إلى حسابك بعد</p></div>}
          </section>

          {selectedClass && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-slate-100 px-5 pt-5 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">الدخول إلى الفصل — {selectedClass.class.name}</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{selectedClass.studentCount} طالب</span></div>
                <div className="mt-5 flex gap-5 overflow-x-auto text-xs font-bold text-slate-400"><span className="border-b-2 border-violet-600 px-2 pb-3 text-violet-700">الحضور والغياب</span><Link href={`/attendance?classId=${selectedClassId}`} className="px-2 pb-3 hover:text-violet-600">التأخير</Link><Link href={`/behavior?classId=${selectedClassId}`} className="px-2 pb-3 hover:text-violet-600">السلوك</Link><Link href={`/grades?classId=${selectedClassId}`} className="px-2 pb-3 hover:text-violet-600">الدرجات</Link></div>
              </div>

              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xs"><Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث عن طالب..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pe-10 ps-3 text-xs outline-none focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.03]" /></div>
                <div className="flex flex-wrap items-center gap-2"><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setFeedback(null); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none dark:border-white/10 dark:bg-white/5" /><Link href={`/attendance?classId=${selectedClassId}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300"><FileText className="h-4 w-4" /> كشف الحضور</Link><button type="button" disabled={saveMutation.isPending || studentsQuery.isLoading} onClick={() => saveMutation.mutate()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> {saveMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الحضور'}</button></div>
              </div>

              {feedback && <div className={`mx-4 mt-4 rounded-xl px-4 py-3 text-xs font-bold ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>{feedback.message}</div>}

              <div className="grid gap-4 p-4 lg:grid-cols-[150px_minmax(0,1fr)]">
                <aside className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]"><p className="text-xs font-bold text-slate-500">إجمالي الطلاب</p><p className="mt-1 text-2xl font-black">{studentsQuery.data?.length ?? 0}</p><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between"><span className="text-emerald-600">حاضر</span><b>{counts.present}</b></div><div className="flex justify-between"><span className="text-rose-600">غائب</span><b>{counts.absence}</b></div><div className="flex justify-between"><span className="text-amber-600">متأخر</span><b>{counts.late}</b></div><div className="flex justify-between"><span className="text-violet-600">مأذون</span><b>{counts.permission}</b></div></div><div className="mt-5 border-t border-slate-200 pt-4 text-center dark:border-white/10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[7px] border-emerald-500 text-sm font-black">{studentsQuery.data?.length ? Math.round((counts.present / studentsQuery.data.length) * 100) : 0}%</div><p className="mt-2 text-[10px] text-slate-500">نسبة الحضور</p></div></aside>
                <div>
                  {studentsQuery.isLoading || attendanceQuery.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />)}</div> : filteredStudents.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{filteredStudents.map((student, index) => { const status = statuses[student._id] || 'present'; const selectedOption = statusOptions.find((item) => item.value === status) || statusOptions[0]; return <article key={student._id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-white/[0.02]"><div className="flex items-start justify-between gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-[10px] font-black text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{index + 1}</span><p className="min-w-0 flex-1 truncate text-xs font-black">{fullName(student.userId.name)}</p></div><select aria-label={`حالة ${fullName(student.userId.name)}`} value={status} onChange={(event) => setStatuses((current) => ({ ...current, [student._id]: event.target.value as StudentStatus }))} className={`mt-3 h-9 w-full rounded-lg border px-2 text-[11px] font-bold outline-none ${selectedOption.tone}`}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></article>; })}</div> : <div className="py-12 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm font-bold">لا يوجد طلاب في هذا الفصل</p></div>}
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-4 text-[10px] text-slate-500">{statusOptions.map((option) => <span key={option.value} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${option.value === 'present' ? 'bg-emerald-500' : option.value === 'absence' ? 'bg-rose-500' : option.value === 'late' ? 'bg-amber-500' : 'bg-violet-500'}`} /> {option.label}</span>)}</div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10"><h2 className="flex items-center gap-2 text-base font-black"><CalendarDays className="h-5 w-5 text-violet-600" /> جدول اليوم</h2><span className="text-[10px] text-slate-400">فصولك المسندة</span></div>
          <div className="space-y-2 p-4">
            {classes.slice(0, 5).map((item, index) => <button key={`schedule-${item.class._id}`} type="button" onClick={() => setSelectedClassId(item.class._id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition ${selectedClassId === item.class._id ? 'bg-violet-50 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:ring-violet-500/20' : 'bg-slate-50 hover:bg-violet-50/50 dark:bg-white/[0.03]'}`}><span className={`h-2.5 w-2.5 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-fuchsia-500'][index]}`} /><div className="min-w-0 flex-1"><p className="text-xs font-black">الحصة {periodLabels[index]}</p><p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{item.class.name} — الصف {item.class.grade}</p></div><span className="text-[10px] font-bold text-violet-600">{item.studentCount} طالب</span></button>)}
            {!classes.length && <p className="py-8 text-center text-xs text-slate-500">لا توجد فصول في جدولك حاليًا.</p>}
          </div>
          <Link href="/classes" className="flex min-h-12 items-center gap-2 border-t border-slate-100 px-5 text-xs font-bold text-violet-600 hover:bg-violet-50/50 dark:border-white/10"><ArrowLeft className="h-4 w-4" /> عرض جميع الفصول</Link>
          <div className="border-t border-slate-100 p-4 dark:border-white/10"><h3 className="mb-3 text-xs font-black text-slate-500">أدوات المعلم</h3><div className="grid grid-cols-2 gap-2"><Link href="/grades" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"><BarChart3 className="h-5 w-5" /> إضافة درجة</Link><Link href="/behavior" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><ShieldCheck className="h-5 w-5" /> تسجيل سلوك</Link></div></div>
        </aside>
      </div>
    </div>
  );
}
