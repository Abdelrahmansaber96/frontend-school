'use client';

import { ChangeEvent, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Filter, ThumbsUp, ThumbsDown, Paperclip, Loader2, X, MessageCircle } from 'lucide-react';
import { behaviorApi, classesApi, studentsApi, uploadsApi } from '@/lib/api';
import { BehaviorRecord, FileAttachment, Student, UploadedFile } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { fullName, formatDate } from '@/lib/utils';
import { buildBehaviorWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';

const behaviorTypeLabels = {
  positive: 'إيجابية',
  negative: 'سلوكية',
} as const;

const createSchema = z.object({
  studentId: z.string().min(1, 'Required'),
  classId: z.string().min(1, 'Required'),
  type: z.enum(['positive', 'negative']),
  category: z.string().optional(),
  description: z.string().min(3, 'Min 3 characters'),
  notifyParent: z.boolean(),
});
type CreateForm = z.infer<typeof createSchema>;

const BEHAVIOR_CATEGORIES = {
  positive: ['تفوق أكاديمي', 'مساعدة الآخرين', 'قيادة', 'التزام بالمواعيد', 'عمل جماعي', 'أخرى'],
  negative: ['إزعاج', 'تنمر', 'غياب', 'عدم احترام', 'غش', 'أخرى'],
};

export default function BehaviorPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [uploadedAttachments, setUploadedAttachments] = useState<FileAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['behavior', page, filterType],
    queryFn: () =>
      behaviorApi.list({ page, limit: 15, type: filterType || undefined }).then((r) => r.data),
    staleTime: 15_000,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-select'],
    queryFn: () => classesApi.list({ page: 1, limit: 100 }).then((r) => r.data),
    enabled: showCreate,
  });

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { type: 'positive', notifyParent: false },
  });

  const watchedClassId = watch('classId');
  const watchedType = watch('type');
  const watchedStudentId = watch('studentId');
  const watchedCategory = watch('category');
  const watchedDescription = watch('description');

  const { data: studentsData } = useQuery({
    queryKey: ['students-class', watchedClassId],
    queryFn: () =>
      studentsApi.list({ classId: watchedClassId, limit: 100 }).then((r) => r.data.data ?? []),
    enabled: !!watchedClassId,
  });

  const selectedStudent = (studentsData ?? []).find((student: Student) => student._id === watchedStudentId) ?? null;

  const handleBehaviorWhatsApp = () => {
    if (!selectedStudent) return;

    const url = buildWhatsAppUrl({
      phone: selectedStudent.parentId?.userId?.phone,
      message: buildBehaviorWhatsAppMessage({
        studentName: fullName(selectedStudent.userId.name),
        behaviorLabel: behaviorTypeLabels[watchedType],
        category: watchedCategory,
        description: watchedDescription,
      }),
    });

    if (!url || typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resetCreateModal = useCallback(() => {
    setShowCreate(false);
    setUploadedAttachments([]);
    setAttachmentError(null);
    reset();
  }, [reset]);

  const handleAttachmentUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) return;

    const remainingSlots = Math.max(0, 5 - uploadedAttachments.length);
    if (!remainingSlots) {
      setAttachmentError('يمكن إرفاق حتى 5 ملفات فقط');
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setAttachmentError(filesToUpload.length < files.length ? 'تم تجاهل بعض الملفات لأن الحد الأقصى هو 5 مرفقات' : null);
    setIsUploadingAttachments(true);

    const uploadResults = await Promise.allSettled(
      filesToUpload.map((file) => uploadsApi.upload('behavior', file)),
    );

    const nextAttachments: FileAttachment[] = [];
    let hasFailure = false;

    uploadResults.forEach((result) => {
      if (result.status !== 'fulfilled') {
        hasFailure = true;
        return;
      }

      const fileRecord = result.value.data.data as UploadedFile;
      nextAttachments.push({
        url: fileRecord.url,
        type: fileRecord.fileType === 'image' ? 'image' : 'document',
        name: fileRecord.fileName,
        size: fileRecord.size,
        publicId: fileRecord.publicId,
      });
    });

    if (nextAttachments.length) {
      setUploadedAttachments((prev) => [...prev, ...nextAttachments]);
    }

    if (hasFailure) {
      setAttachmentError((prev) => prev ?? 'تعذر رفع بعض الملفات');
    }

    setIsUploadingAttachments(false);
  }, [uploadedAttachments.length]);

  const removeAttachment = useCallback(async (attachment: FileAttachment) => {
    if (!attachment.publicId) {
      setUploadedAttachments((prev) => prev.filter((item) => item.url !== attachment.url));
      return;
    }

    try {
      await uploadsApi.delete(attachment.publicId);
      setUploadedAttachments((prev) => prev.filter((item) => item.publicId !== attachment.publicId));
      setAttachmentError(null);
    } catch {
      setAttachmentError('تعذر حذف المرفق');
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) => behaviorApi.create({
      ...d,
      category: d.category?.trim() || undefined,
      attachments: uploadedAttachments.length ? uploadedAttachments : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['behavior'] });
      resetCreateModal();
    },
  });

  const columns: Column<BehaviorRecord>[] = [
    {
      key: 'student',
      header: 'الطالب',
      render: (r: BehaviorRecord) => (
        <div>
          <p className="font-medium text-gray-900">{fullName(r.studentId?.userId?.name)}</p>
          <p className="text-xs text-gray-500">{r.studentId?.nationalId}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'النوع',
      render: (r: BehaviorRecord) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            r.type === 'positive'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {r.type === 'positive' ? (
            <ThumbsUp className="h-3 w-3" />
          ) : (
            <ThumbsDown className="h-3 w-3" />
          )}
          {r.type === 'positive' ? 'إيجابي' : 'سلبي'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'الفئة',
      render: (r: BehaviorRecord) =>
        r.category ? (
          <span className="text-sm text-gray-700">{r.category}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'description',
      header: 'الوصف',
      render: (r: BehaviorRecord) => (
        <span className="text-sm text-gray-600 line-clamp-2">{r.description}</span>
      ),
    },
    {
      key: 'teacher',
      header: 'سجله',
      render: (r: BehaviorRecord) => (
        <span className="text-sm text-gray-700">{fullName(r.teacherId?.userId?.name)}</span>
      ),
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (r: BehaviorRecord) => (
        <span className="text-sm text-gray-700">{formatDate(r.createdAt)}</span>
      ),
    },
  ];

  const canRecord = user?.role === 'teacher' || user?.role === 'school_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجلات السلوك"
        description="تتبع سلوك الطلاب الإيجابي والسلبي"
        action={
          canRecord ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 me-1" /> تسجيل سلوك
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">تصفية:</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">جميع الأنواع</option>
          <option value="positive">إيجابي</option>
          <option value="negative">سلبي</option>
        </select>
        {filterType && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setPage(1); }}>
            مسح
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm font-medium">إيجابي</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-800">
            {(data?.data ?? []).filter((r: BehaviorRecord) => r.type === 'positive').length}
          </p>
          <p className="text-xs text-green-600">في هذه الصفحة</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <ThumbsDown className="h-5 w-5" />
            <span className="text-sm font-medium">سلبي</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-800">
            {(data?.data ?? []).filter((r: BehaviorRecord) => r.type === 'negative').length}
          </p>
          <p className="text-xs text-red-600">في هذه الصفحة</p>
        </div>
      </div>

      <Table<BehaviorRecord>
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

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={resetCreateModal}
        title="تسجيل سلوك"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={resetCreateModal}>إلغاء</Button>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedStudent?.parentId?.userId?.phone || !watchedDescription?.trim()}
              onClick={handleBehaviorWhatsApp}
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              <MessageCircle className="h-4 w-4" /> واتساب ولي الأمر
            </Button>
            <Button
              loading={isSubmitting || createMutation.isPending || isUploadingAttachments}
              disabled={isUploadingAttachments}
              onClick={handleSubmit((d) => createMutation.mutate(d))}
            >
              حفظ السجل
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">نوع السلوك</label>
            <div className="grid grid-cols-2 gap-3">
              {(['positive', 'negative'] as const).map((t) => (
                <label
                  key={t}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                    watchedType === t
                      ? t === 'positive'
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" {...register('type')} value={t} className="sr-only" />
                  {t === 'positive' ? (
                    <ThumbsUp className={`h-4 w-4 ${watchedType === t ? 'text-green-600' : 'text-gray-400'}`} />
                  ) : (
                    <ThumbsDown className={`h-4 w-4 ${watchedType === t ? 'text-red-600' : 'text-gray-400'}`} />
                  )}
                  <span className={`text-sm font-medium ${watchedType === t ? (t === 'positive' ? 'text-green-700' : 'text-red-700') : 'text-gray-600'}`}>
                    {t === 'positive' ? 'إيجابي' : 'سلبي'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الفصل</label>
            <select
              {...register('classId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">اختر فصل…</option>
              {(classesData?.data ?? []).map((c: { _id: string; name: string; grade: string }) => (
                <option key={c._id} value={c._id}>{c.name} — صف {c.grade}</option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-xs text-red-600">{errors.classId.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الطالب</label>
            <select
              {...register('studentId')}
              disabled={!watchedClassId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">اختر طالب…</option>
              {(studentsData ?? []).map((s: Student) => (
                <option key={s._id} value={s._id}>{fullName(s.userId.name)}</option>
              ))}
            </select>
            {errors.studentId && <p className="mt-1 text-xs text-red-600">{errors.studentId.message}</p>}
          </div>

          {selectedStudent && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-gray-500">سيتم فتح واتساب إلى ولي الأمر</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{fullName(selectedStudent.parentId?.userId?.name)}</p>
              <p className="mt-1 text-xs text-gray-600" dir="ltr">
                {selectedStudent.parentId?.userId?.phone || 'لا يوجد رقم جوال لولي الأمر'}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الفئة (اختياري)</label>
            <select
              {...register('category')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">اختر فئة…</option>
              {BEHAVIOR_CATEGORIES[watchedType ?? 'positive'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الوصف</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="اشرح السلوك بالتفصيل…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">المرفقات (اختياري)</label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
              <span className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>إضافة صور أو ملفات PDF</span>
              </span>
              {isUploadingAttachments ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : null}
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleAttachmentUpload}
                className="hidden"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">حتى 5 ملفات. الأنواع المسموحة: صور وPDF.</p>
            {attachmentError && <p className="mt-1 text-xs text-red-600">{attachmentError}</p>}

            {uploadedAttachments.length > 0 && (
              <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                {uploadedAttachments.map((attachment) => (
                  <div
                    key={attachment.publicId ?? attachment.url}
                    className="flex items-center gap-3 rounded-lg bg-white px-3 py-2"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {attachment.type === 'image' ? 'صورة' : 'مستند'}
                        {attachment.size ? ` • ${(attachment.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { void removeAttachment(attachment); }}
                      className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      title="حذف المرفق"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register('notifyParent')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <span className="text-sm text-gray-700">إشعار ولي الأمر بالإشعار</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
