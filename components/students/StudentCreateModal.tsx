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
  gender: z.enum(['male', 'female']),
  classId: z.string().min(1, 'Required'),
  parentId: z.string().min(1, 'Required'),
  dateOfBirth: z.string().optional(),
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
  userId: { name: { first: string; last: string } };
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentCreateFormValues>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: { gender: 'male' },
  });

  useEffect(() => {
    if (!open) {
      reset({
        firstName: '',
        lastName: '',
        nationalId: '',
        phone: '',
        gender: 'male',
        classId: '',
        parentId: '',
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
        <SelectField label="ولي الأمر" {...register('parentId')} error={errors.parentId?.message}>
          <option value="">اختر ولي أمر...</option>
          {parents.map((parent) => (
            <option key={parent._id} value={parent._id}>
              {fullName(parent.userId.name)} - {parent.nationalId}
            </option>
          ))}
        </SelectField>
        {errorMessage && (
          <AlertBanner variant="error" className="sm:col-span-2">
            {errorMessage}
          </AlertBanner>
        )}
      </div>
    </Modal>
  );
}