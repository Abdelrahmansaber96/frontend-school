'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-contracts';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { useAuthStore } from '@/store/auth.store';
import type { Subject } from '@/types';
import AlertBanner from '@/components/ui/AlertBanner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/ui/PageHeader';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';

type SubjectRecord = Subject & {
  teacherCount?: number;
};

const subjectSchema = z.object({
  name: z.string().trim().min(2, 'اسم المادة مطلوب ويجب أن يكون حرفين على الأقل.').max(100, 'اسم المادة طويل جدًا.'),
  code: z.string().trim().max(20, 'رمز المادة طويل جدًا.').regex(/^[A-Za-z0-9-]*$/, 'رمز المادة يقبل الحروف والأرقام والشرطة فقط.'),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const defaultValues: SubjectFormValues = {
  name: '',
  code: '',
};

export default function SubjectsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canViewSubjects = user?.role === 'school_admin' || user?.role === 'teacher';
  const canManageSubjects = user?.role === 'school_admin';

  const subjectsQuery = usePaginatedListQuery<SubjectRecord>({
    queryKey: ['subjects', page, search],
    queryFn: () => subjectsApi.list({ page, limit: 15, search }),
    enabled: canViewSubjects,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isEditorOpen) {
      reset(defaultValues);
      setEditingSubject(null);
      setFormError(null);
      return;
    }

    if (editingSubject) {
      reset({
        name: editingSubject.nameAr || editingSubject.name || '',
        code: editingSubject.code ?? '',
      });
      return;
    }

    reset(defaultValues);
  }, [editingSubject, isEditorOpen, reset]);

  const upsertMutation = useMutation({
    mutationFn: (values: SubjectFormValues) => {
      const payload = {
        name: values.name.trim(),
        code: values.code.trim() || undefined,
      };

      return editingSubject
        ? subjectsApi.update(editingSubject._id, payload)
        : subjectsApi.create(payload);
    },
    onMutate: () => setFormError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsEditorOpen(false);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, 'تعذر حفظ المادة الدراسية.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (subjectId: string) => subjectsApi.delete(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const handleCreate = () => {
    setEditingSubject(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (subject: SubjectRecord) => {
    setEditingSubject(subject);
    setIsEditorOpen(true);
  };

  const handleDelete = (subject: SubjectRecord) => {
    if (!window.confirm(`هل تريد حذف مادة ${subject.nameAr || subject.name}؟`)) {
      return;
    }

    deleteMutation.mutate(subject._id);
  };

  const columns: Column<SubjectRecord>[] = [
    {
      key: 'name',
      header: 'المادة',
      render: (subject: SubjectRecord) => (
        <p className="font-medium text-ink">{subject.nameAr || subject.name}</p>
      ),
    },
    {
      key: 'code',
      header: 'الرمز',
      render: (subject: SubjectRecord) => (
        subject.code ? (
          <span className="text-sm text-ink-muted">{subject.code}</span>
        ) : (
          <span className="text-xs text-ink-faint">غير محدد</span>
        )
      ),
    },
    {
      key: 'teacherCount',
      header: 'المعلمون',
      render: (subject: SubjectRecord) => (
        <Badge variant="info">{subject.teacherCount ?? 0} معلم</Badge>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (subject: SubjectRecord) => (
        <Badge variant={subject.isActive ? 'success' : 'danger'}>
          {subject.isActive ? 'نشطة' : 'غير نشطة'}
        </Badge>
      ),
    },
  ];

  if (canManageSubjects) {
    columns.push({
      key: 'actions',
      header: 'إجراءات',
      className: 'w-[150px]',
      render: (subject: SubjectRecord) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={() => handleEdit(subject)}>
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deleteMutation.isPending && deleteMutation.variables === subject._id}
            onClick={() => handleDelete(subject)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </Button>
        </div>
      ),
    });
  }

  if (!canViewSubjects) {
    return (
      <RestrictedAccessState
        icon={BookOpen}
        description="صفحة المواد الدراسية متاحة لمدير المدرسة والمعلمين بحسب الصلاحيات."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواد الدراسية"
        description="فهرس المواد المعتمدة داخل المدرسة وربطها بالمعلمين."
        action={
          canManageSubjects ? (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              إضافة مادة
            </Button>
          ) : undefined
        }
      />

      <AlertBanner variant="info">
        المواد الدراسية تُدار على مستوى المدرسة، وتظهر للمعلمين عند ربطها بحساباتهم.
      </AlertBanner>

      {subjectsQuery.error && (
        <AlertBanner variant="error">
          {getApiErrorMessage(subjectsQuery.error, 'تعذر تحميل المواد الدراسية.')}
        </AlertBanner>
      )}

      {deleteMutation.error && (
        <AlertBanner variant="error">
          {getApiErrorMessage(deleteMutation.error, 'تعذر حذف المادة الدراسية.')}
        </AlertBanner>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="ابحث باسم المادة أو رمزها..."
          className="w-full rounded-xl border border-stroke bg-glaze/[0.03] py-2.5 ps-10 pe-3 text-[13px] text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-gold-500/40 focus:bg-glaze/[0.05] focus:ring-1 focus:ring-gold-500/20"
        />
      </div>

      <Table<SubjectRecord>
        columns={columns}
        data={subjectsQuery.data?.items ?? []}
        loading={subjectsQuery.isLoading}
        emptyMessage="لا توجد مواد دراسية مطابقة حتى الآن."
      />

      {subjectsQuery.data?.meta && (
        <Pagination
          page={subjectsQuery.data.meta.page}
          pages={subjectsQuery.data.meta.pages}
          total={subjectsQuery.data.meta.total}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingSubject ? 'تعديل مادة دراسية' : 'إضافة مادة دراسية'}
        size="md"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>إلغاء</Button>
            <Button loading={isSubmitting || upsertMutation.isPending} onClick={handleSubmit((values) => upsertMutation.mutate(values))}>
              {editingSubject ? 'حفظ التعديلات' : 'إضافة المادة'}
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          {formError && (
            <AlertBanner variant="error">{formError}</AlertBanner>
          )}
          <Input
            label="اسم المادة"
            placeholder="الرياضيات"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="رمز المادة"
            placeholder="MATH-101"
            {...register('code')}
            error={errors.code?.message}
            hint="اختياري، ويفضل استخدام رمز مختصر موحد."
          />
        </div>
      </Modal>
    </div>
  );
}