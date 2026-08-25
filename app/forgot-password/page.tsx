'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SelectField from '@/components/ui/SelectField';
import AlertBanner from '@/components/ui/AlertBanner';

type RecoveryIdentity = { requestId: string; challengeToken: string; school: { name: string }; classes: Array<{ _id: string; name: string; grade: string; section?: string | null }> };

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [step, setStep] = useState(1);
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identity, setIdentity] = useState<RecoveryIdentity | null>(null);
  const [grade, setGrade] = useState('');
  const [classId, setClassId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const grades = useMemo(() => Array.from(new Set(identity?.classes.map((item) => item.grade) || [])), [identity]);
  const classes = identity?.classes.filter((item) => !grade || item.grade === grade) || [];

  const run = async (action: () => Promise<void>) => { setBusy(true); setError(null); try { await action(); } catch (err) { setError(getApiErrorMessage(err, 'تعذر إكمال الطلب. تحقق من البيانات وحاول مرة أخرى.')); } finally { setBusy(false); } };

  const identify = () => run(async () => {
    const data = await authApi.identifyStudentRecovery({ nationalId, phone }).then(getEntityPayload<RecoveryIdentity>);
    setIdentity(data); setStep(2);
  });
  const submitRequest = () => run(async () => {
    if (!identity) return;
    await authApi.submitStudentRecovery({ requestId: identity.requestId, challengeToken: identity.challengeToken, grade, classId });
    setMessage('تم إرسال الطلب إلى إدارة المدرسة. بعد استلام الرمز عبر واتساب أدخله أدناه.'); setStep(3);
  });
  const complete = () => run(async () => {
    if (!identity) return;
    await authApi.completeStudentRecovery({ requestId: identity.requestId, otp, newPassword });
    setMessage('تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.'); setStep(4);
  });
  const requestAdminReset = () => run(async () => {
    await authApi.requestEmailReset({ identifier: nationalId, email });
    setMessage('إذا كانت البيانات صحيحة ومؤكدة فسيصل رابط الاستعادة إلى البريد المسجل.');
  });

  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
    <div className="w-full max-w-lg rounded-2xl border border-stroke bg-white/90 p-5 shadow-xl dark:bg-navy-900 sm:p-8">
      <h1 className="text-xl font-bold text-ink">استعادة كلمة المرور</h1>
      <div className="my-5 flex rounded-xl border border-stroke p-1">
        <button className={`flex-1 rounded-lg py-2 text-sm ${mode === 'student' ? 'bg-brand-600 text-white' : 'text-ink-dim'}`} onClick={() => { setMode('student'); setMessage(null); setError(null); }}>حساب طالب</button>
        <button className={`flex-1 rounded-lg py-2 text-sm ${mode === 'admin' ? 'bg-brand-600 text-white' : 'text-ink-dim'}`} onClick={() => { setMode('admin'); setMessage(null); setError(null); }}>مدير مدرسة</button>
      </div>
      <div className="space-y-4">
        {mode === 'admin' ? <>
          <Input label="رقم الهوية" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
          <Input label="البريد الإلكتروني المؤكد" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button className="w-full" loading={busy} onClick={requestAdminReset}>إرسال رابط الاستعادة</Button>
        </> : <>
          {step === 1 && <><Input label="رقم هوية الطالب" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /><Input label="رقم الجوال المسجل" value={phone} onChange={(e) => setPhone(e.target.value)} /><Button className="w-full" loading={busy} onClick={identify}>متابعة</Button></>}
          {step === 2 && <><AlertBanner variant="info">المدرسة: {identity?.school.name}</AlertBanner><SelectField label="الصف" value={grade} onChange={(e) => { setGrade(e.target.value); setClassId(''); }}><option value="">اختر الصف...</option>{grades.map((item) => <option key={item} value={item}>{item}</option>)}</SelectField><SelectField label="الفصل" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">اختر الفصل...</option>{classes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</SelectField><Button className="w-full" disabled={!grade || !classId} loading={busy} onClick={submitRequest}>إرسال الطلب للإدارة</Button></>}
          {step === 3 && <><Input label="الرمز المؤقت (4 أرقام)" inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} /><Input label="كلمة المرور الجديدة" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="8 أحرف على الأقل، وحرف كبير وصغير ورقم" /><Button className="w-full" disabled={!/^\d{4}$/.test(otp) || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)} loading={busy} onClick={complete}>تعيين كلمة المرور</Button></>}
          {step === 4 && <Link href="/login"><Button className="w-full">العودة لتسجيل الدخول</Button></Link>}
        </>}
        {message && <AlertBanner variant="success">{message}</AlertBanner>}
        {error && <AlertBanner variant="error">{error}</AlertBanner>}
        <Link href="/login" className="block text-center text-sm text-brand-600">العودة لتسجيل الدخول</Link>
      </div>
    </div>
  </main>;
}
