'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Filter, MessageCircle } from 'lucide-react';
import { attendanceApi, classesApi, studentsApi } from '@/lib/api';
import { AttendanceRecord, Student } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { fullName, formatDate, getAttendanceBadgeColor } from '@/lib/utils';
import { buildAttendanceWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';

const attendanceTypeLabels: Record<'absence' | 'late' | 'permission', string> = {
  absence: 'غياب',
  late: 'تأخر',
  permission: 'إذن',
};

const singleSchema = z.object({
  studentId: z.string().min(1, 'Required'),
  classId: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  type: z.enum(['absence', 'late', 'permission']),
  notes: z.string().optional(),
});
type SingleForm = z.infer<typeof singleSchema>;

const bulkSchema = z.object({
  classId: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  type: z.enum(['absence', 'late', 'permission']),
  notes: z.string().optional(),
});
type BulkForm = z.infer<typeof bulkSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ATTENDANCE_TYPES = ['absence', 'late', 'permission'] as const;

export default function AttendancePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showSingle, setShowSingle] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', page, filterDate, filterType],
    queryFn: () =>
      attendanceApi
        .list({ page, limit: 15, date: filterDate || undefined, type: filterType || undefined })
        .then((r) => r.data),
    staleTime: 15_000,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-select'],
    queryFn: () => classesApi.list({ page: 1, limit: 100 }).then((r) => r.data),
    enabled: showSingle || showBulk,
  });

  const singleForm = useForm<SingleForm>({
    resolver: zodResolver(singleSchema),
    defaultValues: { type: 'absence', date: new Date().toISOString().split('T')[0] },
  });

  const bulkForm = useForm<BulkForm>({
    resolver: zodResolver(bulkSchema),
    defaultValues: { type: 'absence', date: new Date().toISOString().split('T')[0] },
  });

  const singleMutation = useMutation({
    mutationFn: (d: SingleForm) => attendanceApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      setShowSingle(false);
      singleForm.reset();
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (d: BulkForm) =>
      attendanceApi.bulkCreate({
        classId: d.classId,
        date: d.date,
        records: selectedStudents.map((studentId) => ({
          studentId,
          type: d.type,
          notes: d.notes || undefined,
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      setShowBulk(false);
      bulkForm.reset();
      setSelectedStudents([]);
      setBulkStudents([]);
    },
  });

  const handleClassChangeBulk = async (classId: string) => {
    bulkForm.setValue('classId', classId);
    if (!classId) { setBulkStudents([]); return; }
    try {
      const res = await studentsApi.list({ classId, limit: 100 });
      setBulkStudents(res.data.data ?? []);
    } catch {
      setBulkStudents([]);
    }
  };

  // students for single form
  const watchedClassId = singleForm.watch('classId');
  const watchedSingleStudentId = singleForm.watch('studentId');
  const watchedSingleDate = singleForm.watch('date');
  const watchedSingleType = singleForm.watch('type');
  const watchedSingleNotes = singleForm.watch('notes');
  const watchedBulkDate = bulkForm.watch('date');
  const watchedBulkType = bulkForm.watch('type');
  const watchedBulkNotes = bulkForm.watch('notes');
  const watchedBulkClassId = bulkForm.watch('classId');
  const { data: singleStudents } = useQuery({
    queryKey: ['students-class', watchedClassId],
    queryFn: () =>
      studentsApi.list({ classId: watchedClassId, limit: 100 }).then((r) => r.data.data ?? []),
    enabled: !!watchedClassId,
  });

  const selectedSingleStudent = (singleStudents ?? []).find((student: Student) => student._id === watchedSingleStudentId) ?? null;
  const selectedBulkStudents = bulkStudents.filter((student: Student) => selectedStudents.includes(student._id));

  const openWhatsApp = (url: string | null) => {
    if (!url || typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSingleAttendanceWhatsApp = () => {
    if (!selectedSingleStudent) return;

    openWhatsApp(buildWhatsAppUrl({
      phone: selectedSingleStudent.parentId?.userId?.phone,
      message: buildAttendanceWhatsAppMessage({
        studentName: fullName(selectedSingleStudent.userId.name),
        date: watchedSingleDate,
        statusLabel: attendanceTypeLabels[watchedSingleType],
        notes: watchedSingleNotes,
      }),
    }));
  };

  const handleBulkAttendanceWhatsApp = (student: Student) => {
    openWhatsApp(buildWhatsAppUrl({
      phone: student.parentId?.userId?.phone,
      message: buildAttendanceWhatsAppMessage({
        studentName: fullName(student.userId.name),
        date: watchedBulkDate,
        statusLabel: attendanceTypeLabels[watchedBulkType],
        notes: watchedBulkNotes,
      }),
    }));
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'student',
      header: 'الطالب',
      render: (r: AttendanceRecord) => (
        <div>
          <p className="font-medium text-gray-900">{fullName(r.studentId?.userId?.name)}</p>
          <p className="text-xs text-gray-500">{r.studentId?.nationalId}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (r: AttendanceRecord) => (
        <span className="text-sm text-gray-700">{formatDate(r.date)}</span>
      ),
    },
    {
      key: 'type',
      header: 'النوع',
      render: (r: AttendanceRecord) => {
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getAttendanceBadgeColor(r.type)}`}
          >
            {attendanceTypeLabels[r.type] ?? r.type}
          </span>
        );
      },
    },
    {
      key: 'notes',
      header: 'ملاحظات',
      render: (r: AttendanceRecord) =>
        r.notes ? (
          <span className="text-sm text-gray-600 line-clamp-1">{r.notes}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  const canRecord = user?.role === 'teacher' || user?.role === 'school_admin' || user?.role === 'administrative';

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحضور والغياب"
        description="تتبع وإدارة سجلات حضور الطلاب"
        action={
          canRecord ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSingle(true)}>
                <Plus className="h-4 w-4 me-1" /> تسجيل فردي
              </Button>
              <Button onClick={() => setShowBulk(true)}>
                <Plus className="h-4 w-4 me-1" /> تسجيل جماعي
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">تصفية:</span>
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">جميع الأنواع</option>
          <option value="absence">غياب</option>
          <option value="late">تأخر</option>
          <option value="permission">إذن</option>
        </select>
        {(filterDate || filterType) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterDate(''); setFilterType(''); setPage(1); }}>
            مسح
          </Button>
        )}
      </div>

      <Table<AttendanceRecord>
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pages={data.meta.pages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Single Record Modal */}
      <Modal
        open={showSingle}
        onClose={() => { setShowSingle(false); singleForm.reset(); }}
        title="تسجيل حضور"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowSingle(false); singleForm.reset(); }}>إلغاء</Button>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedSingleStudent?.parentId?.userId?.phone}
              onClick={handleSingleAttendanceWhatsApp}
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              <MessageCircle className="h-4 w-4" /> واتساب ولي الأمر
            </Button>
            <Button
              loading={singleForm.formState.isSubmitting}
              onClick={singleForm.handleSubmit((d) => singleMutation.mutate(d))}
            >
              حفظ السجل
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الفصل</label>
            <select
              {...singleForm.register('classId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">اختر فصل…</option>
              {(classesData?.data ?? []).map((c: { _id: string; name: string; grade: string }) => (
                <option key={c._id} value={c._id}>{c.name} — صف {c.grade}</option>
              ))}
            </select>
            {singleForm.formState.errors.classId && (
              <p className="mt-1 text-xs text-red-600">{singleForm.formState.errors.classId.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الطالب</label>
            <select
              {...singleForm.register('studentId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              disabled={!watchedClassId}
            >
              <option value="">اختر طالب…</option>
              {(singleStudents ?? []).map((s: Student) => (
                <option key={s._id} value={s._id}>{fullName(s.userId.name)}</option>
              ))}
            </select>
            {singleForm.formState.errors.studentId && (
              <p className="mt-1 text-xs text-red-600">{singleForm.formState.errors.studentId.message}</p>
            )}
          </div>
          {selectedSingleStudent && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-gray-500">سيتم فتح واتساب إلى ولي الأمر</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{fullName(selectedSingleStudent.parentId?.userId?.name)}</p>
              <p className="mt-1 text-xs text-gray-600" dir="ltr">
                {selectedSingleStudent.parentId?.userId?.phone || 'لا يوجد رقم جوال لولي الأمر'}
              </p>
            </div>
          )}
          <Input label="التاريخ" type="date" {...singleForm.register('date')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">النوع</label>
            <select
              {...singleForm.register('type')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="absence">غياب</option>
              <option value="late">تأخر</option>
              <option value="permission">إذن</option>
            </select>
          </div>
          <Input label="ملاحظات (اختياري)" {...singleForm.register('notes')} />
        </div>
      </Modal>

      {/* Bulk Record Modal */}
      <Modal
        open={showBulk}
        onClose={() => {
          setShowBulk(false);
          bulkForm.reset();
          setSelectedStudents([]);
          setBulkStudents([]);
        }}
        title="تسجيل جماعي"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBulk(false);
                bulkForm.reset();
                setSelectedStudents([]);
                setBulkStudents([]);
              }}
            >
              إلغاء
            </Button>
            <Button
              loading={bulkForm.formState.isSubmitting}
              disabled={selectedStudents.length === 0}
              onClick={bulkForm.handleSubmit((d) => bulkMutation.mutate(d))}
            >
              حفظ {selectedStudents.length} سجل
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">الفصل</label>
              <select
                {...bulkForm.register('classId')}
                onChange={(e) => handleClassChangeBulk(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">اختر فصل…</option>
                {(classesData?.data ?? []).map((c: { _id: string; name: string; grade: string }) => (
                  <option key={c._id} value={c._id}>{c.name} — صف {c.grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">التاريخ</label>
              <input
                type="date"
                {...bulkForm.register('date')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">النوع</label>
              <select
                {...bulkForm.register('type')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="absence">غياب</option>
                <option value="late">تأخر</option>
                <option value="permission">إذن</option>
              </select>
            </div>
          </div>
          <Input label="ملاحظات (اختياري)" {...bulkForm.register('notes')} />

          {bulkStudents.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  الطلاب ({selectedStudents.length}/{bulkStudents.length} محدد)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStudents.length === bulkStudents.length) {
                      setSelectedStudents([]);
                    } else {
                      setSelectedStudents(bulkStudents.map((s) => s._id));
                    }
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {selectedStudents.length === bulkStudents.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {bulkStudents.map((s) => (
                  <label
                    key={s._id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s._id)}
                      onChange={() => toggleStudent(s._id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-900">{fullName(s.userId.name)}</span>
                    <span className="ms-auto text-xs text-gray-400">{s.nationalId}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedBulkStudents.length > 0 && (
            <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-800">واتساب أولياء الأمور للطلاب المحددين</p>
                <p className="text-xs text-gray-600">يفتح رسالة جاهزة بحسب التاريخ والحالة المختارة لكل طالب.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedBulkStudents.map((student) => (
                  <Button
                    key={student._id}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!student.parentId?.userId?.phone}
                    onClick={() => handleBulkAttendanceWhatsApp(student)}
                    className="border-emerald-500/20 bg-white/80 text-emerald-700 hover:bg-white hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    <MessageCircle className="h-4 w-4" /> {fullName(student.userId.name)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {watchedBulkClassId && bulkStudents.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">لا يوجد طلاب في هذا الفصل</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
