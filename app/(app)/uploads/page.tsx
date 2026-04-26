'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, ImageIcon, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { uploadsApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-contracts';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { UploadedFile } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import AlertBanner from '@/components/ui/AlertBanner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import Table, { type Column } from '@/components/ui/Table';

type UploadContext = 'avatar' | 'behavior' | 'message' | 'import';

const contextOptions: Array<{ value: UploadContext; label: string; accept?: string }> = [
  { value: 'behavior', label: 'مرفقات السلوك', accept: 'image/*,application/pdf' },
  { value: 'message', label: 'مرفقات الرسائل', accept: 'image/*,application/pdf,.doc,.docx' },
  { value: 'import', label: 'ملفات الاستيراد', accept: '.csv,.xls,.xlsx' },
  { value: 'avatar', label: 'صور الحسابات', accept: 'image/*' },
];

const getFileIcon = (fileType: UploadedFile['fileType']) => {
  if (fileType === 'image') return <ImageIcon className="h-4 w-4 text-sky-500" />;
  if (fileType === 'spreadsheet') return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
  return <Paperclip className="h-4 w-4 text-amber-500" />;
};

export default function UploadsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManageUploads = hasAnyRole(user?.role, roleGroups.staff);
  const [page, setPage] = useState(1);
  const [selectedContext, setSelectedContext] = useState<UploadContext>('behavior');
  const [filterContext, setFilterContext] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const uploadsQuery = useQuery({
    queryKey: ['uploads', page, filterContext],
    queryFn: () => uploadsApi.list({ page, limit: 12, context: filterContext || undefined }).then((response) => response.data),
    enabled: canManageUploads,
    staleTime: 15_000,
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadsApi.upload(selectedContext, selectedFile!),
    onSuccess: () => {
      setSelectedFile(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'تعذر رفع الملف.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => uploadsApi.delete(publicId),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'تعذر حذف الملف.'));
    },
  });

  const rows: UploadedFile[] = uploadsQuery.data?.data ?? [];

  const columns = useMemo<Column<UploadedFile>[]>(() => [
    {
      key: 'fileName',
      header: 'الملف',
      render: (file) => (
        <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-ink hover:text-gold-500">
          {getFileIcon(file.fileType)}
          <span className="truncate">{file.fileName}</span>
        </a>
      ),
    },
    {
      key: 'context',
      header: 'السياق',
      render: (file) => <span className="text-xs font-medium uppercase text-ink-faint">{file.context}</span>,
    },
    {
      key: 'size',
      header: 'الحجم',
      render: (file) => formatFileSize(file.size),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (file) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${file.isOrphaned ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}>
          {file.isOrphaned ? 'غير مرتبط' : 'مرتبط'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاريخ الرفع',
      render: (file) => formatDateTime(file.createdAt),
    },
    {
      key: 'actions',
      header: 'إجراء',
      render: (file) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteMutation.mutate(file.publicId)}
          loading={deleteMutation.isPending && deleteMutation.variables === file.publicId}
        >
          <Trash2 className="h-4 w-4 text-red-500" /> حذف
        </Button>
      ),
    },
  ], [deleteMutation]);

  const selectedAccept = contextOptions.find((option) => option.value === selectedContext)?.accept;

  if (!canManageUploads) {
    return (
      <RestrictedAccessState
        icon={UploadCloud}
        description="هذه الصفحة متاحة لإدارة المدرسة والمعلمين فقط."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الملفات"
        description="رفع الملفات ومراجعة آخر الملفات المخزنة ضمن المدرسة."
      />

      {actionError && (
        <AlertBanner variant="error">
          {actionError}
        </AlertBanner>
      )}

      <section className="rounded-2xl border border-stroke bg-glaze/[0.02] p-5">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm text-ink-dim">
            <span className="block font-medium">نوع الرفع</span>
            <select
              value={selectedContext}
              onChange={(event) => setSelectedContext(event.target.value as UploadContext)}
              className="w-full rounded-xl border border-stroke bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold-500"
            >
              {contextOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-ink-dim">
            <span className="block font-medium">اختر ملفاً واحداً</span>
            <input
              type="file"
              accept={selectedAccept}
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-xl border border-dashed border-stroke bg-white/60 px-3 py-2.5 text-sm text-ink file:me-3 file:rounded-lg file:border-0 file:bg-gold-500/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gold-700"
            />
          </label>

          <Button
            onClick={() => {
              if (!selectedFile) {
                setActionError('اختر ملفاً قبل الرفع.');
                return;
              }
              uploadMutation.mutate();
            }}
            loading={uploadMutation.isPending}
          >
            <UploadCloud className="h-4 w-4" /> رفع الملف
          </Button>
        </div>

        <p className="mt-3 text-xs text-ink-faint">
          المرفقات التي تُستخدم داخل السلوك أو الرسائل ستتحول تلقائياً من غير مرتبطة إلى مرتبطة بعد ربطها بالسجل المناسب.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">آخر الملفات</h2>
            <p className="text-xs text-ink-faint">يمكنك تصفية النتائج حسب السياق.</p>
          </div>

          <select
            value={filterContext}
            onChange={(event) => {
              setPage(1);
              setFilterContext(event.target.value);
            }}
            className="rounded-xl border border-stroke bg-white/80 px-3 py-2 text-sm text-ink outline-none transition focus:border-gold-500"
          >
            <option value="">كل السياقات</option>
            {contextOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {uploadsQuery.isLoading && rows.length === 0 ? (
          <Table columns={columns} data={[]} loading />
        ) : rows.length ? (
          <>
            <Table columns={columns} data={rows} />
            {uploadsQuery.data?.meta && (
              <Pagination
                page={uploadsQuery.data.meta.page}
                pages={uploadsQuery.data.meta.pages}
                total={uploadsQuery.data.meta.total}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <EmptyState
            title="لا توجد ملفات حتى الآن"
            description="ارفع ملفاً جديداً أو غيّر الفلتر لعرض سياقات أخرى."
          />
        )}
      </section>
    </div>
  );
}