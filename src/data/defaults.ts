import type { RoleConfig } from './types';

export const ROLES: Record<string, RoleConfig> = {
  cfo: {
    name: 'CFO / Finance Director',
    tagline: 'Strategic Treasury & Capital Governance',
    persona: 'Executive oversight of cash runways, corporate balance sheets, and budget approvals.',
    color: '#1F3D7A',
    nav: [
      {
        g: 'Executive & Strategy',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Real-time cash positions and revenue' },
          { s: 'cashflow', l: 'Cash Flow Forecast', icon: 'ti-chart-arrows', desc: 'Predictive 12-month treasury runway' },
          { s: 'approvals', l: 'Approvals Queue', icon: 'ti-checkup-list', desc: 'Executive requisition authorization' },
          { s: 'reports', l: 'Financial Statements', icon: 'ti-file-analytics', desc: 'Audited P&L, Balance Sheet, Cash Flow' },
          { s: 'serviceorders', l: 'Order Profitability', icon: 'ti-report-analytics', desc: 'Job cost margin analysis' },
        ],
      },
      {
        g: 'Treasury & Revenue',
        items: [
          { s: 'invoices', l: 'Invoices & Billing', icon: 'ti-file-invoice', desc: 'Client billing and statements' },
          { s: 'payments', l: 'Payment Submissions', icon: 'ti-cash', desc: 'Bank deposit verifications' },
          { s: 'receivables', l: 'Receivables & Aging', icon: 'ti-credit-card', desc: '30/60/90 days debtor buckets' },
          { s: 'wallets', l: 'Project Wallets', icon: 'ti-wallet', desc: 'Cost-center sub-wallets' },
          { s: 'estatefinance', l: 'Estate Invoices', icon: 'ti-home-dollar', desc: 'Real estate installment billings' },
        ],
      },
      {
        g: 'Accounting & Governance',
        items: [
          { s: 'coa', l: 'Chart of Accounts & GL', icon: 'ti-list-tree', desc: 'General ledger account balances' },
          { s: 'tax', l: 'Tax & Statutory', icon: 'ti-scale', desc: 'WHT, PAYE, and VAT filings' },
          { s: 'audit', l: 'Audit & Exceptions', icon: 'ti-shield-check', desc: 'Immutable transaction ledger' },
          { s: 'settings', l: 'Finance Settings', icon: 'ti-settings', desc: 'Fiscal parameters and tax rates' },
        ],
      },
    ],
    quickLinks: [
      { s: 'dashboard', label: 'Command Center', icon: 'ti-dashboard', desc: 'View high-level KPIs' },
      { s: 'approvals', label: 'Approvals Queue', icon: 'ti-checkup-list', desc: 'Authorize disbursements' },
      { s: 'cashflow', label: 'Treasury Forecast', icon: 'ti-chart-arrows', desc: 'Review burn rate model' },
    ],
  },

  accountant: {
    name: 'Chief Accountant',
    tagline: 'General Ledger & Financial Reporting',
    persona: 'Maintains accurate double-entry postings, bank reconciliations, and tax obligations.',
    color: '#0A6B3E',
    nav: [
      {
        g: 'Accounting & Ledger',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Overview of balances' },
          { s: 'journals', l: 'Journal Entries', icon: 'ti-writing', desc: 'Double-entry adjusting vouchers' },
          { s: 'coa', l: 'Chart of Accounts & GL', icon: 'ti-list-tree', desc: 'General ledger account codes' },
          { s: 'assets', l: 'Fixed Assets', icon: 'ti-building', desc: 'Depreciation and Net Book Values' },
          { s: 'cashbook', l: 'Cashbook & Balances', icon: 'ti-book', desc: 'Daily bank reconciliation' },
        ],
      },
      {
        g: 'Spend & Payables',
        items: [
          { s: 'expenses', l: 'Expense Vouchers', icon: 'ti-receipt', desc: 'Operating expense claims' },
          { s: 'vendors', l: 'Vendors & Bills', icon: 'ti-truck', desc: 'Supplier bills due' },
          { s: 'pettycash', l: 'Petty Cash', icon: 'ti-coin', desc: 'Imprest fund disbursements' },
          { s: 'tax', l: 'Tax & Statutory', icon: 'ti-scale', desc: 'FIRS and State tax schedules' },
        ],
      },
      {
        g: 'Payroll & Reports',
        items: [
          { s: 'payroll', l: 'Payroll Runs', icon: 'ti-users', desc: 'Monthly salary registers' },
          { s: 'reports', l: 'Financial Statements', icon: 'ti-file-analytics', desc: 'Management reports' },
          { s: 'audit', l: 'Audit Log', icon: 'ti-shield-check', desc: 'Audit trail' },
        ],
      },
    ],
    quickLinks: [
      { s: 'journals', label: 'New Journal', icon: 'ti-writing', desc: 'Create ledger entry' },
      { s: 'cashbook', label: 'Reconciliation', icon: 'ti-book', desc: 'Verify bank balances' },
      { s: 'reports', label: 'Trial Balance', icon: 'ti-file-analytics', desc: 'Check GL balance' },
    ],
  },

  auditor: {
    name: 'Internal Auditor',
    tagline: 'Risk Management & Exception Verification',
    persona: 'Ensures compliance with internal controls, authority limits, and anti-fraud policies.',
    color: '#7C3AED',
    nav: [
      {
        g: 'Compliance & Audit',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Overview metrics' },
          { s: 'audit', l: 'Audit Trail & Exceptions', icon: 'ti-shield-check', desc: 'Real-time exception alerts' },
          { s: 'journals', l: 'Journal Register', icon: 'ti-writing', desc: 'Audit journal postings' },
          { s: 'approvals', l: 'Approvals Log', icon: 'ti-checkup-list', desc: 'Review signature limits' },
        ],
      },
      {
        g: 'Voucher Inspection',
        items: [
          { s: 'expenses', l: 'Expense Audit', icon: 'ti-receipt', desc: 'Inspect receipt attachments' },
          { s: 'pettycash', l: 'Petty Cash Retires', icon: 'ti-coin', desc: 'Inspect cash retirements' },
          { s: 'vendors', l: 'Vendor Due Diligence', icon: 'ti-truck', desc: 'Supplier verification' },
          { s: 'reports', l: 'Statement Audit', icon: 'ti-file-analytics', desc: 'Verify statement integrity' },
        ],
      },
    ],
    quickLinks: [
      { s: 'audit', label: 'Audit Exceptions', icon: 'ti-shield-check', desc: 'View high severity alerts' },
      { s: 'expenses', label: 'Expense Audit', icon: 'ti-receipt', desc: 'Check vouchers' },
    ],
  },

  cashier: {
    name: 'Treasury & Cashier',
    tagline: 'Cash Disbursements & Inbound Receipts',
    persona: 'Manages physical cash vault, petty cash floats, and daily bank deposits.',
    color: '#B87D00',
    nav: [
      {
        g: 'Cash Operations',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Daily cash dashboard' },
          { s: 'cashbook', l: 'Cashbook & Balances', icon: 'ti-book', desc: 'Record daily inflows/outflows' },
          { s: 'pettycash', l: 'Petty Cash Floats', icon: 'ti-coin', desc: 'Issue advances and record retirements' },
          { s: 'payments', l: 'Payment Receipts', icon: 'ti-cash', desc: 'Verify incoming payment slips' },
        ],
      },
      {
        g: 'Outflows',
        items: [
          { s: 'expenses', l: 'Expense Claims', icon: 'ti-receipt', desc: 'Disburse approved vouchers' },
          { s: 'wallets', l: 'Project Wallets', icon: 'ti-wallet', desc: 'Site cash disbursements' },
        ],
      },
    ],
    quickLinks: [
      { s: 'cashbook', label: 'Cashbook Entry', icon: 'ti-book', desc: 'Record transaction' },
      { s: 'pettycash', label: 'Petty Advance', icon: 'ti-coin', desc: 'Issue cash float' },
    ],
  },

  payroll: {
    name: 'Payroll & Tax Specialist',
    tagline: 'Compensation, Deductions & Remittances',
    persona: 'Executes monthly staff salaries, pension remittances, and FIRS / State tax schedules.',
    color: '#CC0000',
    nav: [
      {
        g: 'Payroll & Compensation',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Payroll overview' },
          { s: 'payroll', l: 'Payroll Runs', icon: 'ti-users', desc: 'Salary batch calculation & slips' },
          { s: 'commissions', l: 'Commissions & Awards', icon: 'ti-award', desc: 'Realtor sales commissions' },
        ],
      },
      {
        g: 'Tax & Compliance',
        items: [
          { s: 'tax', l: 'Tax & Statutory', icon: 'ti-scale', desc: 'PAYE, Pension & WHT remittances' },
          { s: 'reports', l: 'Compensation Reports', icon: 'ti-file-analytics', desc: 'Staff earnings register' },
        ],
      },
    ],
    quickLinks: [
      { s: 'payroll', label: 'Calculate Payroll', icon: 'ti-users', desc: 'Run monthly salaries' },
      { s: 'tax', label: 'Tax Remittance', icon: 'ti-scale', desc: 'Filing schedules' },
    ],
  },

  ceo: {
    name: 'CEO / Founder',
    tagline: 'Enterprise Financial Performance',
    persona: 'Executive dashboard for enterprise profitability, revenue velocity, and company valuation.',
    color: '#152C5C',
    nav: [
      {
        g: 'Enterprise Overview',
        items: [
          { s: 'dashboard', l: 'Command Center', icon: 'ti-dashboard', desc: 'Company-wide financial metrics' },
          { s: 'cashflow', l: 'Cash Runway', icon: 'ti-chart-arrows', desc: 'Treasury burn rate' },
          { s: 'serviceorders', l: 'Order Profitability', icon: 'ti-report-analytics', desc: 'Project margins' },
          { s: 'approvals', l: 'Executive Approvals', icon: 'ti-checkup-list', desc: 'High-value sign-offs' },
          { s: 'reports', l: 'Financial Statements', icon: 'ti-file-analytics', desc: 'Executive summaries' },
          { s: 'invoices', l: 'Invoices', icon: 'ti-file-invoice', desc: 'Billings' },
          { s: 'expenses', l: 'Expenses', icon: 'ti-receipt', desc: 'Spend' },
          { s: 'audit', l: 'Audit Logs', icon: 'ti-shield-check', desc: 'Exceptions' },
          { s: 'settings', l: 'Settings', icon: 'ti-settings', desc: 'Configurations' },
        ],
      },
    ],
    quickLinks: [
      { s: 'dashboard', label: 'Executive Dashboard', icon: 'ti-dashboard', desc: 'View revenue and burn' },
      { s: 'approvals', label: 'Approvals Queue', icon: 'ti-checkup-list', desc: 'Authorize requisitions' },
    ],
  },
};
