export type FinanceErrorKind = 'unauthorized' | 'forbidden' | 'unsupported' | 'network' | 'generic';

export function getFinanceErrorKind(status?: number): FinanceErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'unsupported';
  if (status === 0 || (status !== undefined && status >= 500)) return 'network';
  return 'generic';
}
