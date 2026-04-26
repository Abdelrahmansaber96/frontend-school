'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Palette, Globe, CheckCircle2, Building2, Mail, Phone, UsersRound } from 'lucide-react';
import { schoolsApi } from '@/lib/api';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import type { School, SchoolAdministrationContact, SchoolAdministrativeOfficeContact } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandingStore } from '@/store/branding.store';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AlertBanner from '@/components/ui/AlertBanner';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import SchoolLogo from '@/components/ui/SchoolLogo';
import { PageSpinner } from '@/components/ui/Spinner';

const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional().or(z.literal('')),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional().or(z.literal('')),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional().or(z.literal('')),
  logoUrl: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  faviconUrl: z.string().url('رابط غير صالح').optional().or(z.literal('')),
});
type BrandingFormValues = z.infer<typeof brandingSchema>;

const emailSchema = z.string().email();
const optionalNameField = z.string().trim().max(100, 'الحد الأقصى 100 حرف').refine(
  (value) => value === '' || value.length >= 2,
  'الحد الأدنى حرفان',
);
const optionalPhoneField = z.string().trim().max(20, 'الحد الأقصى 20 رقمًا').refine(
  (value) => value === '' || value.length >= 7,
  'الحد الأدنى 7 أرقام',
);
const optionalEmailField = z.string().trim().refine(
  (value) => value === '' || emailSchema.safeParse(value).success,
  'بريد إلكتروني غير صالح',
);

const profileSchema = z.object({
  address: z.string().trim().min(5, 'الحد الأدنى 5 أحرف').max(200, 'الحد الأقصى 200 حرف'),
  phone: z.string().trim().min(7, 'الحد الأدنى 7 أرقام').max(20, 'الحد الأقصى 20 رقمًا'),
  email: optionalEmailField,
  academicYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'استخدم الصيغة YYYY-YYYY'),
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
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const profileDefaultValues: ProfileFormValues = {
  address: '',
  phone: '',
  email: '',
  academicYear: '',
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

const normalizeOptionalText = (value?: string | null) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const mapSchoolToBrandingValues = (school: School): BrandingFormValues => ({
  primaryColor: school.branding.primaryColor || '',
  secondaryColor: school.branding.secondaryColor || '',
  accentColor: school.branding.accentColor || '',
  logoUrl: school.branding.logoUrl || '',
  faviconUrl: school.branding.faviconUrl || '',
});

const mapSchoolToProfileValues = (school: School): ProfileFormValues => ({
  address: school.address ?? '',
  phone: school.phone ?? '',
  email: school.email ?? '',
  academicYear: school.academicYear ?? '',
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

const buildProfilePayload = (values: ProfileFormValues) => ({
  address: values.address.trim(),
  phone: values.phone.trim(),
  email: normalizeOptionalText(values.email),
  academicYear: values.academicYear.trim(),
  administration: {
    principal: {
      name: normalizeOptionalText(values.principalName),
      phone: normalizeOptionalText(values.principalPhone),
      email: normalizeOptionalText(values.principalEmail),
    },
    deputyPrincipal: {
      name: normalizeOptionalText(values.deputyPrincipalName),
      phone: normalizeOptionalText(values.deputyPrincipalPhone),
      email: normalizeOptionalText(values.deputyPrincipalEmail),
    },
    counselor: {
      name: normalizeOptionalText(values.counselorName),
      phone: normalizeOptionalText(values.counselorPhone),
      email: normalizeOptionalText(values.counselorEmail),
    },
    administrativeContact: {
      phone: normalizeOptionalText(values.administrativePhone),
      email: normalizeOptionalText(values.administrativeEmail),
    },
  },
});

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 rounded-lg border border-stroke shadow-inner"
        style={{ backgroundColor: color || '#666' }}
      />
      <div>
        <p className="text-[12px] text-ink-faint">{label}</p>
        <p className="text-[13px] font-mono text-ink" dir="ltr">{color || '—'}</p>
      </div>
    </div>
  );
}

function OperationalContactCard({
  title,
  contact,
  emptyText,
}: {
  title: string;
  contact?: SchoolAdministrationContact | SchoolAdministrativeOfficeContact | null;
  emptyText: string;
}) {
  const maybeLeader = contact as SchoolAdministrationContact | null | undefined;
  const name = maybeLeader?.name ?? null;
  const phone = contact?.phone ?? null;
  const email = contact?.email ?? null;
  const hasData = Boolean(name || phone || email);

  return (
    <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4 text-sm">
      <p className="text-[12px] font-semibold text-ink">{title}</p>
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
        <p className="mt-3 text-[13px] text-ink-faint">{emptyText}</p>
      )}
    </div>
  );
}

