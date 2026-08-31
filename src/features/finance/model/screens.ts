import type { ScreenId } from './types';

export const screenIds = [
  'dashboard',
  'invoices',
  'payments',
  'receivables',
  'wallets',
  'cashbook',
  'serviceorders',
  'estatefinance',
  'expenses',
  'vendors',
  'pettycash',
  'approvals',
  'budgets',
  'projects',
  'cashflow',
  'payroll',
  'commissions',
  'tax',
  'banks',
  'reconcile',
  'journals',
  'coa',
  'assets',
  'clientportal',
  'reports',
  'audit',
  'settings',
] as const satisfies readonly ScreenId[];

export function isScreenId(value: string): value is ScreenId {
  return (screenIds as readonly string[]).includes(value);
}
