'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarClock, Flag, GraduationCap, ShieldAlert, ThumbsDown, ThumbsUp, UserSquare2 } from 'lucide-react';
import { attendanceApi, behaviorApi, gradesApi, studentsApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { getAssessmentTypeLabel, getSubjectDisplayName } from '@/lib/grade-utils';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import type { AttendanceRecord, AttendanceSummary, BehaviorRecord, Student, StudentGradeProfileResponse } from '@/types';
import { formatDate, fullName, getAttendanceBadgeColor } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AlertBanner from '@/components/ui/AlertBanner';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import { PageSpinner } from '@/components/ui/Spinner';

const academicLevelBadgeStyles = {
  excellent: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export default function StudentPortalPage() {
  const { user } = useAuthStore();
  const canViewPortal = hasAnyRole(user?.role, roleGroups.students);

  const profileQuery = useQuery<Student | null>({
    queryKey: ['student-me'],
    queryFn: () => studentsApi.getMe().then((response) => response.data.data ?? null),
    enabled: canViewPortal,
    staleTime: 30_000,
  });

  const studentId = profileQuery.data?._id;

  const attendanceQuery = useQuery({
    queryKey: ['student-portal-attendance', studentId],
    queryFn: () => attendanceApi.list({ studentId, limit: 8 }).then((response) => response.data),
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  const behaviorQuery = useQuery({
    queryKey: ['student-portal-behavior', studentId],
    queryFn: () => behaviorApi.list({ studentId, limit: 8 }).then((response) => response.data),
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  const summaryQuery = useQuery<AttendanceSummary>({
    queryKey: ['student-portal-summary', studentId],
    queryFn: () => attendanceApi.getSummary(studentId!, {}).then((response) => response.data.data),
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  const gradeProfileQuery = useQuery<StudentGradeProfileResponse>({
    queryKey: ['student-portal-grade-profile', studentId],
    queryFn: () => gradesApi.getStudentProfile(studentId!).then(getEntityPayload<StudentGradeProfileResponse>),
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  if (!canViewPortal) {
    return (
      <RestrictedAccessState
        icon={UserSquare2}
        description="هذه الصفحة متاحة لحسابات الطلاب فقط."
      />
    );
  }

  if (profileQuery.isLoading) {
    return <PageSpinner />;
  }

  if (profileQuery.error) {
    return (
      <AlertBanner variant="error">
        {getApiErrorMessage(profileQuery.error, 'تعذر تحميل بيانات بوابة الطالب.')}
      </AlertBanner>
    );
  }

  const student = profileQuery.data;
  if (!student) {
    return (
      <EmptyState
        title="لا توجد بيانات طالب"
        description="تعذر العثور على ملف الطالب المرتبط بهذا الحساب."
      />
    );
  }

  const attendanceRecords: AttendanceRecord[] = attendanceQuery.data?.data ?? [];
  const behaviorRecords: BehaviorRecord[] = behaviorQuery.data?.data ?? [];
  const attendanceSummary = summaryQuery.data;
  const behaviorTotal = behaviorQuery.data?.meta?.total ?? behaviorRecords.length;
  const gradeProfile = gradeProfileQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="بوابة الطالب"
        description="اطلع على حضورك، سلوكك، وتحصيلك الأكاديمي بحسب المواد الدراسية."
      />

      {(attendanceQuery.error || behaviorQuery.error || summaryQuery.error || gradeProfileQuery.error) && (
        <AlertBanner variant="error">
          {getApiErrorMessage(attendanceQuery.error || behaviorQuery.error || summaryQuery.error || gradeProfileQuery.error, 'تعذر تحميل بعض بيانات الطالب.')}
        </AlertBanner>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-stroke bg-glaze/[0.02] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={student.userId.name} size="xl" />
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-2xl font-bold text-ink">{fullName(student.userId.name)}</h2>
                <p className="text-sm text-ink-dim">رقم الهوية: {student.nationalId}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">
                  {student.classId?.name || '—'} - صف {student.classId?.grade || '—'}
                </Badge>
                {student.classId?.section && <Badge variant="purple">الشعبة {student.classId.section}</Badge>}
                <Badge variant={student.isActive ? 'success' : 'danger'}>
                  {student.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
                <Badge variant={student.gender === 'male' ? 'info' : student.gender === 'female' ? 'purple' : 'default'}>
                  {student.gender === 'male' ? 'ذكر' : student.gender === 'female' ? 'أنثى' : 'غير محدد'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-stroke bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-dim">
                <BookOpen className="h-4 w-4 text-gold-400" /> معلومات الصف
              </div>
              <p className="mt-3 text-lg font-semibold text-ink">
                {student.classId?.name || 'غير محدد'}
              </p>
              <p className="mt-1 text-sm text-ink-faint">الصف {student.classId?.grade || '—'}</p>
            </div>

            <div className="rounded-xl border border-stroke bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-dim">
                <UserSquare2 className="h-4 w-4 text-gold-400" /> ولي الأمر
              </div>
              <p className="mt-3 text-lg font-semibold text-ink">
                {fullName(student.parentId?.userId?.name)}
              </p>
              <p className="mt-1 text-sm text-ink-faint">{student.parentId?.userId?.phone || '—'}</p>
            </div>

            <div className="rounded-xl border border-stroke bg-white/70 p-4 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-dim">
                <ShieldAlert className="h-4 w-4 text-gold-400" /> حالات خاصة
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {student.specialStatus?.length
                  ? student.specialStatus.map((status) => (
                    <Badge key={status} variant="warning">{status}</Badge>
                  ))
                  : <span className="text-sm text-ink-faint">لا توجد حالات خاصة مسجلة.</span>}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard title="السجلات الكلية" value={attendanceSummary?.total ?? 0} icon={CalendarClock} />
          <StatCard title="مرات الغياب" value={attendanceSummary?.absence ?? 0} icon={ShieldAlert} iconColor="text-red-400" />
          <StatCard title="ملاحظات السلوك" value={behaviorTotal} icon={Flag} iconColor="text-amber-400" />
          <StatCard
            title="متوسط التحصيل"
            value={`${gradeProfile?.overview.averagePercentage ?? 0}%`}
            icon={GraduationCap}
            iconColor="text-sky-400"
            trend={gradeProfile?.overview.academicLevel?.label || 'لا توجد تقييمات'}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="rounded-2xl border border-stroke bg-glaze/[0.02]">
          <div className="border-b border-stroke px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">المواد الدراسية والتحصيل</h3>
          </div>
          <div className="space-y-3 px-5 py-4">
            {gradeProfileQuery.isLoading ? (
              <PageSpinner />
            ) : gradeProfile?.subjects.length ? (
              gradeProfile.subjects.map((subjectSummary) => (
                <div key={subjectSummary.subject._id} className="rounded-xl border border-stroke bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{getSubjectDisplayName(subjectSummary.subject)}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {subjectSummary.teachers.length
                          ? subjectSummary.teachers.map((teacher) => fullName(teacher.name)).join('، ')
                          : 'لم يتم تعيين معلم بعد'}
                      </p>
                    </div>
                    <div className="text-end">
                      {subjectSummary.academicLevel ? (
                        <Badge className={academicLevelBadgeStyles[subjectSummary.academicLevel.key]}>
                          {subjectSummary.academicLevel.label}
                        </Badge>
                      ) : (
                        <Badge variant="default">بدون تقييمات</Badge>
                      )}
                      <p className="mt-2 text-sm font-medium text-ink">
                        {subjectSummary.averagePercentage !== null ? `${subjectSummary.averagePercentage}%` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                    <span>التقييمات: {subjectSummary.assessmentCount}</span>
                    <span>•</span>
                    <span>أعلى نتيجة: {subjectSummary.highestPercentage !== null ? `${subjectSummary.highestPercentage}%` : '—'}</span>
                    <span>•</span>
                    <span>آخر تقييم: {subjectSummary.latestRecord ? `${subjectSummary.latestRecord.title} (${subjectSummary.latestRecord.percentage}%)` : 'لا يوجد'}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="لا توجد درجات مسجلة"
                description="ستظهر هنا المواد والنتائج بعد تسجيل التقييمات من قبل المعلمين."
                className="py-14"
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-stroke bg-glaze/[0.02]">
          <div className="border-b border-stroke px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">آخر التقييمات الأكاديمية</h3>
          </div>
          <div className="space-y-3 px-5 py-4">
            {gradeProfileQuery.isLoading ? (
              <PageSpinner />
            ) : gradeProfile?.recentAssessments.length ? (
              gradeProfile.recentAssessments.map((assessment) => (
                <div key={assessment._id} className="rounded-xl border border-stroke bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{assessment.title}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {assessment.subject ? getSubjectDisplayName(assessment.subject) : 'مادة غير محددة'} • {getAssessmentTypeLabel(assessment.assessmentType)}
                      </p>
                    </div>
                    <Badge className={assessment.percentage >= 90 ? academicLevelBadgeStyles.excellent : assessment.percentage >= 75 ? academicLevelBadgeStyles.healthy : assessment.percentage >= 60 ? academicLevelBadgeStyles.watch : academicLevelBadgeStyles.critical}>
                      {assessment.percentage}%
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">{assessment.score} / {assessment.maxScore} • {formatDate(assessment.examDate)}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="لا توجد تقييمات حديثة"
                description="عند تسجيل أي اختبار أو واجب جديد سيظهر هنا مباشرة."
                className="py-14"
              />
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stroke bg-glaze/[0.02]">
          <div className="border-b border-stroke px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">آخر سجلات الحضور</h3>
          </div>
          <div className="divide-y divide-glaze/[0.05]">
            {attendanceQuery.isLoading ? (
              <div className="px-5 py-10"><PageSpinner /></div>
            ) : attendanceRecords.length ? (
              attendanceRecords.map((record) => (
                <div key={record._id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{formatDate(record.date)}</p>
                    <p className="mt-1 text-xs text-ink-faint">{record.notes || 'لا توجد ملاحظات إضافية.'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getAttendanceBadgeColor(record.type)}`}>
                    {record.type === 'absence' ? 'غياب' : record.type === 'late' ? 'تأخر' : 'إذن'}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState
                title="لا توجد سجلات حضور"
                description="لن تظهر هنا إلا السجلات الخاصة بحسابك الحالي."
                className="py-14"
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-stroke bg-glaze/[0.02]">
          <div className="border-b border-stroke px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">آخر ملاحظات السلوك</h3>
          </div>
          <div className="divide-y divide-glaze/[0.05]">
            {behaviorQuery.isLoading ? (
              <div className="px-5 py-10"><PageSpinner /></div>
            ) : behaviorRecords.length ? (
              behaviorRecords.map((record) => (
                <div key={record._id} className="flex items-start gap-3 px-5 py-4">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                    record.type === 'positive' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {record.type === 'positive'
                      ? <ThumbsUp className="h-4 w-4" />
                      : <ThumbsDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{record.category || (record.type === 'positive' ? 'سلوك إيجابي' : 'ملاحظة سلوكية')}</p>
                      <Badge variant={record.type === 'positive' ? 'success' : 'danger'}>
                        {record.type === 'positive' ? 'إيجابي' : 'سلبي'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-dim">{record.description}</p>
                    <p className="mt-2 text-xs text-ink-faint">{formatDate(record.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="لا توجد ملاحظات سلوك"
                description="ستظهر هنا الملاحظات المرتبطة بملفك الطلابي فقط."
                className="py-14"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}