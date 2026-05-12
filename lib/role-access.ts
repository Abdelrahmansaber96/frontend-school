import type { Role } from '@/types';

export const roleGroups = {
  superAdmins: ['super_admin'],
  schoolManagers: ['super_admin', 'school_admin'],
  staff: ['school_admin', 'teacher', 'administrative'],
  reportViewers: ['super_admin', 'school_admin', 'teacher'],
  parents: ['parent'],
  students: ['student'],
} as const satisfies Record<string, readonly Role[]>;

export const hasAnyRole = (
  currentRole: Role | null | undefined,
  allowedRoles: readonly Role[],
) => Boolean(currentRole && allowedRoles.includes(currentRole));