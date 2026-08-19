'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, KeyRound, Plus, XCircle } from 'lucide-react';
import { registrationInvitesApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AlertBanner from '@/components/ui/AlertBanner';
import Badge from '@/components/ui/Badge';

interface Invite { _id: string; label?: string | null; status: 'active' | 'reserved' | 'used' | 'revoked'; expiresAt: string; usedAt?: string; usedBySchoolId?: { name: string; nameAr?: string } }

export default function RegistrationInvitesPage() {
  const qc = useQueryClient();
  const [label, setLabel] = useState('');
  const [days, setDays] = useState(7);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['registration-invites'], queryFn: () => registrationInvitesApi.list({ page: 1, limit: 100 }).then((r) => r.data.data as Invite[]) });
  const create = useMutation({
    mutationFn: () => registrationInvitesApi.create({ label: label || undefined, expiresInDays: days }),
    onSuccess: (response) => { setCreatedCode(response.data.data.code); setLabel(''); void qc.invalidateQueries({ queryKey: ['registration-invites'] }); },
  });
  const revoke = useMutation({ mutationFn: (id: string) => registrationInvitesApi.revoke(id), onSuccess: () => void qc.invalidateQueries({ queryKey: ['registration-invites'] }) });
  const statusLabel = { active: 'نشط', reserved: 'محجوز مؤقتًا', used: 'مستخدم', revoked: 'ملغي' };

  return <div className="space-y-6">
    <PageHeader title="أكواد تسجيل المدارس" description="كل كود صالح لتسجيل مدرسة واحدة فقط." />
    <section className="rounded-2xl border border-stroke bg-glaze/[0.025] p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto] sm:items-end">
        <Input label="وصف الكود (اختياري)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: مدرسة النور" />
        <Input label="الصلاحية بالأيام" type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        <Button onClick={() => create.mutate()} loading={create.isPending}><Plus className="h-4 w-4" /> إنشاء كود</Button>
      </div>
    </section>
    {createdCode && <AlertBanner variant="success"><div className="flex flex-wrap items-center justify-between gap-3"><span>انسخ الكود الآن؛ لن يظهر مرة أخرى: <b dir="ltr">{createdCode}</b></span><Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(createdCode)}><Copy className="h-4 w-4" /> نسخ</Button></div></AlertBanner>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {(query.data || []).map((invite) => <article key={invite._id} className="rounded-xl border border-stroke bg-glaze/[0.025] p-4">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-gold-500" /><p className="text-sm font-semibold text-ink">{invite.label || 'كود تسجيل'}</p></div><Badge variant={invite.status === 'active' ? 'success' : invite.status === 'used' ? 'info' : 'danger'}>{statusLabel[invite.status]}</Badge></div>
        <p className="mt-3 text-xs text-ink-dim">ينتهي: {formatDateTime(invite.expiresAt)}</p>
        {invite.usedBySchoolId && <p className="mt-1 text-xs text-ink-dim">استخدمته: {invite.usedBySchoolId.nameAr || invite.usedBySchoolId.name}</p>}
        {['active', 'reserved'].includes(invite.status) && <Button className="mt-4" size="sm" variant="danger" onClick={() => revoke.mutate(invite._id)}><XCircle className="h-4 w-4" /> إلغاء</Button>}
      </article>)}
    </div>
  </div>;
}
