'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import AlertBanner from '@/components/ui/AlertBanner';
import Button from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const [state, setState] = useState<'loading'|'done'|'error'>('loading');
  useEffect(() => { const token = new URLSearchParams(window.location.search).get('token') || ''; if (!token) { setState('error'); return; } authApi.verifyEmail(token).then(() => setState('done')).catch(() => setState('error')); }, []);
  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4"><div className="w-full max-w-md space-y-4 rounded-2xl border border-stroke bg-white/90 p-6 dark:bg-navy-900"><h1 className="text-xl font-bold text-ink">تأكيد البريد الإلكتروني</h1>{state === 'loading' && <p className="text-sm text-ink-dim">جارٍ التحقق...</p>}{state === 'done' && <AlertBanner variant="success">تم تأكيد البريد الإلكتروني بنجاح.</AlertBanner>}{state === 'error' && <AlertBanner variant="error">الرابط غير صالح أو منتهي.</AlertBanner>}<Link href="/login"><Button className="w-full">تسجيل الدخول</Button></Link></div></main>;
}
