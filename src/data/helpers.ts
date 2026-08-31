/**
 * Data and text formatters for Finance OS.
 */

export function formatCurrencyNGN(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) return '₦0.00';
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDisplayLabel(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (num === undefined || num === null || !Number.isFinite(num)) return '—';
  return num.toLocaleString('en-NG', { maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function capitalizeName(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatPercentage(val: number | string | undefined | null): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (num === undefined || num === null || isNaN(num)) return '—';
  return `${num >= 0 ? '+' : ''}${formatNumber(num)}%`;
}

/**
 * Safely extracts an array from either raw arrays or PagedResponse envelopes ({ items: [...] }, { results: [...] }, { data: [...] }).
 */
export function extractApiItems<T = Record<string, any>>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object') {
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}
