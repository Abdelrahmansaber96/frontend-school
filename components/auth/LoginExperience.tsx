'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyhole, Phone } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getDefaultAppRoute } from '@/lib/app-routes';
import { syncFrontendAccessToken } from '@/lib/auth-session';
import { extractAccessToken, extractAccessTokenFromHeaders } from '@/lib/auth-session-shared';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/ui/BrandLogo';

const schema = z.object({
  identifier: z.string().min(1, 'رقم الهوية أو رقم الجوال مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  identifierType: z.enum(['nationalId', 'phone']),
});
type FormData = z.infer<typeof schema>;
export default function LoginExperience() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { identifierType: 'nationalId' },
  });
  const identifierType = watch('identifierType');
  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { user } = res.data.data;
      const accessToken = extractAccessToken(res.data) || extractAccessTokenFromHeaders(res.headers as Record<string, unknown> | undefined);
      if (accessToken) syncFrontendAccessToken(accessToken);
      setAuth(user);
      if (user.mustChangePassword) return router.replace('/change-password');
      router.replace(getDefaultAppRoute(user.role));
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] p-3 text-[#123B5D] dark:bg-[#071F24] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-[0_28px_90px_rgba(11,93,75,0.14)] dark:border-white/10 dark:bg-[#0B2730] md:grid-cols-[1.1fr_0.9fr] sm:min-h-[calc(100vh-2.5rem)]">
        <section className="relative hidden min-h-full overflow-hidden md:block">
          <Image src="/brand/basma-saudi-campus.png" alt="بوابة مدرسة سعودية" fill priority sizes="(min-width: 768px) 60vw, 0px" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#073F37]/95 via-[#0B5D4B]/45 to-[#123B5D]/10" />
          <div className="relative flex h-full flex-col justify-between p-9 text-white lg:p-12">
            <BrandLogo variant="wordmark" size="md" className="[&>span>span:first-child]:text-white [&>span>span:last-child]:text-emerald-100" showEnglish />
            <div className="max-w-xl pb-6">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">منصة تعليمية متكاملة</span>
              <h1 className="mt-5 text-4xl font-black leading-tight lg:text-5xl">منصة بصمة التعليمية</h1>
              <p className="mt-3 text-lg leading-8 text-emerald-50">إدارة مدرسية موثوقة تجمع الإدارة والمعلمين والطلاب وأولياء الأمور في مكان واحد.</p>
              <div className="mt-7 grid grid-cols-3 gap-3 text-center text-xs font-bold">
                {['إدارة المدرسة', 'متابعة الطلاب', 'تواصل آمن'].map((item) => <span key={item} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur">{item}</span>)}
              </div>
            </div>
          </div>
        </section>
        <section className="relative flex items-center justify-center bg-[#FBFCFA] px-5 py-10 dark:bg-[#0B2730] sm:px-10">
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-[#14866D]/10 blur-3xl" />
          <div className="relative w-full max-w-md">
            <div className="mb-8 flex justify-center md:hidden"><BrandLogo variant="wordmark" size="md" /></div>
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#0B5D4B]/10 bg-[#E9F4EF] shadow-sm dark:bg-[#14866D]/10"><BrandLogo variant="mark" size="lg" /></div>
              <h2 className="text-2xl font-black text-[#0B5D4B] dark:text-emerald-100">تسجيل الدخول</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">أدخل بيانات حسابك للمتابعة</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 rounded-xl border border-[#0B5D4B]/10 p-1 dark:border-white/10">
                {(['nationalId', 'phone'] as const).map((type) => <button key={type} type="button" onClick={() => setValue('identifierType', type)} className={`min-h-10 rounded-lg text-xs font-bold transition ${identifierType === type ? 'bg-[#E1F0E8] text-[#0B5D4B] dark:bg-[#14866D]/20 dark:text-emerald-100' : 'text-slate-500 dark:text-slate-300'}`}>{type === 'nationalId' ? 'رقم الهوية' : 'رقم الجوال'}</button>)}
              </div>
              <input type="hidden" {...register('identifierType')} />
              <Input label={identifierType === 'nationalId' ? 'رقم الهوية الوطنية' : 'رقم الجوال'} placeholder={identifierType === 'nationalId' ? 'أدخل رقم الهوية الوطنية' : 'أدخل رقم الجوال'} inputMode="numeric" error={errors.identifier?.message} {...register('identifier')} />
              <Input label="كلمة المرور" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
              {serverError && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{serverError}</div>}
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}><LockKeyhole className="h-4 w-4" />تسجيل الدخول</Button>
              <Link href="/forgot-password" className="block text-center text-sm font-bold text-[#0B5D4B] hover:text-[#14866D]">نسيت كلمة المرور؟</Link>
            </form>
            <div className="mt-7 rounded-2xl border border-[#B89647]/25 bg-[#FFF9EA] p-4 text-center text-xs text-[#123B5D] dark:bg-[#B89647]/10 dark:text-amber-100"><p className="font-bold">هل ترغب في تسجيل مدرسة جديدة؟</p><Link href="/register" className="mt-2 inline-flex items-center gap-1 font-black text-[#0B5D4B] underline underline-offset-4">سجّل مدرستك بكود الدعوة <Phone className="h-3.5 w-3.5" /></Link></div>
            <p className="mt-7 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} منصة بصمة التعليمية</p>
          </div>
        </section>
      </div>
    </main>
  );
}
