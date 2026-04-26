'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpenCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { classesApi, gradesApi, studentsApi, subjectsApi, teachersApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-contracts';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { getAssessmentTypeLabel, getSubjectDisplayName } from '@/lib/grade-utils';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import type { AssessmentType, Grade } from '@/types';
import { formatDate, fullName } from '@/lib/utils';
import AlertBanner from '@/components/ui/AlertBanner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import SearchField from '@/components/ui/SearchField';
import SelectField from '@/components/ui/SelectField';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';

type ClassOption = { _id: string; name: string; grade: string; section?: string };
type SubjectOption = { _id: string; name: string; nameAr?: string; code?: string };
type StudentOption = { _id: string; userId: { name: { first: string; last: string } }; nationalId: string };
type TeacherOption = { _id: string; userId: { name: { first: string; last: string } } };

const assessmentTypes: AssessmentType[] = ['quiz', 'exam', 'assignment', 'project', 'midterm', 'final'];

const gradeSchema = z.object({
  title: z.string().trim().min(2, 'اسم الاختبار أو التقييم مطلوب.'),
  assessmentType: z.enum(['quiz', 'exam', 'assignment', 'project', 'midterm', 'final']),
  classId: z.string().min(1, 'اختر الفصل.'),
  subjectId: z.string().min(1, 'اختر المادة.'),
  studentId: z.string().min(1, 'اختر الطالب.'),
  teacherId: z.string().optional(),
  score: z.string().min(1, 'أدخل الدرجة المحصلة.').refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'الدرجة لا يمكن أن تكون سالبة.'),
  maxScore: z.string().min(1, 'أدخل الدرجة الكلية.').refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 1, 'الدرجة الكلية يجب أن تكون أكبر من صفر.'),
  examDate: z.string().min(1, 'اختر تاريخ التقييم.'),
  term: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((values, ctx) => {
  if (Number(values.score) > Number(values.maxScore)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'الدرجة المحصلة لا يمكن أن تتجاوز الدرجة الكلية.',
      path: ['score'],
    });
  }
});

type GradeFormValues = z.infer<typeof gradeSchema>;

const defaultValues = (): GradeFormValues => ({
  title: '',
  assessmentType: 'quiz',
  classId: '',
  subjectId: '',
  studentId: '',
  teacherId: '',
  score: '0',
  maxScore: '100',
  examDate: new Date().toISOString().split('T')[0],
  term: '',
  notes: '',
});

const percentageBadgeClassName = (percentage: number) => {
  if (percentage >= 90) return 'border-gold-400/30 bg-gold-400/10 text-gold-200';
  if (percentage >= 75) return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (percentage >= 60) return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
  return 'border-rose-400/30 bg-rose-400/10 text-rose-200';
};

