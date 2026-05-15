export type Role = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student' | 'administrative';

export interface User {
  _id: string;
  role: Role;
  schoolId: string | null;
  name: { first: string; last: string };
  mustChangePassword: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface SortMeta {
  field: string;
  order: 'asc' | 'desc';
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  unread?: number;
  sort?: SortMeta;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  pagination?: PaginationMeta;
  error?: ApiErrorPayload;
  message?: string;
  errorCode?: string;
  errors?: ApiErrorDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
  error?: ApiErrorPayload;
  message?: string;
  errorCode?: string;
  errors?: ApiErrorDetail[];
}

// ─── School ──────────────────────────────────────────────────────────────────
export interface SchoolBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

export interface SchoolAdministrationContact {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface SchoolAdministrativeOfficeContact {
  phone?: string | null;
  email?: string | null;
}

export interface SchoolAdministration {
  principal?: SchoolAdministrationContact | null;
  deputyPrincipal?: SchoolAdministrationContact | null;
  counselor?: SchoolAdministrationContact | null;
  administrativeContact?: SchoolAdministrativeOfficeContact | null;
}

export interface School {
  _id: string;
  name: string;
  nameAr?: string | null;
  subdomain: string;
  address: string;
  phone: string;
  email?: string | null;
  logo?: string;
  branding: SchoolBranding;
  academicYear: string;
  administration?: SchoolAdministration;
  isActive: boolean;
  createdAt: string;
}

// ─── Teacher ─────────────────────────────────────────────────────────────────
export interface Teacher {
  _id: string;
  userId: {
    _id: string;
    name: { first: string; last: string };
    phone: string;
    email?: string;
    avatar?: string;
    isActive: boolean;
    mustChangePassword?: boolean;
    lastLogin?: string | null;
  };
  schoolId: string;
  nationalId: string;
  specialization?: string;
  subjects: { _id: string; name: string; code?: string }[];
  classes: { _id: string; name: string; grade: string; section?: string }[];
  joinDate?: string;
  isDeleted: boolean;
}

// ─── Parent ──────────────────────────────────────────────────────────────────
export interface Parent {
  _id: string;
  userId: {
    _id: string;
    name: { first: string; last: string };
    phone: string;
    email?: string;
    isActive: boolean;
    mustChangePassword?: boolean;
    lastLogin?: string | null;
  };
  schoolId: string;
  nationalId: string;
  occupation?: string;
  address?: string;
  children: Student[];
}

// ─── Student ─────────────────────────────────────────────────────────────────
export interface Student {
  _id: string;
  userId: {
    _id: string;
    name: { first: string; last: string };
    phone: string;
    avatar?: string;
    isActive: boolean;
    mustChangePassword?: boolean;
    lastLogin?: string | null;
  };
  schoolId: string;
  nationalId: string;
  classId: { _id: string; name: string; grade: string; section?: string } | null;
  parentId: { _id: string; userId: { name: { first: string; last: string }; phone: string } } | null;
  gender: 'male' | 'female' | 'unspecified';
  dateOfBirth?: string;
  specialStatus?: string[];
  isActive: boolean;
}

// ─── Class ───────────────────────────────────────────────────────────────────
export interface Class {
  _id: string;
  schoolId: string;
  name: string;
  grade: string;
  section?: string;
  academicYear: string;
  teacherId?: { _id: string; userId: { name: { first: string; last: string } } };
  capacity?: number;
  isActive: boolean;
}

// ─── Subject ─────────────────────────────────────────────────────────────────
export interface Subject {
  _id: string;
  schoolId: string;
  name: string;
  nameAr?: string;
  code?: string;
  isActive: boolean;
}

export type AssessmentType = 'quiz' | 'exam' | 'assignment' | 'project' | 'midterm' | 'final';

export interface GradeAcademicLevel {
  key: 'excellent' | 'healthy' | 'watch' | 'critical';
  label: string;
}

export interface Grade {
  _id: string;
  studentId: {
    _id: string;
    nationalId: string;
    userId?: { name: { first: string; last: string } };
    classId?: { _id: string; name: string; grade: string; section?: string };
  } | null;
  subjectId: { _id: string; name: string; nameAr?: string; code?: string } | null;
  classId: { _id: string; name: string; grade: string; section?: string; academicYear?: string } | null;
  teacherId: { _id: string; userId?: { name: { first: string; last: string } } } | null;
  title: string;
  assessmentType: AssessmentType;
  score: number;
  maxScore: number;
  percentage: number;
  examDate: string;
  term?: string | null;
  notes?: string | null;
  academicYear: string;
  isPublished: boolean;
}

export interface StudentGradeSubjectSummary {
  subject: { _id: string; name: string; nameAr?: string | null; code?: string | null };
  teachers: Array<{ _id: string; name: { first: string; last: string } }>;
  assessmentCount: number;
  averagePercentage: number | null;
  highestPercentage: number | null;
  academicLevel: GradeAcademicLevel | null;
  latestRecord: {
    _id: string;
    title: string;
    assessmentType: AssessmentType;
    score: number;
    maxScore: number;
    percentage: number;
    examDate: string;
  } | null;
}

export interface StudentGradeProfileResponse {
  student: {
    _id: string;
    nationalId: string;
    name: { first: string; last: string } | null;
    class: { _id: string; name: string; grade: string; section?: string; academicYear?: string } | null;
  };
  overview: {
    totalAssessments: number;
    subjectsCount: number;
    passingSubjects: number;
    averagePercentage: number | null;
    academicLevel: GradeAcademicLevel | null;
  };
  subjects: StudentGradeSubjectSummary[];
  recentAssessments: Array<{
    _id: string;
    title: string;
    assessmentType: AssessmentType;
    score: number;
    maxScore: number;
    percentage: number;
    examDate: string;
    subject: { _id: string; name: string; nameAr?: string | null } | null;
  }>;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export type AttendanceType = 'absence' | 'late' | 'permission';

export interface AttendanceRecord {
  _id: string;
  studentId: { _id: string; userId: { name: { first: string; last: string } }; nationalId: string };
  classId: string;
  teacherId: string;
  date: string;
  type: AttendanceType;
  notes?: string;
}

export interface AttendanceSummary {
  total: number;
  absence: number;
  late: number;
  permission: number;
}

export interface FileAttachment {
  url: string;
  type: 'image' | 'document';
  name: string;
  size?: number;
  publicId?: string;
}

export interface UploadedFile {
  _id: string;
  fileName: string;
  fileType: 'image' | 'document' | 'spreadsheet';
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  context: 'avatar' | 'behavior' | 'message' | 'import';
  contextId?: string | null;
  isOrphaned?: boolean;
  createdAt: string;
}

// ─── Behavior ─────────────────────────────────────────────────────────────────
export type BehaviorType = 'positive' | 'negative';

export interface BehaviorRecord {
  _id: string;
  studentId: { _id: string; userId: { name: { first: string; last: string } }; nationalId: string };
  teacherId: { _id: string; userId: { name: { first: string; last: string } } } | null;
  classId: { _id: string; name: string; grade: string };
  type: BehaviorType;
  category?: string;
  description: string;
  notifyParent: boolean;
  attachments?: FileAttachment[];
  createdAt: string;
}

// ─── Messaging ────────────────────────────────────────────────────────────────
export interface Conversation {
  _id: string;
  participants: { _id: string; name: { first: string; last: string }; avatar?: string; role: Role }[];
  lastMessage?: { text: string; senderId: string; sentAt: string };
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name: { first: string; last: string }; avatar?: string; role: Role };
  text?: string;
  attachments?: FileAttachment[];
  readBy: string[];
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt?: string;
  data?: { entityType?: string; entityId?: string };
  deliveryMethod?: Array<'in_app' | 'email'>;
  emailSent?: boolean;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: number;
  recentBehavior: number;
}

export interface AttendanceReportDay {
  date: string;
  total: number;
  absence: number;
  late: number;
  permission: number;
}

export interface AttendanceReportTotals {
  total: number;
  absence: number;
  late: number;
  permission: number;
}

export interface AttendanceReportResponse {
  period: { startDate: string; endDate: string };
  daily: AttendanceReportDay[];
  totals: AttendanceReportTotals;
  totalRecords: number;
}

export interface BehaviorReportResponse {
  records: BehaviorRecord[];
  totals: { positive: number; negative: number };
  positive: number;
  negative: number;
  total: number;
}

export interface GradeReportResponse {
  period: { startDate: string; endDate: string } | null;
  summary: {
    totalAssessments: number;
    averagePercentage: number;
    successRate: number;
    totalSubjects: number;
    totalStudents: number;
  };
  subjectBreakdown: Array<{
    subject: { _id: string; name: string; nameAr?: string | null; code?: string | null } | null;
    assessmentCount: number;
    averagePercentage: number;
    successRate: number;
  }>;
  studentBreakdown: Array<{
    student: { _id: string; name: { first: string; last: string } | null; nationalId: string | null } | null;
    class: { _id: string; name: string; grade: string; section?: string } | null;
    assessmentCount: number;
    subjectsCount: number;
    averagePercentage: number;
    academicLevel: GradeAcademicLevel;
  }>;
  assessmentTypeBreakdown: Array<{ type: AssessmentType; count: number }>;
  recentAssessments: Array<{
    _id: string;
    title: string;
    assessmentType: AssessmentType;
    score: number;
    maxScore: number;
    percentage: number;
    examDate: string;
    student: { _id: string; name: { first: string; last: string } | null } | null;
    subject: { _id: string; name: string; nameAr?: string | null } | null;
    class: { _id: string; name: string; grade: string } | null;
  }>;
}
