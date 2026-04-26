'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { teachersApi, subjectsApi, classesApi } from '@/lib/api';
import { Teacher } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { fullName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import AlertBanner from '@/components/ui/AlertBanner';
import SearchField from '@/components/ui/SearchField';
import SelectField from '@/components/ui/SelectField';
import StatusBadge from '@/components/ui/StatusBadge';
import AccountActionPanel from '@/components/accounts/AccountActionPanel';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { useDisclosure } from '@/hooks/useDisclosure';

const createSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب (2 أحرف على الأقل)'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب (2 أحرف على الأقل)'),
  nationalId: z.string().min(5, 'رقم الهوية يجب أن يكون 5 أحرف على الأقل'),
  phone: z.string().min(7, 'رقم الجوال يجب أن يكون 7 أرقام على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  specialization: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function TeachersPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const createDialog = useDisclosure();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const teachersQuery = usePaginatedListQuery<Teacher>({
    queryKey: ['teachers', page, search],
    queryFn: () => teachersApi.list({ page, limit: 15, search }),
    staleTime: 30_000,
  });

  const subjectsQuery = usePaginatedListQuery<{ _id: string; name: string }>({
    queryKey: ['subjects-select'],
    queryFn: () => subjectsApi.list({ page: 1, limit: 100 }),
    enabled: createDialog.isOpen,
  });

  const classesQuery = usePaginatedListQuery<{ _id: string; name: string; grade: string }>({
    queryKey: ['classes-select'],
    queryFn: () => classesApi.list({ page: 1, limit: 100 }),
    enabled: createDialog.isOpen,
  });

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { subjects: [], classes: [] },
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) =>
      teachersApi.create({
        name: { first: d.firstName, last: d.lastName },
        nationalId: d.nationalId,
        phone: d.phone,
        email: d.email || undefined,
        specialization: d.specialization || undefined,
        subjects: d.subjects?.length ? d.subjects : undefined,
        classes: d.classes?.length ? d.classes : undefined,
      }).then(getEntityPayload<{ teacher: Teacher; tempPassword?: string | null }>),
    onMutate: () => setCreateError(null),
    onSuccess: (response) => {
      setCreatedTempPassword(response.tempPassword ?? null);
      qc.invalidateQueries({ queryKey: ['teachers'] });
      createDialog.close();
      reset();
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, 'حدث خطأ أثناء إضافة المعلم'));
    },
  });

  const columns: Column<Teacher>[] = [
    {
      key: 'name',
      header: 'Teacher',
      render: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.userId.name} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{fullName(t.userId.name)}</p>
            <p className="text-xs text-gray-500">{t.nationalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'الجوال',
      render: (t: Teacher) => <span className="text-sm text-gray-700">{t.userId.phone}</span>,
    },
    {
      key: 'specialization',
      header: 'التخصص',
      render: (t: Teacher) =>
        t.specialization ? (
          <span className="text-sm text-gray-700">{t.specialization}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'subjects',
      header: 'المواد',
      render: (t: Teacher) => (
        <div className="flex flex-wrap gap-1">
          {t.subjects?.slice(0, 3).map((s) => (
            <Badge key={s._id} variant="info" className="text-xs">{s.name}</Badge>
          ))}
          {(t.subjects?.length ?? 0) > 3 && (
            <Badge variant="default" className="text-xs">+{t.subjects.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'الفصول',
      render: (t: Teacher) => (
        <span className="text-sm text-gray-700">{t.classes?.length ?? 0} فصل</span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (t: Teacher) => (
        <StatusBadge isActive={t.userId.isActive} />
      ),
    },
  ];

  const canCreate = user?.role === 'school_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="المعلمون"
        description="إدارة جميع معلمي المدرسة"
        action={
          canCreate ? (
            <Button onClick={createDialog.open}>
              <Plus className="h-4 w-4 me-1" /> إضافة معلم
            </Button>
          ) : undefined
        }
      />

      <SearchField
        containerClassName="max-w-sm"
        placeholder="البحث بالاسم أو رقم الهوية…"
        value={search}
        onChange={(event) => { setSearch(event.target.value); setPage(1); }}
      />

      {createdTempPassword && (
        <AlertBanner variant="warning">
          تم إنشاء حساب المعلم. كلمة المرور المؤقتة:
          {' '}
          <span className="font-semibold" dir="ltr">{createdTempPassword}</span>
        </AlertBanner>
      )}

      <Table<Teacher>
        columns={columns}
        data={teachersQuery.data?.items ?? []}
        loading={teachersQuery.isLoading}
        onRowClick={setSelected}
      />

      {teachersQuery.data?.meta && (
        <Pagination
          page={teachersQuery.data.meta.page}
          pages={teachersQuery.data.meta.pages}
          total={teachersQuery.data.meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        open={createDialog.isOpen}
        onClose={() => { createDialog.close(); reset(); }}
        title="إضافة معلم جديد"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { createDialog.close(); reset(); }}>إلغاء</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => createMutation.mutate(d))}>
              إضافة معلم
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="الاسم الأول" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="اسم العائلة" {...register('lastName')} error={errors.lastName?.message} />
          <Input label="رقم الهوية" {...register('nationalId')} error={errors.nationalId?.message} />
          <Input label="رقم الجوال" {...register('phone')} error={errors.phone?.message} />
          <Input
            label="البريد الإلكتروني (اختياري)"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="التخصص (اختياري)"
            {...register('specialization')}
          />

          {/* Subjects multi-select — wired to react-hook-form */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              المواد (اضغط Ctrl لتحديد أكثر من واحدة)
            </label>
            <Controller
              name="subjects"
              control={control}
              render={({ field }) => (
                <SelectField
                  multiple
                  className="h-24"
                  value={field.value ?? []}
                  onChange={(e) =>
                    field.onChange(
                      Array.from(e.target.selectedOptions, (o) => o.value)
                    )
                  }
                >
                  {(subjectsQuery.data?.items ?? []).map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </SelectField>
              )}
            />
          </div>

          {/* Classes multi-select — wired to react-hook-form */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              الفصول (اضغط Ctrl لتحديد أكثر من واحدة)
            </label>
            <Controller
              name="classes"
              control={control}
              render={({ field }) => (
                <SelectField
                  multiple
                  className="h-24"
                  value={field.value ?? []}
                  onChange={(e) =>
                    field.onChange(
                      Array.from(e.target.selectedOptions, (o) => o.value)
                    )
                  }
                >
                  {(classesQuery.data?.items ?? []).map((c) => (
                    <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>
                  ))}
                </SelectField>
              )}
            />
          </div>

          {/* Mutation error feedback */}
          {createError && (
            <AlertBanner variant="error" className="sm:col-span-2">
              {createError}
            </AlertBanner>
          )}
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="بيانات المعلم"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selected.userId.name} size="xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{fullName(selected.userId.name)}</h3>
                <p className="text-sm text-gray-500">{selected.userId.phone}</p>
                <StatusBadge isActive={selected.userId.isActive} className="mt-1" />
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm space-y-3">
              <div><span className="text-gray-500">رقم الهوية: </span><span className="font-medium">{selected.nationalId}</span></div>
              {selected.specialization && (
                <div><span className="text-gray-500">التخصص: </span><span className="font-medium">{selected.specialization}</span></div>
              )}
              <div>
                <span className="text-gray-500">المواد:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.subjects?.length ? selected.subjects.map((s) => (
                    <Badge key={s._id} variant="info">{s.name}</Badge>
                  )) : <span className="text-gray-400">لا يوجد</span>}
                </div>
              </div>
              <div>
                <span className="text-gray-500">الفصول:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.classes?.length ? selected.classes.map((c) => (
                    <Badge key={c._id} variant="default">{c.name}</Badge>
                  )) : <span className="text-gray-400">لا يوجد</span>}
                </div>
              </div>
            </div>

            <AccountActionPanel
              account={{
                _id: selected.userId._id,
                name: fullName(selected.userId.name),
                isActive: selected.userId.isActive,
                mustChangePassword: selected.userId.mustChangePassword,
                lastLogin: selected.userId.lastLogin,
              }}
              entityLabel="المعلم"
              invalidateQueryKeys={[['teachers'], ['accounts']]}
              onAccountUpdated={(updates) => {
                setSelected((current) => {
                  if (!current) return current;
                  return {
                    ...current,
                    userId: {
                      ...current.userId,
                      ...updates,
                    },
                  };
                });
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
