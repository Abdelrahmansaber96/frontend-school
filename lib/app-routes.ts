export const getDefaultAppRoute = (role?: string | null) => (
  role === 'administrative' ? '/attendance' : '/dashboard'
);