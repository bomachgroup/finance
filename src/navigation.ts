import { ROLES } from './data/defaults';
import type { NavGroup } from './data/types';

export const SCREEN_TITLES: Record<string, string> = {
  dashboard: 'Executive Command Center',
  invoices: 'Invoices & Billing',
  payments: 'Payment Confirmations & Submissions',
  receivables: 'Receivables & Aging Schedule',
  wallets: 'Project & Operations Wallets',
  cashbook: 'Cashbook & Daily Balances',
  serviceorders: 'Service Orders Profitability',
  estatefinance: 'Estate Property Invoices',
  expenses: 'Expense Management & Disbursements',
  vendors: 'Vendors & Bills Payables',
  pettycash: 'Petty Cash Advances & Retirements',
  approvals: 'Finance Approvals Queue',
  cashflow: 'Cash Flow & Forecast Runway',
  payroll: 'Payroll Runs & Direct Remittance',
  commissions: 'Commissions, Bonuses & Awards',
  tax: 'Tax & Statutory Obligations (WHT/PAYE/VAT)',
  journals: 'Journal Entries & Postings',
  coa: 'Chart of Accounts & General Ledger',
  assets: 'Fixed Assets Register & Depreciation',
  reports: 'Financial Statements & Reports Catalog',
  audit: 'Audit Trail & Financial Exceptions',
  settings: 'Finance Settings & Currencies',
};

export const SCREEN_TO_RESOURCE_MAP: Record<string, string[]> = {
  dashboard: ['finance_dashboard', 'finance_command_center', 'finance_overview', 'command_center', 'dashboard'],
  invoices: ['finance_invoices', 'invoices', 'billing', 'accounts_receivable', 'service_invoices', 'estate_invoices'],
  payments: ['finance_payments', 'payments', 'payment_submissions', 'collections'],
  receivables: ['finance_receivables', 'receivables', 'invoices', 'service_invoices', 'estate_invoices'],
  wallets: ['finance_wallets', 'wallets', 'wallet', 'wallet_management'],
  cashbook: ['finance_cashbook', 'cashbook', 'cash_management', 'bank_reconciliation', 'general_ledger'],
  serviceorders: ['finance_service_orders', 'service_orders', 'orders', 'profitability', 'margin_analysis'],
  estatefinance: ['estate_invoices', 'estate_property_invoices', 'real_estate_finance'],
  expenses: ['finance_expenses', 'expenses', 'disbursements'],
  vendors: ['finance_vendors', 'finance_vendor_bills', 'vendor_bills', 'payables', 'vendors'],
  pettycash: ['finance_petty_cash', 'petty_cash', 'advances'],
  approvals: ['finance_approvals', 'approvals', 'approval_queue', 'approval_requests', 'approval_flows'],
  cashflow: ['finance_cash_flow', 'cash_flow', 'treasury'],
  payroll: ['finance_payroll', 'payroll', 'hr_payroll'],
  commissions: ['finance_commissions', 'commissions', 'bonuses', 'awards'],
  tax: ['finance_statutory', 'tax', 'statutory_obligations', 'withholding_tax'],
  journals: ['finance_journals', 'journals', 'journal_entries'],
  coa: ['finance_accounts', 'finance_ledger_accounts', 'general_ledger', 'chart_of_accounts'],
  assets: ['finance_fixed_assets', 'fixed_assets', 'asset_management'],
  reports: ['finance_reports', 'financial_reports', 'financial_statements', 'reports'],
  audit: ['finance_audit', 'finance_exceptions', 'audit_logs'],
  settings: ['finance_settings', 'settings', 'configuration', 'company_settings'],
};

export function screenPath(screen: string): string {
  return '/' + screen;
}

export function roleFirstScreen(roleKey: string): string {
  return ROLES[roleKey]?.nav[0]?.items[0]?.s ?? '';
}

function allRoleNavGroups(): NavGroup[] {
  return Object.values(ROLES).flatMap((role) => role.nav);
}

export function accessibleNavGroups(
  roleKey: string,
  permissions: Record<string, string[]>,
  hasPermission: (resource: string, action?: string) => boolean,
): NavGroup[] {
  const isSuperUser = Boolean(permissions['*'] || permissions.all || permissions['all']);
  // Unknown backend role names may still have explicit screen permissions.
  // Use the full catalog in that case, but keep every item permission-gated.
  const sourceGroups = isSuperUser || !ROLES[roleKey] ? allRoleNavGroups() : ROLES[roleKey].nav;

  const seenScreens = new Set<string>();
  const groups: NavGroup[] = [];

  sourceGroups.forEach((group) => {
    const items = group.items.filter((item) => {
      if (seenScreens.has(item.s)) return false;
      if (!hasPermission(item.s, 'view')) return false;
      seenScreens.add(item.s);
      return true;
    });

    if (items.length > 0) {
      groups.push({ ...group, items });
    }
  });

  return groups;
}

export function firstAccessibleScreen(
  roleKey: string,
  permissions: Record<string, string[]>,
  hasPermission: (resource: string, action?: string) => boolean,
): string {
  return accessibleNavGroups(roleKey, permissions, hasPermission)[0]?.items[0]?.s || '';
}

export function screenTitleFromPath(pathname: string): string {
  const seg = pathname.replace(/^\//, '') || 'dashboard';
  return SCREEN_TITLES[seg] ?? 'Finance & Accounting OS';
}
