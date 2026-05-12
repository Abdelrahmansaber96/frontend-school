'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Users } from 'lucide-react';
import { classesApi, teachersApi } from '@/lib/api';
import { getCurrentHijriAcademicYear } from '@/lib/academic-year';
import { Class, Student } from '@/types';
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

const createSchema = z.object({
  name: z.string().min(1, 'Required'),
  grade: z.string().min(1, 'Required'),
  section: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'يجب أن يكون بصيغة 1446-1447'),
  teacherId: z.string().optional(),
  capacity: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function ClassesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', page, search],
    queryFn: () => classesApi.list({ page, limit: 15, search }).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-select'],
    queryFn: () => teachersApi.list({ page: 1, limit: 100 }).then((r) => r.data),
    enabled: showCreate,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      academicYear: getCurrentHijriAcademicYear(),
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) =>
      classesApi.create({
        name: d.name,
        grade: d.grade,
        section: d.section,
        academicYear: d.academicYear,
        teacherId: d.teacherId,
        capacity: d.capacity ? Number(d.capacity) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      setShowCreate(false);
      reset();
    },
  });

  const handleRowClick = async (cls: Class) => {
    setSelected(cls);
    setLoadingStudents(true);
    try {
      const res = await classesApi.getStudents(cls._id);
      setClassStudents(res.data.data ?? []);
    } catch {
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const columns: Column<Class>[] = [
    {
      key: 'name',
      header: 'اسم الفصل',
      render: (c: Class) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    {
      key: 'grade',
      header: 'الصف',
      render: (c: Class) => <Badge variant="info">صف {c.grade}</Badge>,
    },
    {
      key: 'section',
      header: 'الشعبة',
      render: (c: Class) =>
        c.section ? (
          <span className="text-sm text-gray-700">{c.section}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'teacher',
      header: 'معلم الفصل',
      render: (c: Class) =>
        c.teacherId ? (
          <span className="text-sm text-gray-700">{fullName(c.teacherId.userId.name)}</span>
        ) : (
          <span className="text-xs text-gray-400">غير محدد</span>
        ),
    },
    {
      key: 'academicYear',
      header: 'العام الدراسي',
      render: (c: Class) => <span className="text-sm text-gray-700">{c.academicYear}</span>,
    },
    {
      key: 'capacity',
      header: 'الطاقة الاستيعابية',
      render: (c: Class) =>
        c.capacity ? (
          <span className="text-sm text-gray-700">{c.capacity}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (c: Class) => (
        <Badge variant={c.isActive ? 'success' : 'danger'}>
          {c.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
  ];

  const canCreate = user?.role === 'school_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="الفصول الدراسية"
        description="إدارة جميع الفصول وتوزيعاتها"
        action={
          canCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 me-1" /> إضافة فصل
            </Button>
          ) : undefined
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="البحث عن فصل…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-gray-300 py-2 ps-9 pe-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <Table<Class>
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        onRowClick={handleRowClick}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pages={data.meta.pages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); reset(); }}
        title="إضافة فصل جديد"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowCreate(false); reset(); }}>إلغاء</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => createMutation.mutate(d))}>
              إضافة فصل
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="اسم الفصل" placeholder="مثال: فصل ألف" {...register('name')} error={errors.name?.message} />
          <Input label="الصف" placeholder="مثال: 1" {...register('grade')} error={errors.grade?.message} />
          <Input label="الشعبة (اختياري)" placeholder="مثال: أ" {...register('section')} />
          <Input label="العام الدراسي" placeholder="مثال: 1446-1447" {...register('academicYear')} error={errors.academicYear?.message} />
          <Input label="الطاقة الاستيعابية (اختياري)" type="number" {...register('capacity')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">معلم الفصل (اختياري)</label>
            <select
              {...register('teacherId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">اختر معلم…</option>
              {(teachersData?.data ?? []).map((t: { _id: string; userId: { name: { first: string; last: string } } }) => (
                <option key={t._id} value={t._id}>{fullName(t.userId.name)}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Class Detail + Students Modal */}
      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setClassStudents([]); }}
        title={selected ? `${selected.name} — طلاب الفصل` : ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
              <div><span className="text-gray-500">الصف: </span><span className="font-medium">{selected.grade}</span></div>
              <div><span className="text-gray-500">الشعبة: </span><span className="font-medium">{selected.section ?? '—'}</span></div>
              <div><span className="text-gray-500">العام: </span><span className="font-medium">{selected.academicYear}</span></div>
            </div>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : classStudents.length ? (
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {classStudents.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={s.userId.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fullName(s.userId.name)}</p>
                      <p className="text-xs text-gray-500">{s.nationalId}</p>
                    </div>
                    <Badge variant={s.gender === 'male' ? 'info' : s.gender === 'female' ? 'purple' : 'default'} className="ms-auto">
                      {s.gender === 'male' ? 'ذكر' : s.gender === 'female' ? 'أنثى' : 'غير محدد'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-2">
                <Users className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">لا يوجد طلاب في هذا الفصل حتى الآن</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
