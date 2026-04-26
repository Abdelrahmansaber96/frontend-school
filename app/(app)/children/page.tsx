'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import { parentsApi, attendanceApi, behaviorApi, gradesApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { getAssessmentTypeLabel, getSubjectDisplayName } from '@/lib/grade-utils';
import { Student, AttendanceRecord, BehaviorRecord, StudentGradeProfileResponse } from '@/types';
import { fullName, formatDate, getAttendanceBadgeColor } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AlertBanner from '@/components/ui/AlertBanner';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ThumbsUp, ThumbsDown, CalendarX, GraduationCap } from 'lucide-react';

const academicLevelBadgeStyles = {
  excellent: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export default function ChildrenPage() {
  const { user } = useAuthStore();
  const [activeChild, setActiveChild] = useState<Student | null>(null);
  const canViewChildren = hasAnyRole(user?.role, roleGroups.parents);

  const { data: parentProfile, isLoading: loadingParent } = useQuery({
    queryKey: ['parent-me'],
    queryFn: () => parentsApi.getMe().then((r) => r.data.data ?? null),
    enabled: canViewChildren,
  });

  const children: Student[] = parentProfile?.children ?? [];
  const selectedChild = children.find((child) => child._id === activeChild?._id) ?? children[0] ?? null;

  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['child-attendance', selectedChild?._id],
    queryFn: () =>
      attendanceApi
        .list({ studentId: selectedChild!._id, limit: 10 })
        .then((r) => r.data.data ?? []),
    enabled: !!selectedChild,
  });

  const { data: behaviorData, isLoading: loadingBehavior } = useQuery({
    queryKey: ['child-behavior', selectedChild?._id],
    queryFn: () =>
      behaviorApi
        .list({ studentId: selectedChild!._id, limit: 10 })
        .then((r) => r.data.data ?? []),
    enabled: !!selectedChild,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['child-attendance-summary', selectedChild?._id],
    queryFn: () =>
      attendanceApi.getSummary(selectedChild!._id).then((r) => r.data.data),
    enabled: !!selectedChild,
  });

  const { data: gradeProfile, isLoading: loadingGrades, error: gradeError } = useQuery<StudentGradeProfileResponse>({
    queryKey: ['child-grade-profile', selectedChild?._id],
    queryFn: () => gradesApi.getStudentProfile(selectedChild!._id).then(getEntityPayload<StudentGradeProfileResponse>),
    enabled: !!selectedChild,
    staleTime: 30_000,
  });

  if (!canViewChildren) {
    return (
      <RestrictedAccessState
        icon={CalendarX}
        description="هذه الصفحة مخصصة لحسابات أولياء الأمور فقط."
      />
    );
  }

  if (loadingParent) return <PageSpinner />;

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-20 text-center shadow-sm">
        <CalendarX className="h-12 w-12 text-gray-200" />
        <h3 className="mt-4 text-base font-medium text-gray-500">لا يوجد أبناء</h3>
        <p className="mt-1 text-sm text-gray-400">حسابك لا يضم طلاباً مرتبطين حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="أبنائي"
        description="تابع حضور أبنائك وسلوكهم وتحصلهم الأكاديمي بحسب المواد الدراسية"
      />

      {gradeError && (
        <AlertBanner variant="warning">
          {getApiErrorMessage(gradeError, 'تعذر تحميل ملف التحصيل الأكاديمي لهذا الطالب.')}
        </AlertBanner>
      )}

      {/* Child selector tabs */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setActiveChild(child)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                (activeChild?._id ?? children[0]._id) === child._id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Avatar name={child.userId.name} size="sm" />
              {fullName(child.userId.name)}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          {/* Child Info card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <Avatar name={selectedChild.userId.name} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{fullName(selectedChild.userId.name)}</h2>
                <p className="text-sm text-gray-500">رقم الهوية: {selectedChild.nationalId}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="info">
                    {selectedChild.classId?.name} — صف {selectedChild.classId?.grade}
                  </Badge>
                  <Badge variant={selectedChild.gender === 'male' ? 'info' : 'purple'}>
                    {selectedChild.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </Badge>
                  <Badge variant={selectedChild.isActive ? 'success' : 'danger'}>
                    {selectedChild.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Attendance summary */}
            {summaryData && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'إجمالي السجلات', value: summaryData.total ?? 0, color: 'text-gray-900' },
                  { label: 'غيابات', value: summaryData.absence ?? 0, color: 'text-red-600' },
                  { label: 'تأخرات', value: summaryData.late ?? 0, color: 'text-yellow-600' },
                  { label: 'إذنون', value: summaryData.permission ?? 0, color: 'text-blue-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {gradeProfile && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'متوسط التحصيل', value: `${gradeProfile.overview.averagePercentage ?? 0}%`, color: 'text-sky-600' },
                  { label: 'عدد المواد', value: gradeProfile.overview.subjectsCount, color: 'text-gray-900' },
                  { label: 'مواد ناجحة', value: gradeProfile.overview.passingSubjects, color: 'text-green-600' },
                  { label: 'المستوى', value: gradeProfile.overview.academicLevel?.label || '—', color: 'text-amber-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-900">المواد والتحصيل الدراسي</h3>
              </div>
              <div className="space-y-3 px-5 py-4">
                {loadingGrades ? (
                  <div className="flex justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : gradeProfile?.subjects.length ? (
                  gradeProfile.subjects.map((subjectSummary) => (
                    <div key={subjectSummary.subject._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{getSubjectDisplayName(subjectSummary.subject)}</p>
                          <p className="mt-1 text-xs text-gray-500">
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
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            {subjectSummary.averagePercentage !== null ? `${subjectSummary.averagePercentage}%` : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>التقييمات: {subjectSummary.assessmentCount}</span>
                        <span>•</span>
                        <span>أعلى نتيجة: {subjectSummary.highestPercentage !== null ? `${subjectSummary.highestPercentage}%` : '—'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="لا توجد درجات مسجلة"
                    description="ستظهر نتائج المواد هنا بعد تسجيل التقييمات لهذا الطالب."
                    className="py-10"
                  />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-900">آخر التقييمات</h3>
                </div>
              </div>
              <div className="space-y-3 px-5 py-4">
                {loadingGrades ? (
                  <div className="flex justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : gradeProfile?.recentAssessments.length ? (
                  gradeProfile.recentAssessments.map((assessment) => (
                    <div key={assessment._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{assessment.title}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {assessment.subject ? getSubjectDisplayName(assessment.subject) : 'مادة غير محددة'} • {getAssessmentTypeLabel(assessment.assessmentType)}
                          </p>
                        </div>
                        <Badge className={assessment.percentage >= 90 ? academicLevelBadgeStyles.excellent : assessment.percentage >= 75 ? academicLevelBadgeStyles.healthy : assessment.percentage >= 60 ? academicLevelBadgeStyles.watch : academicLevelBadgeStyles.critical}>
                          {assessment.percentage}%
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{assessment.score} / {assessment.maxScore} • {formatDate(assessment.examDate)}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">لا توجد تقييمات حديثة</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent records */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Attendance */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-900">سجلات الحضور الأخيرة</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingAttendance ? (
                  <div className="flex justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : (attendanceData as AttendanceRecord[])?.length ? (
                  (attendanceData as AttendanceRecord[]).map((rec) => (
                    <div key={rec._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(rec.date)}</p>
                        {rec.notes && <p className="text-xs text-gray-500">{rec.notes}</p>}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getAttendanceBadgeColor(rec.type)}`}>
                        {({'absence': 'غياب', 'late': 'تأخر', 'permission': 'إذن'} as Record<string, string>)[rec.type] ?? rec.type}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">لا توجد سجلات حضور</p>
                )}
              </div>
            </div>

            {/* Recent Behavior */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-900">سجلات السلوك الأخيرة</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingBehavior ? (
                  <div className="flex justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : (behaviorData as BehaviorRecord[])?.length ? (
                  (behaviorData as BehaviorRecord[]).map((rec) => (
                    <div key={rec._id} className="flex items-start gap-3 px-5 py-3">
                      <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        rec.type === 'positive' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {rec.type === 'positive'
                          ? <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                          : <ThumbsDown className="h-3.5 w-3.5 text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 line-clamp-2">{rec.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(rec.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">لا توجد سجلات سلوك</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
