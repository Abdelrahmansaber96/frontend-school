'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AlertBanner from '@/components/ui/AlertBanner';
import { getApiErrorMessage } from '@/lib/api-contracts';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState('');
  useEffect(() => setToken(new URLSearchParams(window.location.search).get('token') || ''), []);
  const submit = async () => { setBusy(true); setError(''); try { await authApi.completeEmailReset({ token, newPassword: password }); setDone(true); } catch (err) { setError(getApiErrorMessage(err, 'الرابط غير صالح أو منتهي.')); } finally { setBusy(false); } };
  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4"><div className="w-full max-w-md space-y-4 rounded-2xl border border-stroke bg-white/90 p-6 dark:bg-navy-900"><h1 className="text-xl font-bold text-ink">تعيين كلمة مرور جديدة</h1>{done ? <><AlertBanner variant="success">تم تغيير كلمة المرور بنجاح.</AlertBanner><Link href="/login"><Button className="w-full">تسجيل الدخول</Button></Link></> : <><Input label="كلمة المرور الجديدة" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="8 أحرف على الأقل، وحرف كبير وصغير ورقم" />{error && <AlertBanner variant="error">{error}</AlertBanner>}<Button className="w-full" disabled={!token || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)} loading={busy} onClick={submit}>حفظ كلمة المرور</Button></>}</div></main>;
}
