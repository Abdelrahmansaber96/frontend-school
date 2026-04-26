'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { getDefaultAppRoute } from '@/lib/app-routes';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock } from 'lucide-react';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'مطلوب'),
    newPassword: z.string().min(8, '8 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'مطلوب'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push(getDefaultAppRoute(user?.role)), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message ?? 'Failed to change password.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-x-hidden overflow-y-auto bg-[var(--background)] p-4 py-8 sm:items-center">
      <div className="pointer-events-none absolute top-[-20%] start-[10%] h-[420px] w-[420px] rounded-full bg-gold-500/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] end-[10%] h-[320px] w-[320px] rounded-full bg-blue-500/[0.03] blur-[100px]" />

      <div className="glass-shine relative w-full max-w-md rounded-2xl border border-stroke bg-white/80 p-8 shadow-[0_16px_64px_rgba(0,0,0,0.2)] backdrop-blur-2xl dark:bg-glaze/[0.03]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15">
            <Lock className="h-6 w-6 text-gold-500" />
          </div>
          <h1 className="text-xl font-bold text-ink">تغيير كلمة المرور</h1>
          {user?.mustChangePassword && (
            <p className="mt-1 text-sm text-amber-600 dark:text-gold-400">
              يجب تغيير كلمة المرور قبل المتابعة.
            </p>
          )}
        </div>

        {success ? (
          <div className="rounded-xl border border-green-500/15 bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-500/[0.08] dark:text-green-300">
            تم تغيير كلمة المرور بنجاح! جاري الانتقال…
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="كلمة المرور الحالية"
              type="password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
            />
            <Input
              label="كلمة المرور الجديدة"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              hint="8 أحرف على الأقل"
            />
            <Input
              label="تأكيد كلمة المرور الجديدة"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            {serverError && (
              <div className="rounded-xl border border-red-500/15 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/[0.08] dark:text-red-300">{serverError}</div>
            )}
            <Button type="submit" className="w-full" loading={isSubmitting}>
              تحديث كلمة المرور
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
