'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, UserCheck, Users, UserX } from 'lucide-react';
import { authApi, usersApi } from '@/lib/api';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { formatDateTime, fullName } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import PageHeader from '@/components/ui/PageHeader';
import SearchField from '@/components/ui/SearchField';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import AlertBanner from '@/components/ui/AlertBanner';
import EmptyState from '@/components/ui/EmptyState';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';

type AdminAccount = {
  _id: string;
  schoolId: string | null;
  role: Role;
  name: { first: string; last: string };
  nationalId: string;
  phone: string;
  email?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string | null;
};

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'super_admin', label: 'مشرف عام' },
  { value: 'school_admin', label: 'مدير مدرسة' },
  { value: 'teacher', label: 'معلم' },
  { value: 'parent', label: 'ولي أمر' },
  { value: 'student', label: 'طالب' },
];

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'مشرف عام',
  school_admin: 'مدير مدرسة',
  teacher: 'معلم',
  parent: 'ولي أمر',
  student: 'طالب',
};

const ROLE_BADGE_VARIANTS: Record<Role, 'default' | 'info' | 'success' | 'warning' | 'purple'> = {
  super_admin: 'purple',
  school_admin: 'info',
  teacher: 'success',
  parent: 'warning',
  student: 'default',
};

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManageAccounts = user?.role === 'school_admin';
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; tempPassword: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const accountsQuery = usePaginatedListQuery<AdminAccount>({
    queryKey: ['accounts', page, search, roleFilter, statusFilter],
    queryFn: () => usersApi.list({
      page,
      limit: 15,
      search: search || undefined,
      role: roleFilter || undefined,
      isActive: statusFilter || undefined,
    }),
    enabled: canManageAccounts,
    staleTime: 30_000,
  });

  const activateMutation = useMutation({
    mutationFn: (account: AdminAccount) => usersApi.activate(account._id),
    onSuccess: (_, account) => {
      setActionSuccess(`تم تفعيل حساب ${fullName(account.name)}.`);
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'تعذر تفعيل الحساب.'));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (account: AdminAccount) => usersApi.deactivate(account._id),
    onSuccess: (_, account) => {
      setActionSuccess(`تم تعطيل حساب ${fullName(account.name)}.`);
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'تعذر تعطيل الحساب.'));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (account: AdminAccount) => authApi
      .resetPassword(account._id)
      .then(getEntityPayload<{ tempPassword?: string | null }>),
    onSuccess: (response, account) => {
      setActionSuccess(`تم إنشاء كلمة مرور مؤقتة جديدة لحساب ${fullName(account.name)}.`);
      setResetResult({
        name: fullName(account.name),
        tempPassword: response.tempPassword ?? '—',
      });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'تعذر إعادة تعيين كلمة المرور.'));
    },
    onSettled: () => {
      setBusyAction(null);
    },
  });

  const accounts = accountsQuery.data?.items ?? [];
  const totalAccounts = accountsQuery.data?.meta?.total ?? 0;
  const activeVisibleCount = accounts.filter((account) => account.isActive).length;
  const passwordResetVisibleCount = accounts.filter((account) => account.mustChangePassword).length;
  const hasFilters = Boolean(search || roleFilter || statusFilter);

  const runSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const beginAction = (actionKey: string) => {
    setBusyAction(actionKey);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleActivate = (account: AdminAccount) => {
    setResetResult(null);
    beginAction(`activate:${account._id}`);
    activateMutation.mutate(account);
  };

  const handleDeactivate = (account: AdminAccount) => {
    setResetResult(null);
    beginAction(`deactivate:${account._id}`);
    deactivateMutation.mutate(account);
  };

  const handleResetPassword = (account: AdminAccount) => {
    beginAction(`reset:${account._id}`);
    resetPasswordMutation.mutate(account);
  };

  const columns: Column<AdminAccount>[] = [
    {
      key: 'name',
      header: 'الحساب',
      render: (account) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{fullName(account.name)}</p>
            {account._id === user?._id && <Badge variant="warning">حسابك الحالي</Badge>}
          </div>
          <p className="text-xs text-ink-faint" dir="ltr">{account.nationalId}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'الدور',
      render: (account) => (
        <Badge variant={ROLE_BADGE_VARIANTS[account.role]}>{ROLE_LABELS[account.role]}</Badge>
      ),
    },
    {
      key: 'contact',
      header: 'التواصل',
      render: (account) => (
        <div className="space-y-1 text-sm text-ink-muted">
          <p dir="ltr">{account.phone}</p>
          <p className="text-xs text-ink-faint">{account.email || 'لا يوجد بريد إلكتروني'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (account) => (
        <div className="space-y-1">
          <StatusBadge isActive={account.isActive} />
          <div>
            <Badge variant={account.mustChangePassword ? 'warning' : 'success'}>
              {account.mustChangePassword ? 'ينتظر تغيير كلمة المرور' : 'كلمة المرور مستقرة'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'آخر دخول',
      render: (account) => (
        <span className="text-sm text-ink-muted">
          {account.lastLogin ? formatDateTime(account.lastLogin) : 'لم يسجل الدخول بعد'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (account) => {
        const isCurrentUser = account._id === user?._id;

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              loading={busyAction === `reset:${account._id}` && resetPasswordMutation.isPending}
              onClick={() => handleResetPassword(account)}
            >
              <KeyRound className="h-3.5 w-3.5" />
              إعادة التعيين
            </Button>

            {account.isActive ? (
              <Button
                size="sm"
                variant="danger"
                disabled={isCurrentUser}
                loading={busyAction === `deactivate:${account._id}` && deactivateMutation.isPending}
                onClick={() => handleDeactivate(account)}
                title={isCurrentUser ? 'لا يمكنك تعطيل حسابك الحالي' : undefined}
              >
                <UserX className="h-3.5 w-3.5" />
                تعطيل
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                loading={busyAction === `activate:${account._id}` && activateMutation.isPending}
                onClick={() => handleActivate(account)}
              >
                <UserCheck className="h-3.5 w-3.5" />
                تفعيل
              </Button>
            )}
          </div>
        );
      },
      className: 'min-w-[220px]',
    },
  ];

  if (!canManageAccounts) {
    return (
      <RestrictedAccessState description="هذه الصفحة مخصصة لإدارة الحسابات من قبل مدير المدرسة فقط." />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحسابات"
        description="إدارة تفعيل الحسابات، مراجعة حالة الدخول، وإعادة تعيين كلمات المرور المؤقتة من مكان واحد."
        action={hasFilters ? <Button variant="secondary" onClick={resetFilters}>إعادة ضبط الفلاتر</Button> : undefined}
      />

      {resetResult && (
        <AlertBanner variant="warning">
          كلمة المرور المؤقتة الجديدة لحساب {resetResult.name}:{' '}
          <span className="font-semibold" dir="ltr">{resetResult.tempPassword}</span>
        </AlertBanner>
      )}

      {actionSuccess && (
        <AlertBanner variant="success">
          {actionSuccess}
        </AlertBanner>
      )}

      {actionError && (
        <AlertBanner variant="error">
          {actionError}
        </AlertBanner>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_220px_220px_auto_auto]">
        <SearchField
          placeholder="ابحث بالاسم أو الهوية أو الجوال…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && runSearch()}
        />

        <SelectField
          value={roleFilter}
          onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}
        >
          <option value="">كل الأدوار</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </SelectField>

        <SelectField
          value={statusFilter}
          onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
        >
          <option value="">كل الحالات</option>
          <option value="true">نشط فقط</option>
          <option value="false">معطل فقط</option>
        </SelectField>

        <Button variant="secondary" onClick={runSearch}>بحث</Button>
        <Button variant="ghost" onClick={resetFilters}>مسح</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="إجمالي الحسابات" value={totalAccounts} icon={Users} />
        <StatCard title="الحسابات النشطة في الصفحة" value={activeVisibleCount} icon={UserCheck} iconColor="text-emerald-400" />
        <StatCard title="بانتظار تغيير كلمة المرور" value={passwordResetVisibleCount} icon={KeyRound} iconColor="text-amber-400" />
      </div>

      {accounts.length === 0 && !accountsQuery.isLoading ? (
        <EmptyState
          title="لا توجد حسابات مطابقة"
          description={hasFilters ? 'جرّب تعديل البحث أو الفلاتر الحالية.' : 'لا توجد حسابات داخل هذا النطاق حتى الآن.'}
          action={hasFilters ? <Button variant="secondary" onClick={resetFilters}>إزالة الفلاتر</Button> : undefined}
        />
      ) : (
        <>
          <Table<AdminAccount>
            columns={columns}
            data={accounts}
            loading={accountsQuery.isLoading}
            emptyMessage="لا توجد حسابات ضمن الفلاتر الحالية"
          />

          {accountsQuery.data?.meta && (
            <Pagination
              page={accountsQuery.data.meta.page}
              pages={accountsQuery.data.meta.pages}
              total={accountsQuery.data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}