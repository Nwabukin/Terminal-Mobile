/**
 * Terminal v2 list endpoints use Django REST Framework pagination
 * (`{ count, next, previous, results }`). Some custom endpoints use `{ data: [] }`.
 * Normalize to a plain array for UI layers.
 */
export function extractPagedItems<T>(body: unknown): T[] {
  if (!body || typeof body !== 'object') return [];
  const o = body as Record<string, unknown>;
  if (Array.isArray(o.results)) return o.results as T[];
  if (Array.isArray(o.data)) return o.data as T[];
  return [];
}

export function extractPagedCount(body: unknown): number | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const c = (body as Record<string, unknown>).count;
  return typeof c === 'number' ? c : undefined;
}
