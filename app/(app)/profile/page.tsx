'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { fullName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(9, 'Min 9 digits'),
  email: z.string().email().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);

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
    </div>
  );
}
