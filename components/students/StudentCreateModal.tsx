'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import AlertBanner from '@/components/ui/AlertBanner';
import { fullName } from '@/lib/utils';

export const studentCreateSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  nationalId: z.string().min(5, 'Min 5 chars'),
  phone: z.string().min(9, 'Min 9 digits'),
  gender: z.enum(['male', 'female', 'unspecified']),
  classId: z.string().min(1, 'Required'),
  parentId: z.string().optional(),
  parentMode: z.enum(['none', 'existing', 'new']),
  parentFirstName: z.string().optional(),
  parentLastName: z.string().optional(),
  parentNationalId: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  passwordMode: z.enum(['default', 'custom']),
  temporaryPassword: z.string().optional(),
  dateOfBirth: z.string().optional(),
}).superRefine((values, context) => {
  if (values.passwordMode === 'custom' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(values.temporaryPassword || '')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['temporaryPassword'], message: '8 أحرف على الأقل وتحتوي حرفًا كبيرًا وصغيرًا ورقمًا' });
  }
  if (values.parentMode === 'existing' && !values.parentId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['parentId'], message: 'اختر ولي الأمر' });
  }
  if (values.parentMode === 'new') {
    const required: Array<[keyof typeof values, string]> = [
      ['parentFirstName', 'أدخل اسم ولي الأمر'], ['parentLastName', 'أدخل اسم العائلة'],
      ['parentNationalId', 'أدخل رقم الهوية'], ['parentPhone', 'أدخل رقم الجوال'],
    ];
    required.forEach(([path, message]) => {
      if (!String(values[path] || '').trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    });
  }
});

export type StudentCreateFormValues = z.infer<typeof studentCreateSchema>;

interface StudentClassOption {
  _id: string;
  name: string;
  grade: string;
  section?: string;
}

interface StudentParentOption {
  _id: string;
  userId: { name: { first: string; last: string }; phone?: string };
  nationalId: string;
}

interface StudentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: StudentCreateFormValues) => void;
  isSubmitting: boolean;
  classes: StudentClassOption[];
  parents: StudentParentOption[];
  errorMessage?: string | null;
}

export default function StudentCreateModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  classes,
  parents,
  errorMessage,
}: StudentCreateModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<StudentCreateFormValues>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: { gender: 'unspecified', parentId: '', parentMode: 'none', passwordMode: 'default' },
  });
  const parentMode = watch('parentMode');
  const passwordMode = watch('passwordMode');

  useEffect(() => {
    if (!open) {
      reset({
        firstName: '',
        lastName: '',
        nationalId: '',
        phone: '',
        gender: 'unspecified',
        classId: '',
        parentId: '',
        parentMode: 'none',
        passwordMode: 'default',
        temporaryPassword: '',
        parentFirstName: '', parentLastName: '', parentNationalId: '', parentPhone: '', parentEmail: '',
        dateOfBirth: '',
      });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إضافة طالب جديد"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>إضافة طالب</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="الاسم الأول" {...register('firstName')} error={errors.firstName?.message} />
        <Input label="اسم العائلة" {...register('lastName')} error={errors.lastName?.message} />
        <Input label="رقم الهوية" {...register('nationalId')} error={errors.nationalId?.message} />
        <Input label="رقم الجوال" {...register('phone')} error={errors.phone?.message} />
        <SelectField label="الجنس" {...register('gender')} error={errors.gender?.message}>
          <option value="unspecified">غير محدد</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </SelectField>
        <Input label="تاريخ الميلاد" type="date" {...register('dateOfBirth')} />
        <SelectField label="الفصل" {...register('classId')} error={errors.classId?.message}>
          <option value="">اختر فصل...</option>
          {classes.map((classOption) => (
            <option key={classOption._id} value={classOption._id}>
              {classOption.name} - صف {classOption.grade}{classOption.section ? ` (${classOption.section})` : ''}
            </option>
          ))}
        </SelectField>
        <SelectField label="إدارة ولي الأمر" {...register('parentMode')}>
          <option value="none">بدون ربط الآن</option>
          <option value="existing">ربط حساب موجود</option>
          <option value="new">إنشاء حساب ولي أمر جديد</option>
        </SelectField>
        {parentMode === 'existing' && (
          <SelectField label="حساب ولي الأمر" {...register('parentId')} error={errors.parentId?.message}>
            <option value="">اختر ولي الأمر...</option>
            {parents.map((parent) => <option key={parent._id} value={parent._id}>{fullName(parent.userId.name)} - {parent.nationalId}</option>)}
          </SelectField>
        )}
        {parentMode === 'new' && <>
          <Input label="اسم ولي الأمر" {...register('parentFirstName')} error={errors.parentFirstName?.message} />
          <Input label="اسم العائلة" {...register('parentLastName')} error={errors.parentLastName?.message} />
          <Input label="هوية ولي الأمر" {...register('parentNationalId')} error={errors.parentNationalId?.message} />
          <Input label="جوال ولي الأمر" {...register('parentPhone')} error={errors.parentPhone?.message} />
          <Input label="بريد ولي الأمر (اختياري)" type="email" {...register('parentEmail')} error={errors.parentEmail?.message} />
        </>}
        <SelectField label="كلمة المرور المؤقتة" {...register('passwordMode')}>
          <option value="default">Student@ + آخر 4 أرقام من الهوية</option>
          <option value="custom">تحديد كلمة مؤقتة مخصصة</option>
        </SelectField>
        {passwordMode === 'custom' && (
          <Input label="الكلمة المؤقتة المخصصة" type="text" dir="ltr" {...register('temporaryPassword')} error={errors.temporaryPassword?.message} />
        )}
        {errorMessage && (
          <AlertBanner variant="error" className="sm:col-span-2">
            {errorMessage}
          </AlertBanner>
        )}
      </div>
    </Modal>
  );
}
