'use client';

import { useQuery } from '@tanstack/react-query';
import AlertBanner from '@/components/ui/AlertBanner';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import AccountActionPanel from '@/components/accounts/AccountActionPanel';
import { gradesApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { getAssessmentTypeLabel, getSubjectDisplayName } from '@/lib/grade-utils';
import { formatDate, fullName } from '@/lib/utils';
import type { Student, StudentGradeProfileResponse } from '@/types';

const getParentName = (parent: Student['parentId'] | null | undefined) => (
  parent ? fullName(parent.userId.name) : '-'
);

interface StudentDetailsModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  onStudentUpdate?: (student: Student) => void;
}

const academicLevelBadgeStyles = {
  excellent: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export default function StudentDetailsModal({ student, open, onClose, onStudentUpdate }: StudentDetailsModalProps) {
  const gradeProfileQuery = useQuery<StudentGradeProfileResponse>({
    queryKey: ['student-grade-profile', student?._id],
    queryFn: () => gradesApi.getStudentProfile(student!._id).then(getEntityPayload<StudentGradeProfileResponse>),
    enabled: open && Boolean(student?._id),
    staleTime: 60_000,
  });

  const gradeProfile = gradeProfileQuery.data;
  const academicLevel = gradeProfile?.overview.academicLevel;

  return (
    <Modal open={open} onClose={onClose} title="بيانات الطالب" size="lg">
      {student && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={student.userId.name} size="xl" />
            <div>
              <h3 className="text-lg font-semibold text-ink">{fullName(student.userId.name)}</h3>
              <p className="text-sm text-ink-faint">ID: {student.nationalId}</p>
              <StatusBadge isActive={student.userId.isActive} className="mt-1" />
            </div>
          </div>

          {gradeProfileQuery.error && (
            <AlertBanner variant="warning">
              {getApiErrorMessage(gradeProfileQuery.error, 'تعذر تحميل المواد والدرجات لهذا الطالب.')}
            </AlertBanner>
          )}

          {gradeProfileQuery.isLoading && !gradeProfile && (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-stroke border-t-gold-400" />
            </div>
          )}

          {academicLevel && gradeProfile && (
            <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">المستوى التعليمي الحالي</p>
                  <p className="mt-2 text-sm text-ink-muted">المستوى مبني على متوسط الدرجات المسجلة في المواد الدراسية.</p>
                </div>
                <div className="text-end">
                  <Badge className={academicLevelBadgeStyles[academicLevel.key]}>{academicLevel.label}</Badge>
                  <p className="mt-2 text-lg font-semibold text-ink">{gradeProfile.overview.averagePercentage ?? 0}%</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-glaze/[0.03] p-3">
                  <p className="text-xs text-ink-faint">المواد</p>
                  <p className="mt-1 font-semibold text-ink">{gradeProfile.overview.subjectsCount}</p>
                </div>
                <div className="rounded-lg bg-glaze/[0.03] p-3">
                  <p className="text-xs text-ink-faint">التقييمات</p>
                  <p className="mt-1 font-semibold text-ink">{gradeProfile.overview.totalAssessments}</p>
                </div>
                <div className="rounded-lg bg-glaze/[0.03] p-3">
                  <p className="text-xs text-ink-faint">مواد ناجحة</p>
                  <p className="mt-1 font-semibold text-ink">{gradeProfile.overview.passingSubjects}</p>
                </div>
                <div className="rounded-lg bg-glaze/[0.03] p-3">
                  <p className="text-xs text-ink-faint">آخر تقييمات</p>
                  <p className="mt-1 font-semibold text-ink">{gradeProfile.recentAssessments.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-glaze/[0.03] p-4 text-sm">
            <div>
              <span className="text-ink-faint">الفصل: </span>
              <span className="font-medium text-ink">{student.classId?.name}</span>
            </div>
            <div>
              <span className="text-ink-faint">الصف: </span>
              <span className="font-medium text-ink">{student.classId?.grade}</span>
            </div>
            <div>
              <span className="text-ink-faint">الجنس: </span>
              <span className="font-medium text-ink">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div>
              <span className="text-ink-faint">الجوال: </span>
              <span className="font-medium text-ink">{student.userId.phone}</span>
            </div>
            {student.dateOfBirth && (
              <div className="col-span-2">
                <span className="text-ink-faint">تاريخ الميلاد: </span>
                <span className="font-medium text-ink">{formatDate(student.dateOfBirth)}</span>
              </div>
            )}
            {student.parentId && (
              <div className="col-span-2">
                <span className="text-ink-faint">ولي الأمر: </span>
                <span className="font-medium text-ink">{getParentName(student.parentId)}</span>
              </div>
            )}
          </div>

          <AccountActionPanel
            account={{
              _id: student.userId._id,
              name: fullName(student.userId.name),
              isActive: student.userId.isActive,
              mustChangePassword: student.userId.mustChangePassword,
              lastLogin: student.userId.lastLogin,
            }}
            entityLabel="الطالب"
            invalidateQueryKeys={[['students'], ['accounts']]}
            onAccountUpdated={(updates) => {
              onStudentUpdate?.({
                ...student,
                userId: {
                  ...student.userId,
                  ...updates,
                },
              });
            }}
          />

          {gradeProfile && (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-xl border border-stroke bg-glaze/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-ink">المواد الدراسية ومستوى الطالب</h4>
                    <p className="mt-1 text-xs text-ink-faint">المواد مرتبطة بتوزيع المعلمين على الفصل، وتُعرض معها المتوسطات المسجلة.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {gradeProfile.subjects.length ? gradeProfile.subjects.map((subjectSummary) => (
                    <div key={subjectSummary.subject._id} className="rounded-xl border border-stroke bg-glaze/[0.03] p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{getSubjectDisplayName(subjectSummary.subject)}</p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {subjectSummary.teachers.length
                              ? subjectSummary.teachers.map((teacher) => fullName(teacher.name)).join('، ')
                              : 'لم يتم تعيين معلم للمادة بعد'}
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
                        <span>عدد التقييمات: {subjectSummary.assessmentCount}</span>
                        <span>•</span>
                        <span>أعلى نتيجة: {subjectSummary.highestPercentage !== null ? `${subjectSummary.highestPercentage}%` : '—'}</span>
                        <span>•</span>
                        <span>
                          آخر تقييم: {subjectSummary.latestRecord ? `${subjectSummary.latestRecord.title} (${subjectSummary.latestRecord.percentage}%)` : 'لا يوجد'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-ink-faint">لا توجد مواد أو تقييمات مرتبطة بهذا الطالب حتى الآن.</p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-stroke bg-glaze/[0.03] p-4">
                <h4 className="text-sm font-semibold text-ink">آخر التقييمات</h4>
                <div className="mt-3 space-y-3">
                  {gradeProfile.recentAssessments.length ? gradeProfile.recentAssessments.map((assessment) => (
                    <div key={assessment._id} className="rounded-lg border border-stroke bg-glaze/[0.03] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-ink">{assessment.title}</p>
                          <p className="mt-1 text-xs text-ink-faint">{assessment.subject ? getSubjectDisplayName(assessment.subject) : 'مادة غير محددة'} • {getAssessmentTypeLabel(assessment.assessmentType)}</p>
                        </div>
                        <Badge className={assessment.percentage >= 90 ? academicLevelBadgeStyles.excellent : assessment.percentage >= 75 ? academicLevelBadgeStyles.healthy : assessment.percentage >= 60 ? academicLevelBadgeStyles.watch : academicLevelBadgeStyles.critical}>
                          {assessment.percentage}%
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-ink-faint">{assessment.score} / {assessment.maxScore} • {formatDate(assessment.examDate)}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-ink-faint">لا توجد تقييمات مسجلة لهذا الطالب بعد.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}