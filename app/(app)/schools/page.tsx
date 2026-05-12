'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, PencilLine, Phone, Plus } from 'lucide-react';
import { schoolsApi } from '@/lib/api';
import { getCurrentHijriAcademicYear } from '@/lib/academic-year';
import { getApiErrorMessage, getEntityPayload } from '@/lib/api-contracts';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import type { School, SchoolAdministrationContact, SchoolAdministrativeOfficeContact } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SearchField from '@/components/ui/SearchField';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import AlertBanner from '@/components/ui/AlertBanner';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';

const emailSchema = z.string().email();

const requiredNameField = z.string().trim().min(2, 'Min 2 characters').max(100, 'Max 100 characters');
const requiredAddressField = z.string().trim().min(5, 'Min 5 characters').max(200, 'Max 200 characters');
const requiredPhoneField = z.string().trim().min(7, 'Min 7 digits').max(20, 'Max 20 digits');
const optionalNameField = z.string().trim().max(100, 'Max 100 characters').refine(
  (value) => value === '' || value.length >= 2,
  'Min 2 characters',
);
const optionalPhoneField = z.string().trim().max(20, 'Max 20 digits').refine(
  (value) => value === '' || value.length >= 7,
  'Min 7 digits',
);
const optionalEmailField = z.string().trim().refine(
  (value) => value === '' || emailSchema.safeParse(value).success,
  'Invalid email',
);
const academicYearField = z.string().trim().regex(/^\d{4}-\d{4}$/, 'Use 1446-1447');

const operationalSchema = {
  principalName: optionalNameField,
  principalPhone: optionalPhoneField,
  principalEmail: optionalEmailField,
  deputyPrincipalName: optionalNameField,
  deputyPrincipalPhone: optionalPhoneField,
  deputyPrincipalEmail: optionalEmailField,
  counselorName: optionalNameField,
  counselorPhone: optionalPhoneField,
  counselorEmail: optionalEmailField,
  administrativePhone: optionalPhoneField,
  administrativeEmail: optionalEmailField,
};

const createSchema = z.object({
  name: requiredNameField,
  nameAr: optionalNameField,
  address: requiredAddressField,
  phone: requiredPhoneField,
  email: optionalEmailField,
  academicYear: academicYearField,
  adminFirstName: z.string().trim().min(1, 'Required').max(50, 'Max 50 characters'),
  adminLastName: z.string().trim().min(1, 'Required').max(50, 'Max 50 characters'),
  adminNationalId: z.string().trim().min(5, 'Min 5 chars').max(20, 'Max 20 chars'),
  adminPhone: requiredPhoneField,
  ...operationalSchema,
});

