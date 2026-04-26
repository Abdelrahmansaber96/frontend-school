'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { School } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getDefaultAppRoute } from '@/lib/app-routes';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
  identifierType: z.enum(['nationalId', 'phone']),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifierType: 'nationalId' as const },
  });
  const identifierType = watch('identifierType');

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { user } = res.data.data;
      setAuth(user);

      // Role-based redirect
      if (user.mustChangePassword) return router.push('/change-password');
      router.push(getDefaultAppRoute(user.role));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'فشل تسجيل الدخول. تحقّق من بياناتك.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-x-hidden overflow-y-auto bg-[var(--background)] p-4 py-8 sm:items-center">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute top-[-20%] start-[10%] h-[500px] w-[500px] rounded-full bg-gold-500/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] end-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />

      <div className="relative w-full max-w-[420px] animate-fade-in-up">
        {/* Card */}
        <div className="glass-shine rounded-2xl border border-stroke bg-white/80 dark:bg-glaze/[0.03] backdrop-blur-2xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.2)]">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 gold-glow-strong">
              <School className="h-7 w-7 text-navy-950" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">مرحباً بك في بصمة</h1>
            <p className="mt-1.5 text-[13px] text-ink-dim">سجّل دخولك إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Login type toggle */}
            <div className="flex rounded-xl border border-stroke bg-glaze/[0.02] p-1 gap-1">
              {(['nationalId', 'phone'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('identifierType', type)}
                  className={`flex-1 rounded-lg py-2 text-center text-[13px] font-medium transition-all duration-200 ${
                    identifierType === type
                      ? 'bg-gold-500 text-navy-950 shadow-sm'
                      : 'text-ink-faint hover:text-ink'
                  }`}
                >
                  {type === 'nationalId' ? 'رقم الهوية' : 'رقم الجوال'}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('identifierType')} />

            <Input
              label="المعرّف"
              placeholder="رقم الهوية أو رقم الجوال"
              error={errors.identifier?.message}
              {...register('identifier')}
            />
            <Input
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3 text-[13px] text-red-600 dark:text-red-400/80">{serverError}</div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              تسجيل الدخول
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Link href="/register" className="text-[13px] text-ink-dim hover:text-ink transition-colors duration-200">
            ليس لديك حساب؟ <span className="text-gold-500 font-semibold">سجّل مدرستك</span>
          </Link>
          <p className="text-[11px] text-ink-faint">
            © {new Date().getFullYear()} منصة بصمة التعليمية
          </p>
        </div>
      </div>
    </div>
  );
}
