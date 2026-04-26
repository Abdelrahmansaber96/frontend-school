import Badge from './Badge';

interface StatusBadgeProps {
  isActive?: boolean | null;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export default function StatusBadge({
  isActive,
  activeLabel = 'نشط',
  inactiveLabel = 'غير نشط',
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant={isActive ? 'success' : 'danger'} className={className}>
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}