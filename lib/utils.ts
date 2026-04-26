import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fullName(name?: { first: string; last: string } | null): string {
  if (!name) return '—';
  return `${name.first} ${name.last}`;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatFileSize(size?: number | null): string {
  if (!size || size <= 0) return '—';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 || unitIndex === 0 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${units[unitIndex]}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getInitials(name?: { first: string; last: string } | null): string {
  if (!name) return '?';
  return `${name.first[0]}${name.last[0]}`.toUpperCase();
}

export function getRoleBadgeColor(role: string): string {
  const map: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    school_admin: 'bg-blue-100 text-blue-700',
    teacher: 'bg-green-100 text-green-700',
    parent: 'bg-orange-100 text-orange-700',
    student: 'bg-gray-100 text-gray-700',
  };
  return map[role] ?? 'bg-gray-100 text-gray-700';
}

export function getAttendanceBadgeColor(type: string): string {
  const map: Record<string, string> = {
    absence: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    permission: 'bg-blue-100 text-blue-700',
  };
  return map[type] ?? 'bg-gray-100 text-gray-700';
}
