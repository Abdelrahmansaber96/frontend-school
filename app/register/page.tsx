'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, User, Building2, KeyRound, ShieldCheck } from 'lucide-react';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/ui/BrandLogo';

const schema = z.object({
  inviteCode: z.string().min(8, 'كود التسجيل مطلوب'),
  schoolName: z.string().min(2, 'اسم المدرسة مطلوب (حرفان على الأقل)'),
  schoolNameAr: z.string().optional(),
  address: z.string().min(5, 'العنوان مطلوب'),
  phone: z.string().min(7, 'رقم جوال المدرسة مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  // Admin fields
  adminFirstName: z.string().min(2, 'الاسم الأول مطلوب'),
  adminLastName: z.string().min(2, 'اسم العائلة مطلوب'),
  adminNationalId: z.string().min(5, 'رقم الهوية مطلوب'),
  adminPhone: z.string().min(7, 'رقم الجوال مطلوب'),
  adminEmail: z.string().email('بريد إلكتروني غير صالح'),
  adminPassword: z
    .string()
    .min(8, '8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'يجب أن تحتوي على حرف كبير وصغير ورقم'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((d) => d.adminPassword === d.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: 'بيانات المدرسة', icon: Building2 },
  { id: 2, label: 'حساب المدير', icon: User },
  { id: 3, label: 'تأكيد وإنشاء', icon: CheckCircle2 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState<{ name: string } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(['inviteCode', 'schoolName', 'address', 'phone', 'email']);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger([
        'adminFirstName', 'adminLastName', 'adminNationalId',
        'adminPhone', 'adminEmail', 'adminPassword', 'confirmPassword',
      ]);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.registerSchool({
        inviteCode: data.inviteCode,
        schoolName: data.schoolName,
        schoolNameAr: data.schoolNameAr || undefined,
        address: data.address,
        phone: data.phone,
        email: data.email,
        admin: {
          name: { first: data.adminFirstName, last: data.adminLastName },
          nationalId: data.adminNationalId,
          phone: data.adminPhone,
          email: data.adminEmail,
          password: data.adminPassword,
        },
      });
      setSuccess({
        name: res.data.data.school.name,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'حدث خطأ أثناء التسجيل.');
    }
  };

  // Success state
  if (success) {
    return (
      <div className="relative flex min-h-screen items-start justify-center overflow-x-hidden overflow-y-auto bg-[var(--background)] p-4 py-8 sm:items-center">
        <div className="pointer-events-none absolute top-[-20%] start-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        <div className="relative w-full max-w-[480px] animate-fade-in-up">
          <div className="glass-shine rounded-2xl border border-stroke bg-white/80 dark:bg-glaze/[0.03] backdrop-blur-2xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.2)] text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-ink mb-2">تم إنشاء المدرسة بنجاح! 🎉</h1>
            <p className="text-[13px] text-ink-dim mb-6">
              مدرستك <span className="font-semibold text-ink">{success.name}</span> جاهزة الآن.
            </p>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push('/login')}>
                تسجيل الدخول
              </Button>
              <p className="text-[11px] text-ink-faint">
                استخدم رقم الهوية وكلمة المرور التي اخترتها للدخول
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7FAF8] p-3 text-[#123B5D] dark:bg-[#071F24] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-[28px] border border-[#0B5D4B]/10 bg-white shadow-[0_28px_90px_rgba(11,93,75,0.14)] dark:border-white/10 dark:bg-[#0B2730] md:grid-cols-[0.9fr_1.1fr] sm:min-h-[calc(100vh-2.5rem)]">
        <section className="relative hidden min-h-full overflow-hidden md:block">
          <Image src="/brand/basma-saudi-campus.png" alt="بوابة مدرسة سعودية حديثة" fill priority sizes="(min-width: 768px) 45vw, 0px" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#073F37]/95 via-[#0B5D4B]/50 to-[#123B5D]/10" />
          <div className="relative flex h-full flex-col justify-between p-9 text-white lg:p-12">
            <BrandLogo variant="wordmark" size="md" className="[&>span>span:first-child]:text-white [&>span>span:last-child]:text-emerald-100" />
            <div className="max-w-lg pb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur"><KeyRound className="h-4 w-4 text-[#D1B56F]" /> التسجيل متاح بكود دعوة</span>
              <h2 className="mt-5 text-4xl font-black leading-tight">ابدأ إدارة مدرستك مع بصمة</h2>
              <p className="mt-3 text-base leading-8 text-emerald-50">أدخل بيانات المدرسة وحساب المدير، ثم راجع المعلومات قبل إنشاء الحساب.</p>
              <div className="mt-7 space-y-3 text-sm font-bold">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#D1B56F]" /> تسجيل آمن ومخصص لكل مدرسة</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#D1B56F]" /> حماية بيانات الإدارة والمستفيدين</p>
              </div>
            </div>
          </div>
        </section>
        <section className="relative flex items-start justify-center bg-[#FBFCFA] px-4 py-8 dark:bg-[#0B2730] sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-[#14866D]/10 blur-3xl" />
          <div className="relative w-full max-w-[620px] animate-fade-in-up">
            <div className="mb-6 flex justify-center md:hidden"><BrandLogo variant="wordmark" size="md" /></div>
        {/* Card */}
        <div className="rounded-3xl border border-[#0B5D4B]/10 bg-white p-5 shadow-[0_16px_50px_rgba(18,59,93,0.10)] dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <BrandLogo variant="mark" size="md" className="mb-4" />
            <h1 className="text-[22px] font-bold tracking-tight text-ink">تسجيل مدرسة جديدة</h1>
            <p className="mt-1.5 text-[13px] text-ink-dim">أنشئ حسابك المدرسي وابدأ إدارة مدرستك</p>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-between gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                    isDone ? 'bg-[#D3E9DF] text-[#14866D] dark:bg-[#14866D]/20' :
                    isActive ? 'bg-[#0B5D4B] text-white shadow-md shadow-[#0B5D4B]/20' :
                    'bg-glaze/[0.06] text-ink-faint'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`hidden sm:block text-[11px] font-medium ${
                    isActive ? 'text-ink' : 'text-ink-faint'
                  }`}>{s.label}</span>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-px flex-1 ${isDone ? 'bg-[#14866D]/40' : 'bg-stroke'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: School info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="كود تسجيل المدرسة"
                  placeholder="أدخل الكود المرسل من إدارة المنصة"
                  error={errors.inviteCode?.message}
                  {...register('inviteCode')}
                />
                <Input
                  label="اسم المدرسة"
                  placeholder="مدرسة النور الابتدائية"
                  error={errors.schoolName?.message}
                  {...register('schoolName')}
                />
                <Input
                  label="اسم المدرسة بالإنجليزية (اختياري)"
                  placeholder="Al-Noor Primary School"
                  {...register('schoolNameAr')}
                />
                <Input
                  label="العنوان"
                  placeholder="حي النزهة، الرياض"
                  error={errors.address?.message}
                  {...register('address')}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="رقم الجوال"
                    placeholder="0112345678"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="البريد الإلكتروني للمدرسة"
                    type="email"
                    placeholder="info@school.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Admin account */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="الاسم الأول"
                    placeholder="أحمد"
                    error={errors.adminFirstName?.message}
                    {...register('adminFirstName')}
                  />
                  <Input
                    label="اسم العائلة"
                    placeholder="محمد"
                    error={errors.adminLastName?.message}
                    {...register('adminLastName')}
                  />
                </div>
                <Input
                  label="رقم الهوية"
                  placeholder="1234567890"
                  error={errors.adminNationalId?.message}
                  {...register('adminNationalId')}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="رقم الجوال"
                    placeholder="0501234567"
                    error={errors.adminPhone?.message}
                    {...register('adminPhone')}
                  />
                  <Input
                    label="بريد المدير لاستعادة الحساب"
                    type="email"
                    placeholder="admin@school.com"
                    error={errors.adminEmail?.message}
                    {...register('adminEmail')}
                  />
                </div>
                <Input
                  label="كلمة المرور"
                  type="password"
                  placeholder="••••••••"
                  error={errors.adminPassword?.message}
                  hint="8 أحرف على الأقل، حرف كبير وصغير ورقم"
                  {...register('adminPassword')}
                />
                <Input
                  label="تأكيد كلمة المرور"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4 space-y-3">
                  <h4 className="text-[13px] font-semibold text-ink flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-brand-600" />
                    بيانات المدرسة
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div><span className="text-ink-faint">الاسم: </span><span className="text-ink font-medium">{watch('schoolName')}</span></div>
                    <div><span className="text-ink-faint">الجوال: </span><span className="text-ink font-medium">{watch('phone')}</span></div>
                    <div className="col-span-2"><span className="text-ink-faint">العنوان: </span><span className="text-ink font-medium">{watch('address')}</span></div>
                    {watch('email') && <div><span className="text-ink-faint">البريد: </span><span className="text-ink font-medium">{watch('email')}</span></div>}
                  </div>
                </div>

                <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4 space-y-3">
                  <h4 className="text-[13px] font-semibold text-ink flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-600" />
                    حساب المدير
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div><span className="text-ink-faint">الاسم: </span><span className="text-ink font-medium">{watch('adminFirstName')} {watch('adminLastName')}</span></div>
                    <div><span className="text-ink-faint">الهوية: </span><span className="text-ink font-medium">{watch('adminNationalId')}</span></div>
                    <div><span className="text-ink-faint">الجوال: </span><span className="text-ink font-medium">{watch('adminPhone')}</span></div>
                    <div><span className="text-ink-faint">كلمة المرور: </span><span className="text-ink font-medium">••••••••</span></div>
                  </div>
                </div>
              </div>
            )}

            {serverError && (
              <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3 text-[13px] text-red-600 dark:text-red-400/80">
                {serverError}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 flex items-center gap-3">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 me-1 rotate-180" /> السابق
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  التالي <ArrowLeft className="h-4 w-4 ms-1" />
                </Button>
              ) : (
                <Button type="submit" loading={isSubmitting} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 me-1" /> إنشاء المدرسة
                </Button>
              )}
            </div>
          </form>

          {/* Link to login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-[13px] text-ink-dim hover:text-ink transition-colors duration-200">
              لديك حساب بالفعل؟ <span className="text-brand-600 font-semibold">تسجيل الدخول</span>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-faint">
          © {new Date().getFullYear()} منصة بصمة التعليمية
        </p>
          </div>
        </section>
      </div>
    </div>
  );
}