const editSchema = z.object({
  name: requiredNameField,
  nameAr: optionalNameField,
  address: requiredAddressField,
  phone: requiredPhoneField,
  email: optionalEmailField,
  academicYear: academicYearField,
  ...operationalSchema,
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

const getDefaultAcademicYear = () => getCurrentHijriAcademicYear();

const emptyOperationalValues = {
  principalName: '',
  principalPhone: '',
  principalEmail: '',
  deputyPrincipalName: '',
  deputyPrincipalPhone: '',
  deputyPrincipalEmail: '',
  counselorName: '',
  counselorPhone: '',
  counselorEmail: '',
  administrativePhone: '',
  administrativeEmail: '',
};

const createDefaultValues: CreateForm = {
  name: '',
  nameAr: '',
  address: '',
  phone: '',
  email: '',
  academicYear: getDefaultAcademicYear(),
  adminFirstName: '',
  adminLastName: '',
  adminNationalId: '',
  adminPhone: '',
  ...emptyOperationalValues,
};

const editDefaultValues: EditForm = {
  name: '',
  nameAr: '',
  address: '',
  phone: '',
  email: '',
  academicYear: getDefaultAcademicYear(),
  ...emptyOperationalValues,
};

const normalizeOptionalText = (value?: string | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const buildLeaderPayload = (
  name?: string | null,
  phone?: string | null,
  email?: string | null,
  includeBlankFields = false,
) => {
  const normalizedName = normalizeOptionalText(name);
  const normalizedPhone = normalizeOptionalText(phone);
  const normalizedEmail = normalizeOptionalText(email);

  if (!includeBlankFields && !normalizedName && !normalizedPhone && !normalizedEmail) {
    return undefined;
  }

  return {
    name: normalizedName ?? null,
    phone: normalizedPhone ?? null,
    email: normalizedEmail ?? null,
  };
};

const buildAdministrativeContactPayload = (
  phone?: string | null,
  email?: string | null,
  includeBlankFields = false,
) => {
  const normalizedPhone = normalizeOptionalText(phone);
  const normalizedEmail = normalizeOptionalText(email);

  if (!includeBlankFields && !normalizedPhone && !normalizedEmail) {
    return undefined;
  }

  return {
    phone: normalizedPhone ?? null,
    email: normalizedEmail ?? null,
  };
};

const buildAdministrationPayload = (values: EditForm | CreateForm, includeBlankFields = false) => {
  const payload: Record<string, unknown> = {};

  const principal = buildLeaderPayload(
    values.principalName,
    values.principalPhone,
    values.principalEmail,
    includeBlankFields,
  );
  const deputyPrincipal = buildLeaderPayload(
    values.deputyPrincipalName,
    values.deputyPrincipalPhone,
    values.deputyPrincipalEmail,
    includeBlankFields,
  );
  const counselor = buildLeaderPayload(
    values.counselorName,
    values.counselorPhone,
    values.counselorEmail,
    includeBlankFields,
  );
  const administrativeContact = buildAdministrativeContactPayload(
    values.administrativePhone,
    values.administrativeEmail,
    includeBlankFields,
  );

  if (principal !== undefined) payload.principal = principal;
  if (deputyPrincipal !== undefined) payload.deputyPrincipal = deputyPrincipal;
  if (counselor !== undefined) payload.counselor = counselor;
  if (administrativeContact !== undefined) payload.administrativeContact = administrativeContact;

  return Object.keys(payload).length ? payload : undefined;
};

const buildBaseSchoolPayload = (values: EditForm | CreateForm) => ({
  name: values.name.trim(),
  nameAr: values.name.trim() ? values.nameAr.trim() || null : null,
  address: values.address.trim(),
  phone: values.phone.trim(),
  email: values.email.trim() || null,
  academicYear: values.academicYear.trim(),
});

const buildCreateSchoolPayload = (values: CreateForm) => ({
  ...buildBaseSchoolPayload(values),
  administration: buildAdministrationPayload(values),
});

const buildUpdateSchoolPayload = (values: EditForm) => ({
  ...buildBaseSchoolPayload(values),
  administration: buildAdministrationPayload(values, true),
});

const mapSchoolToEditValues = (school: School): EditForm => ({
  name: school.name ?? '',
  nameAr: school.nameAr ?? '',
  address: school.address ?? '',
  phone: school.phone ?? '',
  email: school.email ?? '',
  academicYear: school.academicYear ?? getDefaultAcademicYear(),
  principalName: school.administration?.principal?.name ?? '',
  principalPhone: school.administration?.principal?.phone ?? '',
  principalEmail: school.administration?.principal?.email ?? '',
  deputyPrincipalName: school.administration?.deputyPrincipal?.name ?? '',
  deputyPrincipalPhone: school.administration?.deputyPrincipal?.phone ?? '',
  deputyPrincipalEmail: school.administration?.deputyPrincipal?.email ?? '',
  counselorName: school.administration?.counselor?.name ?? '',
  counselorPhone: school.administration?.counselor?.phone ?? '',
  counselorEmail: school.administration?.counselor?.email ?? '',
  administrativePhone: school.administration?.administrativeContact?.phone ?? '',
  administrativeEmail: school.administration?.administrativeContact?.email ?? '',
});

function OperationalContactCard({
  title,
  contact,
  fallback,
}: {
  title: string;
  contact?: SchoolAdministrationContact | SchoolAdministrativeOfficeContact | null;
  fallback: string;
}) {
  const hasName = 'name' in (contact ?? {});
  const name = hasName ? (contact as SchoolAdministrationContact | null | undefined)?.name : null;
  const phone = contact?.phone;
  const email = contact?.email;
  const hasData = Boolean(name || phone || email);

  return (
    <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4 text-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">{title}</p>
      {hasData ? (
        <div className="mt-3 space-y-2 text-ink-muted">
          {name && <p className="font-medium text-ink">{name}</p>}
          {phone && (
            <p className="inline-flex items-center gap-2" dir="ltr">
              <Phone className="h-3.5 w-3.5 text-gold-500" />
              {phone}
            </p>
          )}
          {email && (
            <p className="inline-flex items-center gap-2 break-all" dir="ltr">
              <Mail className="h-3.5 w-3.5 text-gold-500" />
              {email}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">{fallback}</p>
      )}
    </div>
  );
}

export default function SchoolsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const canManageSchools = hasAnyRole(user?.role, roleGroups.superAdmins);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<School | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['schools', page, search],
    queryFn: () => schoolsApi.list({ page, limit: 15, search }).then((response) => response.data),
    staleTime: 30_000,
  });

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: createDefaultValues,
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: editDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateForm) =>
      schoolsApi.create({
        ...buildCreateSchoolPayload(values),
        admin: {
          name: { first: values.adminFirstName.trim(), last: values.adminLastName.trim() },
          nationalId: values.adminNationalId.trim(),
          phone: values.adminPhone.trim(),
        },
      }).then(getEntityPayload<{ school: School; tempPassword?: string | null }>),
    onMutate: () => {
      setCreateError(null);
      setPageSuccess(null);
    },
    onSuccess: (payload) => {
      setCreatedTempPassword(payload.tempPassword ?? null);
      setPageSuccess(`تم إنشاء مدرسة ${payload.school.name} وإضافة الهيكل الإداري التشغيلي لها بنجاح.`);
      void qc.invalidateQueries({ queryKey: ['schools'] });
      setShowCreate(false);
      resetCreate(createDefaultValues);
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, 'تعذر إنشاء المدرسة.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditForm) => {
      if (!selected) {
        throw new Error('No school selected');
      }

      return schoolsApi.update(selected._id, buildUpdateSchoolPayload(values)).then(getEntityPayload<School>);
    },
    onMutate: () => {
      setUpdateError(null);
      setCreatedTempPassword(null);
      setPageSuccess(null);
    },
    onSuccess: (school) => {
      setSelected(school);
      setShowEdit(false);
      setPageSuccess(`تم تحديث البيانات الأساسية والتشغيلية لمدرسة ${school.name}.`);
      void qc.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      setUpdateError(getApiErrorMessage(error, 'تعذر تحديث بيانات المدرسة.'));
    },
  });

  const columns: Column<School>[] = [
    {
      key: 'name',
      header: 'المدرسة',
      render: (school) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{school.name}</p>
            {school.nameAr && <p className="text-xs text-gray-500">{school.nameAr}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'administration',
      header: 'الإدارة التشغيلية',
      className: 'min-w-[180px]',
      render: (school) => (
        <div className="space-y-1 text-xs text-ink-muted">
          <p>
            المدير:{' '}
            <span className="font-medium text-ink">{school.administration?.principal?.name || 'غير مضاف'}</span>
          </p>
          <p>
            الوكيل:{' '}
            <span className="font-medium text-ink">{school.administration?.deputyPrincipal?.name || 'غير مضاف'}</span>
          </p>
          <p>
            المرشد:{' '}
            <span className="font-medium text-ink">{school.administration?.counselor?.name || 'غير مضاف'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'التواصل الإداري',
      className: 'min-w-[170px]',
      render: (school) => {
        const adminPhone = school.administration?.administrativeContact?.phone;
        const adminEmail = school.administration?.administrativeContact?.email;

        if (!adminPhone && !adminEmail) {
          return <span className="text-xs text-gray-400">غير مضاف</span>;
        }

        return (
          <div className="space-y-1 text-xs text-ink-muted">
            {adminPhone && <p dir="ltr">{adminPhone}</p>}
            {adminEmail && <p className="break-all" dir="ltr">{adminEmail}</p>}
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'الهاتف الرئيسي',
      render: (school) => <span className="text-sm text-gray-700">{school.phone}</span>,
    },
    {
      key: 'academicYear',
      header: 'العام الدراسي',
      render: (school) => <span className="text-sm text-gray-700">{school.academicYear}</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (school) => (
        <Badge variant={school.isActive ? 'success' : 'danger'}>
          {school.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
  ];

  const openEditModal = () => {
    if (!selected) return;

    setUpdateError(null);
    resetEdit(mapSchoolToEditValues(selected));
    setShowEdit(true);
  };

  if (!canManageSchools) {
    return (
      <RestrictedAccessState
        icon={Building2}
        description="إدارة المدارس متاحة للمشرفين العامين فقط."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدارس"
        description="إدارة المدارس مع المناصب التشغيلية وبيانات التواصل الإدارية من شاشة واحدة."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 me-1" /> إضافة مدرسة
          </Button>
        }
      />

      {pageSuccess && <AlertBanner variant="success">{pageSuccess}</AlertBanner>}

      {createdTempPassword && (
        <AlertBanner variant="warning">
          تم إنشاء المدرسة. كلمة المرور المؤقتة لمدير المدرسة:
          {' '}
          <span className="font-semibold" dir="ltr">{createdTempPassword}</span>
        </AlertBanner>
      )}

      <SearchField
        containerClassName="max-w-sm"
        placeholder="البحث عن مدرسة…"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      <Table<School>
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        onRowClick={setSelected}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pages={data.meta.pages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateError(null);
          resetCreate(createDefaultValues);
        }}
        title="إضافة مدرسة جديدة"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreate(false);
                setCreateError(null);
                resetCreate(createDefaultValues);
              }}
            >
              إلغاء
            </Button>
            <Button loading={createMutation.isPending} onClick={handleCreateSubmit((values) => createMutation.mutate(values))}>
              إضافة مدرسة
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <h4 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">
              بيانات المدرسة
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="اسم المدرسة" {...registerCreate('name')} error={createErrors.name?.message} />
              <Input label="الاسم الإضافي أو المختصر" {...registerCreate('nameAr')} error={createErrors.nameAr?.message} />
              <Input label="العام الدراسي" placeholder="مثال: 1446-1447" {...registerCreate('academicYear')} error={createErrors.academicYear?.message} />
              <Input label="العنوان" {...registerCreate('address')} error={createErrors.address?.message} className="sm:col-span-2" />
              <Input label="الهاتف الرئيسي" {...registerCreate('phone')} error={createErrors.phone?.message} />
              <Input label="البريد الإلكتروني الرئيسي" type="email" {...registerCreate('email')} error={createErrors.email?.message} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">
              القيادة والتواصل الإداري
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="اسم المدير" {...registerCreate('principalName')} error={createErrors.principalName?.message} />
              <Input label="جوال المدير" {...registerCreate('principalPhone')} error={createErrors.principalPhone?.message} />
              <Input label="بريد المدير" type="email" {...registerCreate('principalEmail')} error={createErrors.principalEmail?.message} />

              <Input label="اسم الوكيل" {...registerCreate('deputyPrincipalName')} error={createErrors.deputyPrincipalName?.message} />
              <Input label="جوال الوكيل" {...registerCreate('deputyPrincipalPhone')} error={createErrors.deputyPrincipalPhone?.message} />
              <Input label="بريد الوكيل" type="email" {...registerCreate('deputyPrincipalEmail')} error={createErrors.deputyPrincipalEmail?.message} />

              <Input label="اسم المرشد" {...registerCreate('counselorName')} error={createErrors.counselorName?.message} />
              <Input label="جوال المرشد" {...registerCreate('counselorPhone')} error={createErrors.counselorPhone?.message} />
              <Input label="بريد المرشد" type="email" {...registerCreate('counselorEmail')} error={createErrors.counselorEmail?.message} />

              <Input label="هاتف التواصل الإداري" {...registerCreate('administrativePhone')} error={createErrors.administrativePhone?.message} />
              <Input label="بريد التواصل الإداري" type="email" {...registerCreate('administrativeEmail')} error={createErrors.administrativeEmail?.message} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">
              حساب مدير المدرسة
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="الاسم الأول" {...registerCreate('adminFirstName')} error={createErrors.adminFirstName?.message} />
              <Input label="اسم العائلة" {...registerCreate('adminLastName')} error={createErrors.adminLastName?.message} />
              <Input label="رقم الهوية" {...registerCreate('adminNationalId')} error={createErrors.adminNationalId?.message} />
              <Input label="رقم جوال الحساب" {...registerCreate('adminPhone')} error={createErrors.adminPhone?.message} />
            </div>
          </div>

          {createError && <AlertBanner variant="error">{createError}</AlertBanner>}
        </div>
      </Modal>

      <Modal
        open={Boolean(selected) && !showEdit}
        onClose={() => setSelected(null)}
        title="بيانات المدرسة"
        size="xl"
        footer={
          selected ? (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>إغلاق</Button>
              <Button onClick={openEditModal}>
                <PencilLine className="h-4 w-4 me-1" /> تحرير البيانات
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
                <Building2 className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
                {selected.nameAr && <p className="text-sm text-gray-500">{selected.nameAr}</p>}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={selected.isActive ? 'success' : 'danger'}>
                    {selected.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="col-span-2">
                <span className="text-gray-500">العنوان: </span>
                <span className="font-medium">{selected.address}</span>
              </div>
              <div>
                <span className="text-gray-500">الهاتف الرئيسي: </span>
                <span className="font-medium">{selected.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">البريد الرئيسي: </span>
                <span className="font-medium">{selected.email || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">العام الدراسي: </span>
                <span className="font-medium">{selected.academicYear}</span>
              </div>
              <div>
                <span className="text-gray-500">تاريخ الإنشاء: </span>
                <span className="font-medium">{formatDate(selected.createdAt)}</span>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-ink">الإدارة التشغيلية</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <OperationalContactCard
                  title="المدير"
                  contact={selected.administration?.principal}
                  fallback="لم يتم تحديد المدير بعد."
                />
                <OperationalContactCard
                  title="الوكيل"
                  contact={selected.administration?.deputyPrincipal}
                  fallback="لم يتم تحديد الوكيل بعد."
                />
                <OperationalContactCard
                  title="المرشد"
                  contact={selected.administration?.counselor}
                  fallback="لم يتم تحديد المرشد بعد."
                />
                <OperationalContactCard
                  title="التواصل الإداري"
                  contact={selected.administration?.administrativeContact}
                  fallback="لا توجد بيانات تواصل إدارية مضافة بعد."
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setUpdateError(null);
        }}
        title="تحرير بيانات المدرسة"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowEdit(false); setUpdateError(null); }}>
              إلغاء
            </Button>
            <Button loading={updateMutation.isPending} onClick={handleEditSubmit((values) => updateMutation.mutate(values))}>
              حفظ التغييرات
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <h4 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">
              بيانات المدرسة الأساسية
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="اسم المدرسة" {...registerEdit('name')} error={editErrors.name?.message} />
              <Input label="الاسم الإضافي أو المختصر" {...registerEdit('nameAr')} error={editErrors.nameAr?.message} />
              <Input label="العام الدراسي" placeholder="مثال: 1446-1447" {...registerEdit('academicYear')} error={editErrors.academicYear?.message} />
              <Input label="العنوان" {...registerEdit('address')} error={editErrors.address?.message} className="sm:col-span-2" />
              <Input label="الهاتف الرئيسي" {...registerEdit('phone')} error={editErrors.phone?.message} />
              <Input label="البريد الإلكتروني الرئيسي" type="email" {...registerEdit('email')} error={editErrors.email?.message} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">
              القيادة والتواصل الإداري
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="اسم المدير" {...registerEdit('principalName')} error={editErrors.principalName?.message} />
              <Input label="جوال المدير" {...registerEdit('principalPhone')} error={editErrors.principalPhone?.message} />
              <Input label="بريد المدير" type="email" {...registerEdit('principalEmail')} error={editErrors.principalEmail?.message} />

              <Input label="اسم الوكيل" {...registerEdit('deputyPrincipalName')} error={editErrors.deputyPrincipalName?.message} />
              <Input label="جوال الوكيل" {...registerEdit('deputyPrincipalPhone')} error={editErrors.deputyPrincipalPhone?.message} />
              <Input label="بريد الوكيل" type="email" {...registerEdit('deputyPrincipalEmail')} error={editErrors.deputyPrincipalEmail?.message} />

              <Input label="اسم المرشد" {...registerEdit('counselorName')} error={editErrors.counselorName?.message} />
              <Input label="جوال المرشد" {...registerEdit('counselorPhone')} error={editErrors.counselorPhone?.message} />
              <Input label="بريد المرشد" type="email" {...registerEdit('counselorEmail')} error={editErrors.counselorEmail?.message} />

              <Input label="هاتف التواصل الإداري" {...registerEdit('administrativePhone')} error={editErrors.administrativePhone?.message} />
              <Input label="بريد التواصل الإداري" type="email" {...registerEdit('administrativeEmail')} error={editErrors.administrativeEmail?.message} />
            </div>
          </div>

          {updateError && <AlertBanner variant="error">{updateError}</AlertBanner>}
        </div>
      </Modal>
    </div>
  );
}