export default function BrandingPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { setBranding } = useSchoolBrandingStore();
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const canManageBranding = hasAnyRole(user?.role, roleGroups.schoolManagers);

  const { data: school, isLoading } = useQuery<School | null>({
    queryKey: ['current-school'],
    queryFn: () => schoolsApi.getCurrent().then((response) => response.data.data),
  });

  const {
    register: registerBranding,
    handleSubmit: handleBrandingSubmit,
    watch,
    reset: resetBranding,
    formState: { errors: brandingErrors, isDirty: isBrandingDirty },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaultValues,
  });

  useEffect(() => {
    if (!school) return;
    resetBranding(mapSchoolToBrandingValues(school));
    resetProfile(mapSchoolToProfileValues(school));
  }, [school, resetBranding, resetProfile]);

  const updateBrandingMutation = useMutation({
    mutationFn: (values: BrandingFormValues) =>
      schoolsApi.updateBranding({
        primaryColor: values.primaryColor || undefined,
        secondaryColor: values.secondaryColor || undefined,
        accentColor: values.accentColor || undefined,
        logoUrl: values.logoUrl || undefined,
        faviconUrl: values.faviconUrl || undefined,
      }),
    onSuccess: (response) => {
      const updated = response.data.data as School;
      queryClient.setQueryData(['current-school'], updated);
      setBranding({
        schoolName: updated.name,
        schoolNameAr: updated.nameAr ?? undefined,
        subdomain: updated.subdomain,
        branding: updated.branding,
        logo: updated.logo,
      });
      resetBranding(mapSchoolToBrandingValues(updated));
      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 3000);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      schoolsApi.updateCurrentProfile(buildProfilePayload(values)).then((response) => response.data.data as School),
    onSuccess: (updated) => {
      queryClient.setQueryData(['current-school'], updated);
      resetProfile(mapSchoolToProfileValues(updated));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const watchedPrimary = watch('primaryColor');
  const watchedSecondary = watch('secondaryColor');
  const watchedAccent = watch('accentColor');
  const schoolLogoSrc = school?.logo || school?.branding?.logoUrl || null;

  if (isLoading) return <PageSpinner />;

  if (!canManageBranding) {
    return (
      <RestrictedAccessState
        icon={Palette}
        description="إعدادات هوية المدرسة متاحة لمدراء المدارس فقط."
      />
    );
  }

  if (!school) {
    return (
      <RestrictedAccessState
        icon={Building2}
        title="لا يوجد سياق مدرسة"
        description="هذه الصفحة تحتاج إلى سياق مدرسة حالية. افتحها من حساب مدير مدرسة أو من نطاق مدرسة فعلي."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="هوية المدرسة"
        description="أدر هوية المدرسة الحالية، علامتها التجارية، وبياناتها التشغيلية من سياق المدرسة نفسه."
      />

      {brandingSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] p-3 text-[13px] text-emerald-600 dark:text-emerald-400/80 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          تم تحديث العلامة التجارية بنجاح
        </div>
      )}

      {profileSuccess && (
        <AlertBanner variant="success">
          تم تحديث البيانات التشغيلية والإدارية للمدرسة الحالية بنجاح.
        </AlertBanner>
      )}

      <div className="glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-5">
        <div className="flex flex-wrap items-center gap-4">
          <SchoolLogo
            alt={school.name}
            src={schoolLogoSrc}
            branding={school.branding}
            size="lg"
            className="border border-stroke"
          />
          <div className="min-w-[220px] flex-1">
            <h3 className="text-[15px] font-semibold text-ink">{school.name}</h3>
            {school.nameAr && <p className="text-[13px] text-ink-dim">{school.nameAr}</p>}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <Globe className="h-3 w-3" />
              <span dir="ltr" className="font-mono">{school.subdomain}.platform.com</span>
            </div>
            <div className="mt-3 grid gap-2 text-[12px] text-ink-muted sm:grid-cols-2">
              <div>الهاتف الرئيسي: <span className="font-medium text-ink" dir="ltr">{school.phone}</span></div>
              <div>البريد الرئيسي: <span className="font-medium text-ink" dir="ltr">{school.email || '—'}</span></div>
              <div className="sm:col-span-2">العنوان: <span className="font-medium text-ink">{school.address}</span></div>
              <div>العام الدراسي: <span className="font-medium text-ink">{school.academicYear}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-5 space-y-5">
        <div className="flex items-center gap-2 border-b border-stroke pb-3">
          <UsersRound className="h-4 w-4 text-gold-500" />
          <h4 className="text-[13px] font-semibold text-ink">البيانات التشغيلية الحالية</h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OperationalContactCard
            title="المدير"
            contact={school.administration?.principal}
            emptyText="لم يتم تحديد المدير بعد."
          />
          <OperationalContactCard
            title="الوكيل"
            contact={school.administration?.deputyPrincipal}
            emptyText="لم يتم تحديد الوكيل بعد."
          />
          <OperationalContactCard
            title="المرشد"
            contact={school.administration?.counselor}
            emptyText="لم يتم تحديد المرشد بعد."
          />
          <OperationalContactCard
            title="التواصل الإداري"
            contact={school.administration?.administrativeContact}
            emptyText="لا توجد جهة تواصل إدارية مضافة بعد."
          />
        </div>
      </div>

      <form onSubmit={handleBrandingSubmit((values) => updateBrandingMutation.mutate(values))} className="space-y-6">
        <div className="glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-stroke pb-3">
            <Palette className="h-4 w-4 text-gold-500" />
            <h4 className="text-[13px] font-semibold text-ink">العلامة التجارية</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Input
                label="اللون الأساسي"
                type="text"
                placeholder="#C8A24D"
                dir="ltr"
                className="font-mono text-left"
                error={brandingErrors.primaryColor?.message}
                {...registerBranding('primaryColor')}
              />
              {watchedPrimary && /^#[0-9A-Fa-f]{6}$/.test(watchedPrimary) && (
                <div className="h-10 rounded-lg border border-stroke" style={{ backgroundColor: watchedPrimary }} />
              )}
            </div>
            <div className="space-y-2">
              <Input
                label="اللون الثانوي"
                type="text"
                placeholder="#0a0e1a"
                dir="ltr"
                className="font-mono text-left"
                error={brandingErrors.secondaryColor?.message}
                {...registerBranding('secondaryColor')}
              />
              {watchedSecondary && /^#[0-9A-Fa-f]{6}$/.test(watchedSecondary) && (
                <div className="h-10 rounded-lg border border-stroke" style={{ backgroundColor: watchedSecondary }} />
              )}
            </div>
            <div className="space-y-2">
              <Input
                label="لون التمييز"
                type="text"
                placeholder="#3B82F6"
                dir="ltr"
                className="font-mono text-left"
                error={brandingErrors.accentColor?.message}
                {...registerBranding('accentColor')}
              />
              {watchedAccent && /^#[0-9A-Fa-f]{6}$/.test(watchedAccent) && (
                <div className="h-10 rounded-lg border border-stroke" style={{ backgroundColor: watchedAccent }} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-4">
            <p className="mb-3 text-[11px] font-medium text-ink-faint">معاينة الألوان</p>
            <div className="flex items-center gap-4">
              <ColorSwatch color={watchedPrimary || school.branding.primaryColor || '#C8A24D'} label="أساسي" />
              <ColorSwatch color={watchedSecondary || school.branding.secondaryColor || '#0a0e1a'} label="ثانوي" />
              {(watchedAccent || school.branding.accentColor) && (
                <ColorSwatch color={watchedAccent || school.branding.accentColor || ''} label="تمييز" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="رابط الشعار"
              type="url"
              placeholder="https://example.com/logo.png"
              dir="ltr"
              className="text-left"
              error={brandingErrors.logoUrl?.message}
              hint="يظهر في الشريط الجانبي وأعلى الصفحات"
              {...registerBranding('logoUrl')}
            />
            <Input
              label="رابط الأيقونة"
              type="url"
              placeholder="https://example.com/favicon.ico"
              dir="ltr"
              className="text-left"
              error={brandingErrors.faviconUrl?.message}
              hint="يظهر في تبويب المتصفح"
              {...registerBranding('faviconUrl')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {isBrandingDirty && (
            <Button type="button" variant="secondary" onClick={() => resetBranding(mapSchoolToBrandingValues(school))}>
              تراجع
            </Button>
          )}
          <Button type="submit" loading={updateBrandingMutation.isPending} disabled={!isBrandingDirty}>
            <CheckCircle2 className="h-4 w-4 me-1" /> حفظ العلامة التجارية
          </Button>
        </div>
      </form>

      <form onSubmit={handleProfileSubmit((values) => updateProfileMutation.mutate(values))} className="space-y-6">
        <div className="glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-stroke pb-3">
            <Building2 className="h-4 w-4 text-gold-500" />
            <h4 className="text-[13px] font-semibold text-ink">البيانات التشغيلية والإدارية</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="العنوان" className="sm:col-span-2" error={profileErrors.address?.message} {...registerProfile('address')} />
            <Input label="الهاتف الرئيسي" error={profileErrors.phone?.message} {...registerProfile('phone')} />
            <Input label="البريد الرئيسي" type="email" error={profileErrors.email?.message} {...registerProfile('email')} />
            <Input label="العام الدراسي" error={profileErrors.academicYear?.message} {...registerProfile('academicYear')} />

            <Input label="اسم المدير" error={profileErrors.principalName?.message} {...registerProfile('principalName')} />
            <Input label="جوال المدير" error={profileErrors.principalPhone?.message} {...registerProfile('principalPhone')} />
            <Input label="بريد المدير" type="email" error={profileErrors.principalEmail?.message} {...registerProfile('principalEmail')} />

            <Input label="اسم الوكيل" error={profileErrors.deputyPrincipalName?.message} {...registerProfile('deputyPrincipalName')} />
            <Input label="جوال الوكيل" error={profileErrors.deputyPrincipalPhone?.message} {...registerProfile('deputyPrincipalPhone')} />
            <Input label="بريد الوكيل" type="email" error={profileErrors.deputyPrincipalEmail?.message} {...registerProfile('deputyPrincipalEmail')} />

            <Input label="اسم المرشد" error={profileErrors.counselorName?.message} {...registerProfile('counselorName')} />
            <Input label="جوال المرشد" error={profileErrors.counselorPhone?.message} {...registerProfile('counselorPhone')} />
            <Input label="بريد المرشد" type="email" error={profileErrors.counselorEmail?.message} {...registerProfile('counselorEmail')} />

            <Input label="هاتف التواصل الإداري" error={profileErrors.administrativePhone?.message} {...registerProfile('administrativePhone')} />
            <Input label="بريد التواصل الإداري" type="email" error={profileErrors.administrativeEmail?.message} {...registerProfile('administrativeEmail')} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {isProfileDirty && (
            <Button type="button" variant="secondary" onClick={() => resetProfile(mapSchoolToProfileValues(school))}>
              تراجع
            </Button>
          )}
          <Button type="submit" loading={updateProfileMutation.isPending} disabled={!isProfileDirty}>
            <CheckCircle2 className="h-4 w-4 me-1" /> حفظ البيانات التشغيلية
          </Button>
        </div>
      </form>
    </div>
  );
}
