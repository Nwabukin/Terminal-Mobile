import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number): string {
  return `₦${new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === new Date().getFullYear();
  const fmt = sameYear ? 'MMM d' : 'MMM d, yyyy';
  return `${format(s, fmt)} – ${format(e, fmt)}`;
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
