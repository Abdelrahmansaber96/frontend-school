'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, MessageCircle, UserCheck, UserX } from 'lucide-react';
import { authApi, usersApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import AlertBanner from '@/components/ui/AlertBanner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Input from '@/components/ui/Input';
import { buildPasswordResetWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

interface AccountActionPanelProps {
  account: {
    _id: string;
    name: string;
    isActive: boolean;
    mustChangePassword?: boolean;
    lastLogin?: string | null;
  };
  entityLabel: string;
  invalidateQueryKeys: readonly (readonly unknown[])[];
  onAccountUpdated?: (updates: { isActive?: boolean; mustChangePassword?: boolean }) => void;
  contactPhone?: string | null;
  identifier?: string;
}

export default function AccountActionPanel({
  account,
  entityLabel,
  invalidateQueryKeys,
  onAccountUpdated,
  contactPhone,
  identifier,
}: AccountActionPanelProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManageAccount = user?.role === 'school_admin';
  const isCurrentUser = user?._id === account._id;
  const [state, setState] = useState({
    isActive: account.isActive,
    mustChangePassword: account.mustChangePassword,
    lastLogin: account.lastLogin ?? null,
  });
  const [busyAction, setBusyAction] = useState<'reset' | 'activate' | 'deactivate' | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setState({
      isActive: account.isActive,
      mustChangePassword: account.mustChangePassword,
      lastLogin: account.lastLogin ?? null,
    });
    setBusyAction(null);
    setTempPassword(null);
    setActionError(null);
    setActionSuccess(null);
  }, [account._id, account.isActive, account.mustChangePassword, account.lastLogin]);

  const syncAccountState = (updates: { isActive?: boolean; mustChangePassword?: boolean }) => {
    setState((current) => ({ ...current, ...updates }));
    onAccountUpdated?.(updates);
  };

  const invalidateRelatedQueries = () => {
    invalidateQueryKeys.forEach((queryKey) => {
      void queryClient.invalidateQueries({ queryKey });
    });
  };

  const clearMessages = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: () => authApi.resetPassword(account._id, customPassword || undefined).then(getEntityPayload<{ tempPassword?: string | null }>),
    onMutate: () => {
      clearMessages();
      setTempPassword(null);
      setBusyAction('reset');
    },
    onSuccess: (response) => {
      syncAccountState({ mustChangePassword: true });
      setTempPassword(response.tempPassword ?? '—');
      setActionSuccess(`تم إنشاء كلمة مرور مؤقتة جديدة لـ${entityLabel} ${account.name}.`);
      invalidateRelatedQueries();
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, `تعذر إعادة تعيين كلمة مرور ${entityLabel}.`));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => usersApi.activate(account._id),
    onMutate: () => {
      clearMessages();
      setBusyAction('activate');
    },
    onSuccess: () => {
      syncAccountState({ isActive: true });
      setActionSuccess(`تم تفعيل حساب ${entityLabel} ${account.name}.`);
      invalidateRelatedQueries();
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, `تعذر تفعيل حساب ${entityLabel}.`));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => usersApi.deactivate(account._id),
    onMutate: () => {
      clearMessages();
      setBusyAction('deactivate');
    },
    onSuccess: () => {
      syncAccountState({ isActive: false });
      setActionSuccess(`تم تعطيل حساب ${entityLabel} ${account.name}.`);
      invalidateRelatedQueries();
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, `تعذر تعطيل حساب ${entityLabel}.`));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  if (!canManageAccount) {
    return null;
  }

  return (
    <section className="rounded-xl border border-stroke bg-glaze/[0.03] p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">إدارة الحساب</h4>
          <p className="mt-1 text-xs text-ink-faint">إجراءات مباشرة على حساب {entityLabel} بدون مغادرة شاشة التفاصيل.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge isActive={state.isActive} />
          {typeof state.mustChangePassword === 'boolean' && (
            <Badge variant={state.mustChangePassword ? 'warning' : 'success'}>
              {state.mustChangePassword ? 'ينتظر تغيير كلمة المرور' : 'كلمة المرور مستقرة'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-glaze/[0.03] p-3">
          <p className="text-xs text-ink-faint">آخر تسجيل دخول</p>
          <p className="mt-1 font-medium text-ink">{state.lastLogin ? formatDateTime(state.lastLogin) : 'لم يسجل الدخول بعد'}</p>
        </div>
        <div className="rounded-lg bg-glaze/[0.03] p-3">
          <p className="text-xs text-ink-faint">حالة الإدارة</p>
          <p className="mt-1 font-medium text-ink">{state.isActive ? 'الحساب متاح لتسجيل الدخول' : 'الحساب معطل حاليًا'}</p>
        </div>
      </div>

      {tempPassword && (
        <AlertBanner variant="warning">
          كلمة المرور المؤقتة الجديدة:{' '}
          <span className="font-semibold" dir="ltr">{tempPassword}</span>
        </AlertBanner>
      )}

      {actionSuccess && <AlertBanner variant="success">{actionSuccess}</AlertBanner>}
      {actionError && <AlertBanner variant="error">{actionError}</AlertBanner>}

      {isCurrentUser && (
        <AlertBanner variant="warning">
          لا يمكن تعطيل الحساب المستخدم حاليًا من داخل هذه الشاشة.
        </AlertBanner>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:max-w-sm">
          <Input label="كلمة مؤقتة مخصصة (اختياري)" value={customPassword} onChange={(event) => setCustomPassword(event.target.value)} placeholder="اتركها فارغة للتوليد التلقائي" dir="ltr" />
          <p className="mt-1 text-xs text-ink-faint">8 أحرف على الأقل، وحرف كبير وصغير ورقم.</p>
        </div>
        <div className="w-full" />
        <Button
          size="sm"
          variant="outline"
          loading={busyAction === 'reset' && resetPasswordMutation.isPending}
          disabled={Boolean(customPassword) && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(customPassword)}
          onClick={() => resetPasswordMutation.mutate()}
        >
          <KeyRound className="h-3.5 w-3.5" />
          إعادة تعيين كلمة المرور
        </Button>

        {tempPassword && contactPhone && (
          <Button size="sm" variant="secondary" onClick={() => {
            const url = buildWhatsAppUrl({ phone: contactPhone, message: buildPasswordResetWhatsAppMessage({ name: account.name, identifier: identifier || account.name, tempPassword }) });
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
          }}>
            <MessageCircle className="h-3.5 w-3.5" /> إرسال الكلمة المؤقتة عبر واتساب
          </Button>
        )}

        {state.isActive ? (
          <Button
            size="sm"
            variant="danger"
            disabled={isCurrentUser}
            loading={busyAction === 'deactivate' && deactivateMutation.isPending}
            onClick={() => deactivateMutation.mutate()}
            title={isCurrentUser ? 'تعطيل الحساب الحالي محظور' : undefined}
          >
            <UserX className="h-3.5 w-3.5" />
            تعطيل الحساب
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            loading={busyAction === 'activate' && activateMutation.isPending}
            onClick={() => activateMutation.mutate()}
          >
            <UserCheck className="h-3.5 w-3.5" />
            تفعيل الحساب
          </Button>
        )}
      </div>
    </section>
  );
}
