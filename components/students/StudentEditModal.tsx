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
import type { Student } from '@/types';

const studentEditSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(9, 'Min 9 digits'),
  gender: z.enum(['male', 'female', 'unspecified']),
  classId: z.string().min(1, 'Required'),
  parentId: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export type StudentEditFormValues = z.infer<typeof studentEditSchema>;

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

interface StudentEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: StudentEditFormValues) => void;
  isSubmitting: boolean;
  student: Student | null;
  classes: StudentClassOption[];
  parents: StudentParentOption[];
  errorMessage?: string | null;
}

export default function StudentEditModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  student,
  classes,
  parents,
  errorMessage,
}: StudentEditModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      gender: 'unspecified',
      classId: '',
      parentId: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (open && student) {
      reset({
        firstName: student.userId.name.first,
        lastName: student.userId.name.last,
        phone: student.userId.phone,
        gender: student.gender || 'unspecified',
        classId: student.classId?._id || '',
        parentId: student.parentId?._id || '',
        dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : '',
      });
    }
  }, [open, reset, student]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعديل بيانات الطالب"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>حفظ التعديلات</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="الاسم الأول" {...register('firstName')} error={errors.firstName?.message} />
        <Input label="اسم العائلة" {...register('lastName')} error={errors.lastName?.message} />
        <Input label="رقم الجوال" {...register('phone')} error={errors.phone?.message} />
        <Input label="رقم الهوية" value={student?.nationalId ?? ''} disabled readOnly />
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
        <SelectField label="ولي الأمر (اختياري)" {...register('parentId')} error={errors.parentId?.message}>
          <option value="">بدون ولي أمر</option>
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