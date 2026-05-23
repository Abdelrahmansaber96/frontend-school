'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, TriangleAlert } from 'lucide-react';
import { schoolsApi, usersApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-contracts';
import { useAuthStore } from '@/store/auth.store';
import { fullName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import AlertBanner from '@/components/ui/AlertBanner';
import { PageSpinner } from '@/components/ui/Spinner';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(9, 'Min 9 digits'),
  email: z.string().email().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const PURGE_CONFIRMATION_TEXT = 'حذف جميع البيانات';
const arabicIntegerFormatter = new Intl.NumberFormat('ar-EG');

type PurgeSchoolDataResponse = {
  counts: {
    uploads: number;
    auditLogs: number;
    notifications: number;
    messages: number;
    conversations: number;
    attendance: number;
    behavior: number;
    grades: number;
    students: number;
    parents: number;
    teachers: number;
    subjects: number;
    classes: number;
    users: number;
  };
  totalDeleted: number;
};

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purgeConfirmationText, setPurgeConfirmationText] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState<PurgeSchoolDataResponse | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const canPurgeSchoolData = user?.role === 'school_admin';

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      firstName: meData?.name?.first ?? '',
      lastName: meData?.name?.last ?? '',
      phone: meData?.phone ?? '',
      email: meData?.email ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) =>
      usersApi.updateMe({
        name: { first: d.firstName, last: d.lastName },
        phone: d.phone,
        email: d.email || undefined,
      }),
    onSuccess: (res) => {
      const updated = res.data.data;
      if (user) {
        setAuth({ ...user, name: updated.name });
      }
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const purgeSchoolDataMutation = useMutation({
    mutationFn: () => schoolsApi.purgeCurrentData({
      confirmationText: purgeConfirmationText.trim(),
    }).then((response) => response.data.data as PurgeSchoolDataResponse),
    onMutate: () => {
      setPurgeError(null);
      setPurgeSuccess(null);
    },
    onSuccess: async (summary) => {
      setPurgeSuccess(summary);
      setPurgeConfirmationText('');
      await queryClient.invalidateQueries();
    },
    onError: (error) => {
      setPurgeError(getApiErrorMessage(error, 'تعذر حذف بيانات المدرسة الحالية.'));
    },
  });

  const purgeSummaryText = purgeSuccess
    ? `تم حذف ${arabicIntegerFormatter.format(purgeSuccess.totalDeleted)} عنصرًا، منها ${arabicIntegerFormatter.format(purgeSuccess.counts.students)} طالب، ${arabicIntegerFormatter.format(purgeSuccess.counts.teachers)} معلم، ${arabicIntegerFormatter.format(purgeSuccess.counts.parents)} ولي أمر، ${arabicIntegerFormatter.format(purgeSuccess.counts.classes)} فصل، و${arabicIntegerFormatter.format(purgeSuccess.counts.subjects)} مادة. تم الإبقاء على حسابات مديري المدرسة وبيانات المدرسة الأساسية.`
    : null;

  const handlePurgeSchoolData = () => {
    if (purgeConfirmationText.trim() !== PURGE_CONFIRMATION_TEXT) {
      return;
    }

    const confirmed = window.confirm('سيتم حذف جميع بيانات المدرسة التشغيلية نهائيًا مع الإبقاء على حساب مدير المدرسة وبيانات المدرسة الأساسية. هل تريد المتابعة؟');
    if (!confirmed) {
      return;
    }

    purgeSchoolDataMutation.mutate();
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="الملف الشخصي"
        description="إدارة معلوماتك الشخصية"
        action={
          !editMode ? (
            <Button variant="outline" onClick={() => setEditMode(true)}>تعديل الملف</Button>
          ) : undefined
        }
      />

      {purgeSummaryText && (
        <AlertBanner variant="success">{purgeSummaryText}</AlertBanner>
      )}

      {purgeError && (
        <AlertBanner variant="error">{purgeError}</AlertBanner>
      )}

      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={user?.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName(user?.name)}</h2>
            <p className="text-sm text-gray-500">{meData?.phone}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="info" className="capitalize">
                {user?.role?.replace('_', ' ')}
              </Badge>
              <Badge variant={meData?.isActive ? 'success' : 'danger'}>
                {meData?.isActive ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            تم تحديث الملف بنجاح!
          </div>
        )}

        {editMode ? (
          <form
            onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="الاسم الأول" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="اسم العائلة" {...register('lastName')} error={errors.lastName?.message} />
              <Input label="رقم الجوال" {...register('phone')} error={errors.phone?.message} />
              <Input label="البريد الإلكتروني (اختياري)" type="email" {...register('email')} error={errors.email?.message} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditMode(false)}>إلغاء</Button>
              <Button type="submit" loading={isSubmitting}>حفظ التغييرات</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">الاسم الأول:</span> <span className="font-medium">{meData?.name?.first}</span></div>
            <div><span className="text-gray-500">اسم العائلة:</span> <span className="font-medium">{meData?.name?.last}</span></div>
            <div><span className="text-gray-500">رقم الجوال:</span> <span className="font-medium">{meData?.phone}</span></div>
            <div><span className="text-gray-500">البريد الإلكتروني:</span> <span className="font-medium">{meData?.email ?? '—'}</span></div>
            <div><span className="text-gray-500">الدور:</span> <span className="font-medium capitalize">{user?.role?.replace('_', ' ')}</span></div>
          </div>
        )}
      </div>

      {canPurgeSchoolData && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-red-200 pb-3">
            <TriangleAlert className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-700">منطقة خطرة</h3>
          </div>

          <div className="space-y-2 text-sm text-red-700">
            <p>هذا الإجراء يحذف جميع بيانات المدرسة التشغيلية نهائيًا: الطلاب، المعلمين، أولياء الأمور، الفصول، المواد، الدرجات، الحضور، السلوك، الرسائل، الإشعارات، الملفات، والسجلات المرتبطة بالمدرسة.</p>
            <p>سيتم الإبقاء على حسابات مدير المدرسة وسجل المدرسة الأساسي فقط حتى تتمكن من الدخول والبدء من جديد.</p>
          </div>

          <Input
            label={`للتأكيد اكتب العبارة التالية حرفيًا: ${PURGE_CONFIRMATION_TEXT}`}
            value={purgeConfirmationText}
            onChange={(event) => setPurgeConfirmationText(event.target.value)}
            placeholder={PURGE_CONFIRMATION_TEXT}
            hint="لن يتم تفعيل زر الحذف حتى تتطابق العبارة بالكامل."
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="danger"
              loading={purgeSchoolDataMutation.isPending}
              disabled={purgeConfirmationText.trim() !== PURGE_CONFIRMATION_TEXT}
              onClick={handlePurgeSchoolData}
            >
              <Trash2 className="h-4 w-4" />
              حذف جميع البيانات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
