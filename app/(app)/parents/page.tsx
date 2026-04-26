'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parentsApi } from '@/lib/api';
import { Parent } from '@/types';
import { fullName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import AlertBanner from '@/components/ui/AlertBanner';
import Modal from '@/components/ui/Modal';
import Table, { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import SearchField from '@/components/ui/SearchField';
import StatusBadge from '@/components/ui/StatusBadge';
import AccountActionPanel from '@/components/accounts/AccountActionPanel';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { useDisclosure } from '@/hooks/useDisclosure';

const createSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  nationalId: z.string().min(5, 'Min 5 characters'),
  phone: z.string().min(9, 'Min 9 digits'),
  email: z.string().email().optional().or(z.literal('')),
});
type CreateFormData = z.infer<typeof createSchema>;

const PAGE_SIZE = 10;

export default function ParentsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const createDialog = useDisclosure();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState<Parent | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const parentsQuery = usePaginatedListQuery<Parent>({
    queryKey: ['parents', page, search],
    queryFn: () => parentsApi.list({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateFormData) =>
      parentsApi.create({
        name: { first: d.firstName, last: d.lastName },
        nationalId: d.nationalId,
        phone: d.phone,
        email: d.email || undefined,
      }).then(getEntityPayload<{ parent: Parent; tempPassword?: string | null }>),
    onMutate: () => setCreateError(null),
    onSuccess: (response) => {
      setCreatedTempPassword(response.tempPassword ?? null);
      qc.invalidateQueries({ queryKey: ['parents'] });
      createDialog.close();
      reset();
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, 'فشل إنشاء ولي الأمر.'));
    },
  });

  const columns: Column<Parent>[] = [
    {
      key: 'name',
      header: 'ولي الأمر',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.userId.name} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{fullName(p.userId.name)}</p>
            <p className="text-xs text-gray-500">ID: {p.nationalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'الجوال',
      render: (p) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          {p.userId.phone}
        </div>
      ),
    },
    {
      key: 'children',
      header: 'الأبناء',
      render: (p) => (
        <Badge variant="info">{p.children?.length ?? 0} طالب</Badge>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (p) => (
        <StatusBadge isActive={p.userId.isActive} />
      ),
    },
  ];

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const canCreate = user?.role === 'school_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="أولياء الأمور"
        description="إدارة حسابات أولياء الأمور وأبنائهم المرتبطين"
        action={canCreate ? (
          <Button onClick={createDialog.open}>
            <Plus className="h-4 w-4 me-1" />
            إضافة ولي أمر
          </Button>
        ) : undefined}
      />

      {/* Search */}
      <div className="flex gap-3">
        <SearchField
          containerClassName="max-w-sm flex-1"
          placeholder="البحث برقم الهوية…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
        />
        <Button variant="secondary" onClick={handleSearch}>بحث</Button>
        {search && (
          <Button variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            مسح
          </Button>
        )}
      </div>

      {createdTempPassword && (
        <AlertBanner variant="warning">
          تم إنشاء حساب ولي الأمر. كلمة المرور المؤقتة:
          {' '}
          <span className="font-semibold" dir="ltr">{createdTempPassword}</span>
        </AlertBanner>
      )}

      {/* Table */}
      {parentsQuery.data?.items.length === 0 && !parentsQuery.isLoading ? (
        <EmptyState
          title="لا يوجد أولياء أمور"
          description={search ? 'جرّب تعديل بحثك' : 'أضف حساب ولي أمر أول'}
          action={canCreate ? <Button onClick={createDialog.open}><Plus className="h-4 w-4 me-1" />إضافة ولي أمر</Button> : undefined}
        />
      ) : (
        <>
          <Table<Parent>
            columns={columns}
            data={parentsQuery.data?.items ?? []}
            loading={parentsQuery.isLoading}
            onRowClick={(p) => setSelected(p)}
          />
          {parentsQuery.data?.meta && (
            <Pagination
              page={parentsQuery.data.meta.page}
              pages={parentsQuery.data.meta.pages}
              total={parentsQuery.data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Create modal */}
      <Modal open={createDialog.isOpen} onClose={() => { createDialog.close(); reset(); }} title="إضافة ولي أمر">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="الاسم الأول" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="اسم العائلة" {...register('lastName')} error={errors.lastName?.message} />
            <Input label="رقم الهوية" {...register('nationalId')} error={errors.nationalId?.message} />
            <Input label="رقم الجوال" {...register('phone')} error={errors.phone?.message} />
          </div>
          <Input label="البريد الإلكتروني (اختياري)" type="email" {...register('email')} error={errors.email?.message} />
          {createError && (
            <AlertBanner variant="error">
              {createError}
            </AlertBanner>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => { createDialog.close(); reset(); }}>إلغاء</Button>
            <Button type="submit" loading={isSubmitting}>إضافة ولي الأمر</Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="بيانات ولي الأمر">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selected.userId.name} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{fullName(selected.userId.name)}</h3>
                <p className="text-sm text-gray-500">ID: {selected.nationalId}</p>
                <div className="mt-1 flex gap-2">
                  <StatusBadge isActive={selected.userId.isActive} />
                  <Badge variant="default">ولي أمر</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">رقم الجوال:</span>
                <p className="font-medium">{selected.userId.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">البريد:</span>
                <p className="font-medium">{selected.userId.email ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">المهنة:</span>
                <p className="font-medium">{selected.occupation ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">عدد الأبناء:</span>
                <p className="font-medium">{selected.children?.length ?? 0}</p>
              </div>
            </div>
            {selected.children && selected.children.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">الأبناء المرتبطون</p>
                <div className="space-y-2">
                  {selected.children.map((child, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <GraduationCapIcon />
                      <span className="font-medium text-gray-800">
                        {typeof child === 'object' && child !== null && 'userId' in child
                          ? fullName((child as { userId: { name: { first: string; last: string } } }).userId.name)
                          : String(child)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AccountActionPanel
              account={{
                _id: selected.userId._id,
                name: fullName(selected.userId.name),
                isActive: selected.userId.isActive,
                mustChangePassword: selected.userId.mustChangePassword,
                lastLogin: selected.userId.lastLogin,
              }}
              entityLabel="ولي الأمر"
              invalidateQueryKeys={[['parents'], ['accounts']]}
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
        </Modal>
      )}
    </div>
  );
}

function GraduationCapIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}
