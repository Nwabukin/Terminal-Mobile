export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://your-production-domain.railway.app';

export const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

export const RESOURCE_TYPES = [
  { id: 'equipment', label: 'Equipment' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'facility', label: 'Facility' },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: 'PENDING', badge: 'warning' },
  confirmed: { label: 'CONFIRMED', badge: 'info' },
  active: { label: 'ACTIVE', badge: 'success' },
  completed: { label: 'COMPLETED', badge: 'success' },
  declined: { label: 'DECLINED', badge: 'danger' },
  cancelled: { label: 'CANCELLED', badge: 'neutral' },
} as const;

export const DURATION_TYPES = ['daily', 'weekly', 'monthly'] as const;