export default function GradesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const canViewGrades = hasAnyRole(user?.role, roleGroups.staff);
  const canManageGrades = hasAnyRole(user?.role, roleGroups.staff);
  const canSelectTeacher = user?.role === 'school_admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: defaultValues(),
  });

  const watchedClassId = watch('classId');

  const classesQuery = usePaginatedListQuery<ClassOption>({
    queryKey: ['grade-classes-select'],
    queryFn: () => classesApi.list({ page: 1, limit: 200 }),
    enabled: canViewGrades,
    staleTime: 60_000,
  });

  const subjectsQuery = usePaginatedListQuery<SubjectOption>({
    queryKey: ['grade-subjects-select'],
    queryFn: () => subjectsApi.list({ page: 1, limit: 200 }),
    enabled: canViewGrades,
    staleTime: 60_000,
  });

  const studentsQuery = usePaginatedListQuery<StudentOption>({
    queryKey: ['grade-students-select', watchedClassId],
    queryFn: () => studentsApi.list({ page: 1, limit: 200, classId: watchedClassId }),
    enabled: isEditorOpen && Boolean(watchedClassId),
    staleTime: 30_000,
  });

  const teachersQuery = usePaginatedListQuery<TeacherOption>({
    queryKey: ['grade-teachers-select'],
    queryFn: () => teachersApi.list({ page: 1, limit: 100 }),
    enabled: isEditorOpen && canSelectTeacher,
    staleTime: 60_000,
  });

  const gradesQuery = usePaginatedListQuery<Grade>({
    queryKey: ['grades', page, search, classFilter, subjectFilter],
    queryFn: () => gradesApi.list({
      page,
      limit: 15,
      search,
      ...(classFilter ? { classId: classFilter } : {}),
      ...(subjectFilter ? { subjectId: subjectFilter } : {}),
      sort: '-examDate',
    }),
    enabled: canViewGrades,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isEditorOpen) {
      reset(defaultValues());
      setEditingGrade(null);
      setFormError(null);
      return;
    }

    if (!editingGrade) {
      reset(defaultValues());
      return;
    }

    reset({
      title: editingGrade.title,
      assessmentType: editingGrade.assessmentType,
      classId: editingGrade.classId?._id || '',
      subjectId: editingGrade.subjectId?._id || '',
      studentId: editingGrade.studentId?._id || '',
      teacherId: editingGrade.teacherId?._id || '',
      score: String(editingGrade.score),
      maxScore: String(editingGrade.maxScore),
      examDate: editingGrade.examDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      term: editingGrade.term || '',
      notes: editingGrade.notes || '',
    });
  }, [editingGrade, isEditorOpen, reset]);

  const upsertMutation = useMutation({
    mutationFn: (values: GradeFormValues) => {
      const payload = {
        title: values.title.trim(),
        assessmentType: values.assessmentType,
        classId: values.classId,
        subjectId: values.subjectId,
        studentId: values.studentId,
        teacherId: values.teacherId || undefined,
        score: Number(values.score),
        maxScore: Number(values.maxScore),
        examDate: values.examDate,
        term: values.term?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      };

      return editingGrade
        ? gradesApi.update(editingGrade._id, payload)
        : gradesApi.create(payload);
    },
    onMutate: () => setFormError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['reports-grades'] });
      queryClient.invalidateQueries({ queryKey: ['student-grade-profile'] });
      setIsEditorOpen(false);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, 'تعذر حفظ التقييم الدراسي.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (gradeId: string) => gradesApi.delete(gradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['reports-grades'] });
      queryClient.invalidateQueries({ queryKey: ['student-grade-profile'] });
    },
  });

  const handleCreate = () => {
    setEditingGrade(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setIsEditorOpen(true);
  };

  const handleDelete = (grade: Grade) => {
    if (!window.confirm(`هل تريد حذف تقييم ${grade.title}؟`)) return;
    deleteMutation.mutate(grade._id);
  };

  const columns: Column<Grade>[] = [
    {
      key: 'title',
      header: 'التقييم',
      render: (grade: Grade) => (
        <div className="space-y-1">
          <p className="font-medium text-ink">{grade.title}</p>
          <p className="text-xs text-ink-faint">{getAssessmentTypeLabel(grade.assessmentType)}</p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'الطالب',
      render: (grade: Grade) => (
        <div className="space-y-1">
          <p className="text-sm text-ink">{grade.studentId?.userId?.name ? fullName(grade.studentId.userId.name) : 'غير محدد'}</p>
          <p className="text-xs text-ink-faint">{grade.studentId?.nationalId || '—'}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'المادة',
      render: (grade: Grade) => (
        <div className="space-y-1">
          <p className="text-sm text-ink">{getSubjectDisplayName(grade.subjectId)}</p>
          <p className="text-xs text-ink-faint">{grade.subjectId?.code || 'بدون رمز'}</p>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'النتيجة',
      render: (grade: Grade) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink">{grade.score} / {grade.maxScore}</p>
          <Badge className={percentageBadgeClassName(grade.percentage)}>{grade.percentage}%</Badge>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'الفصل',
      render: (grade: Grade) => (
        <span className="text-sm text-ink-muted">
          {grade.classId?.name || '—'}
          {grade.classId?.grade ? ` - صف ${grade.classId.grade}` : ''}
        </span>
      ),
    },
    {
      key: 'examDate',
      header: 'التاريخ',
      render: (grade: Grade) => <span className="text-sm text-ink-muted">{formatDate(grade.examDate)}</span>,
    },
  ];

  if (canManageGrades) {
    columns.push({
      key: 'actions',
      header: 'إجراءات',
      className: 'w-[170px]',
      render: (grade: Grade) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => handleEdit(grade)}>
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deleteMutation.isPending && deleteMutation.variables === grade._id}
            onClick={() => handleDelete(grade)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </Button>
        </div>
      ),
    });
  }

  if (!canViewGrades) {
    return (
      <RestrictedAccessState
        icon={BookOpenCheck}
        description="صفحة الدرجات والاختبارات متاحة للإدارة والمعلمين فقط."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الدرجات والاختبارات"
        description="سجل التقييمات الأكاديمية لكل طالب وربطها بالمواد الدراسية."
        action={canManageGrades ? (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            إضافة تقييم
          </Button>
        ) : undefined}
      />

      <AlertBanner variant="info">
        سجّل الاختبارات والواجبات والمشاريع هنا، وستظهر نتائجها مباشرة في ملفات الطلاب وصفحة التقارير.
      </AlertBanner>

      {gradesQuery.error && (
        <AlertBanner variant="error">
          {getApiErrorMessage(gradesQuery.error, 'تعذر تحميل الدرجات الحالية.')}
        </AlertBanner>
      )}

      {deleteMutation.error && (
        <AlertBanner variant="error">
          {getApiErrorMessage(deleteMutation.error, 'تعذر حذف التقييم.')}
        </AlertBanner>
      )}

      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
        <SearchField
          placeholder="ابحث باسم التقييم..."
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
        />
        <SelectField
          value={classFilter}
          onChange={(event) => { setClassFilter(event.target.value); setPage(1); }}
        >
          <option value="">كل الفصول</option>
          {(classesQuery.data?.items ?? []).map((classOption) => (
            <option key={classOption._id} value={classOption._id}>
              {classOption.name} - صف {classOption.grade}
            </option>
          ))}
        </SelectField>
        <SelectField
          value={subjectFilter}
          onChange={(event) => { setSubjectFilter(event.target.value); setPage(1); }}
        >
          <option value="">كل المواد</option>
          {(subjectsQuery.data?.items ?? []).map((subjectOption) => (
            <option key={subjectOption._id} value={subjectOption._id}>
              {getSubjectDisplayName(subjectOption)}
            </option>
          ))}
        </SelectField>
      </div>

      <Table<Grade>
        columns={columns}
        data={gradesQuery.data?.items ?? []}
        loading={gradesQuery.isLoading}
        emptyMessage="لا توجد تقييمات مسجلة حتى الآن."
      />

      {gradesQuery.data?.meta && (
        <Pagination
          page={gradesQuery.data.meta.page}
          pages={gradesQuery.data.meta.pages}
          total={gradesQuery.data.meta.total}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingGrade ? 'تعديل تقييم' : 'إضافة تقييم جديد'}
        size="lg"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>إلغاء</Button>
            <Button loading={isSubmitting || upsertMutation.isPending} onClick={handleSubmit((values) => upsertMutation.mutate(values))}>
              {editingGrade ? 'حفظ التعديلات' : 'إضافة التقييم'}
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          {formError && <AlertBanner variant="error">{formError}</AlertBanner>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="اسم التقييم" {...register('title')} error={errors.title?.message} placeholder="مثال: اختبار الوحدة الأولى" />
            <SelectField label="نوع التقييم" {...register('assessmentType')} error={errors.assessmentType?.message}>
              {assessmentTypes.map((type) => (
                <option key={type} value={type}>{getAssessmentTypeLabel(type)}</option>
              ))}
            </SelectField>
            <SelectField label="الفصل" {...register('classId')} error={errors.classId?.message}>
              <option value="">اختر الفصل</option>
              {(classesQuery.data?.items ?? []).map((classOption) => (
                <option key={classOption._id} value={classOption._id}>
                  {classOption.name} - صف {classOption.grade}
                </option>
              ))}
            </SelectField>
            <SelectField label="المادة" {...register('subjectId')} error={errors.subjectId?.message} hint={user?.role === 'teacher' ? 'سيتم التحقق من أنك مخول بهذه المادة عند الحفظ.' : undefined}>
              <option value="">اختر المادة</option>
              {(subjectsQuery.data?.items ?? []).map((subjectOption) => (
                <option key={subjectOption._id} value={subjectOption._id}>
                  {getSubjectDisplayName(subjectOption)}
                </option>
              ))}
            </SelectField>
            <SelectField label="الطالب" {...register('studentId')} error={errors.studentId?.message} disabled={!watchedClassId}>
              <option value="">{watchedClassId ? 'اختر الطالب' : 'اختر الفصل أولًا'}</option>
              {(studentsQuery.data?.items ?? []).map((studentOption) => (
                <option key={studentOption._id} value={studentOption._id}>
                  {fullName(studentOption.userId.name)}
                </option>
              ))}
            </SelectField>
            {canSelectTeacher ? (
              <SelectField label="المعلم المسؤول" {...register('teacherId')}>
                <option value="">بدون تعيين</option>
                {(teachersQuery.data?.items ?? []).map((teacherOption) => (
                  <option key={teacherOption._id} value={teacherOption._id}>
                    {fullName(teacherOption.userId.name)}
                  </option>
                ))}
              </SelectField>
            ) : (
              <Input label="المعلم المسؤول" value="سيتم تعيينك تلقائيًا" disabled />
            )}
            <Input label="الدرجة المحصلة" type="number" step="0.01" {...register('score')} error={errors.score?.message} />
            <Input label="الدرجة الكلية" type="number" step="0.01" {...register('maxScore')} error={errors.maxScore?.message} />
            <Input label="تاريخ التقييم" type="date" {...register('examDate')} error={errors.examDate?.message} />
            <Input label="الفصل الدراسي/الترم" {...register('term')} placeholder="مثال: الفصل الأول" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink-dim">ملاحظات</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full rounded-xl border border-stroke bg-glaze/[0.03] px-3.5 py-2.5 text-[13px] text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-gold-500/40 focus:bg-glaze/[0.05] focus:ring-1 focus:ring-gold-500/20"
              placeholder="أي ملاحظات إضافية حول الاختبار أو مستوى الطالب..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}