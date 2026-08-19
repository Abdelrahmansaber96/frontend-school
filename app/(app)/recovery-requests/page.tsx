'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, MessageCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload, getListPayload } from '@/lib/api-contracts';
import { buildPasswordChangedConfirmationMessage, buildRecoveryCodeWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AlertBanner from '@/components/ui/AlertBanner';

type RecoveryRequest = { _id: string; status: string; createdAt: string; requestedAt?: string; student: null | { name: string; nationalId?: string; guardianPhone?: string | null; class?: { name: string; grade: string } } };
type Issued = { otp: string; studentName: string; phone?: string | null; expiresAt: string };

export default function RecoveryRequestsPage() {
  const queryClient = useQueryClient(); const [issued, setIssued] = useState<Issued | null>(null); const [error, setError] = useState('');
  const query = useQuery({ queryKey: ['student-recovery-requests'], queryFn: () => authApi.listStudentRecoveryRequests({ page: 1, limit: 100 }).then(getListPayload<RecoveryRequest>) });
  const mutation = useMutation({ mutationFn: (id: string) => authApi.issueStudentRecoveryCode(id).then(getEntityPayload<Issued>), onMutate: () => { setError(''); setIssued(null); }, onSuccess: (data) => { setIssued(data); void queryClient.invalidateQueries({ queryKey: ['student-recovery-requests'] }); }, onError: (err) => setError(getApiErrorMessage(err, 'تعذر إنشاء الرمز.')) });
  const rows = query.data?.items || [];
  const openWhatsApp = () => { if (!issued) return; const url = buildWhatsAppUrl({ phone: issued.phone, message: buildRecoveryCodeWhatsAppMessage({ studentName: issued.studentName, code: issued.otp }) }); if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
  return <div className="space-y-6"><PageHeader title="طلبات استعادة الطلاب" description="تحقق من الطلب ثم أنشئ رمزًا مؤقتًا وافتح واتساب يدويًا لإرساله." />
    {issued && <AlertBanner variant="warning"><div className="space-y-2"><p>الرمز يظهر مرة واحدة فقط: <strong dir="ltr" className="text-lg">{issued.otp}</strong> — صالح حتى {formatDateTime(issued.expiresAt)}</p>{issued.phone ? <Button size="sm" onClick={openWhatsApp}><MessageCircle className="h-4 w-4" /> فتح واتساب وإرسال الرمز</Button> : <p>لا يوجد رقم تواصل مسجل.</p>}</div></AlertBanner>}
    {error && <AlertBanner variant="error">{error}</AlertBanner>}
    <div className="grid gap-3">{rows.map((row) => <article key={row._id} className="rounded-xl border border-stroke bg-glaze/[0.03] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-ink">{row.student?.name || 'طالب غير متاح'}</h2><p className="mt-1 text-xs text-ink-faint">هوية: {row.student?.nationalId || '—'} • {row.student?.class?.grade || '—'} / {row.student?.class?.name || '—'} • {formatDateTime(row.requestedAt || row.createdAt)}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant={row.status === 'completed' ? 'success' : row.status === 'code_sent' ? 'warning' : 'info'}>{row.status === 'pending' ? 'بانتظار الإجراء' : row.status === 'code_sent' ? 'تم إصدار الرمز' : row.status === 'completed' ? 'مكتمل' : row.status}</Badge>{['pending', 'code_sent'].includes(row.status) && <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate(row._id)}><KeyRound className="h-4 w-4" /> إنشاء رمز جديد</Button>}{row.status === 'completed' && row.student?.guardianPhone && <Button size="sm" variant="secondary" onClick={() => { const url = buildWhatsAppUrl({ phone: row.student?.guardianPhone, message: buildPasswordChangedConfirmationMessage({ studentName: row.student?.name || 'الطالب' }) }); if (url) window.open(url, '_blank', 'noopener,noreferrer'); }}><MessageCircle className="h-4 w-4" /> إرسال تأكيد التغيير</Button>}</div></div></article>)}</div>
    {!query.isLoading && !rows.length && <div className="rounded-xl border border-dashed border-stroke p-8 text-center text-sm text-ink-faint">لا توجد طلبات استعادة حاليًا.</div>}
  </div>;
}
