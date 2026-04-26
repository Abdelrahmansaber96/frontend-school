export const getDefaultAppRoute = (role?: string | null) => (
  role === 'student' ? '/portal' : '/dashboard'
);