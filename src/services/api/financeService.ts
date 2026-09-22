import { apiRequest, buildQueryString } from './apiClient';

// ==========================================
// 1. COMMON / PAGINATION TYPES
// ==========================================

export interface PagedResponse<T> {
  items: T[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  search?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

// ==========================================
// 2. COMMAND CENTER & OVERVIEW
// ==========================================

export interface CommandCenterMetrics {
  total_revenue?: number;
  total_expenses?: number;
  net_profit?: number;
  profit_margin_pct?: number;
  cash_balance?: number;
  accounts_receivable?: number;
  accounts_payable?: number;
  pending_approvals_count?: number;
  exceptions_count?: number;
  period?: string;
  [key: string]: unknown;
}

// ==========================================
// 3. ACCOUNTS & GENERAL LEDGER
// ==========================================

export interface FinanceAccount {
  id: number;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | string;
  subtype?: string | null;
  currency?: string;
  balance?: number;
  is_active?: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceAccountCreatePayload {
  display_name: string;
  account_type?: string;
  currency?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  description?: string | null;
}

export interface FinanceAccountUpdatePayload {
  name?: string;
  subtype?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export interface LedgerAccount {
  id: number;
  account_id?: number;
  code: string;
  name: string;
  currency: string;
  balance: number;
  is_active: boolean;
}

export interface GeneralLedgerEntry {
  id: number;
  date: string;
  journal_id?: number;
  account_id: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  balance_after?: number;
  reference?: string;
  description?: string;
}

export interface TrialBalanceItem {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  net_balance: number;
}

export interface TrialBalanceReport {
  period_start?: string;
  period_end?: string;
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  items: TrialBalanceItem[];
}

// ==========================================
// 4. JOURNALS
// ==========================================

export interface JournalLineItem {
  id?: number;
  account_id: number;
  account_code?: string;
  account_name?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: number;
  entry_number?: string;
  date: string;
  memo: string;
  reference?: string;
  total_amount?: number;
  status: 'draft' | 'posted' | 'reversed' | string;
  created_by?: string | number;
  lines: JournalLineItem[];
  created_at?: string;
  updated_at?: string;
}

export interface JournalCreatePayload {
  entry_date: string;
  memo?: string;
  currency?: string;
  branch_id?: number;
  reference?: string;
  lines: Array<{
    ledger_account_id: number;
    debit: number;
    credit: number;
    description?: string;
  }>;
}

// ==========================================
// 5. CASHBOOK & CASH FLOW
// ==========================================

export interface CashbookTransaction {
  id: number;
  date: string;
  type: 'inflow' | 'outflow';
  amount: number;
  account_id?: number;
  account_name?: string;
  reference?: string;
  description?: string;
  source?: string;
  project_id?: number;
  order_id?: number;
  status?: string;
}

export interface CashbookSummary {
  opening_balance: number;
  total_inflows: number;
  total_outflows: number;
  closing_balance: number;
  period?: string;
}

export interface CashFlowForecast {
  projected_inflows: number;
  projected_outflows: number;
  projected_net_cash_flow: number;
  runway_months?: number;
  periods?: Array<{
    period: string;
    inflow: number;
    outflow: number;
    net: number;
    projected_balance: number;
  }>;
}

// ==========================================
// 6. INVOICES & RECEIVABLES
// ==========================================

export interface FinanceInvoice {
  id: number;
  invoice_number: string;
  client_id?: number;
  client_name: string;
  service_type?: string;
  branch_id?: number;
  branch_name?: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | string;
  project_id?: number;
  order_id?: number;
  currency?: string;
}

export interface ReceivablesSummary {
  total_receivable: number;
  current_due: number;
  overdue_1_30: number;
  overdue_31_60: number;
  overdue_61_90: number;
  overdue_90_plus: number;
}

// ==========================================
// 7. ESTATE PROPERTY INVOICES
// ==========================================

export interface EstatePropertyInvoice {
  id: number;
  invoice_number?: string;
  property_id?: number;
  property_name?: string;
  client_id?: number;
  client_name?: string;
  total_amount: number;
  amount_paid?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid' | string;
  approval_step?: string | number;
  created_at?: string;
  due_date?: string;
}

export interface EstateInvoiceFieldChoices {
  payment_methods?: string[];
  property_types?: string[];
  statuses?: string[];
  [key: string]: unknown;
}

// ==========================================
// 8. EXPENSES
// ==========================================

export interface FinanceExpense {
  id: number;
  expense_number?: string;
  date: string;
  requester_id?: number;
  requester_name?: string;
  category: string;
  cost_type?: string;
  stage?: string;
  is_billable?: boolean;
  branch_id?: number;
  project_id?: number;
  order_id?: number;
  amount: number;
  currency?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | string;
  beneficiary: string;
  purpose: string;
  receipt_url?: string | null;
  created_at?: string;
}

export interface FinanceExpenseCreatePayload {
  finance_account_id?: number;
  date: string;
  category: string;
  cost_type?: string;
  is_billable?: boolean;
  branch_id?: number;
  project_id?: number;
  order_id?: number;
  amount: number;
  currency?: string;
  beneficiary: string;
  purpose?: string;
  description?: string;
  receipt_url?: string | null;
}

// ==========================================
// 9. VENDORS & VENDOR BILLS (PAYABLES)
// ==========================================

export interface FinanceVendor {
  id: number;
  name: string;
  code?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms_days?: number;
  is_active: boolean;
  created_at?: string;
}

export interface VendorBill {
  id: number;
  bill_number: string;
  vendor_id: number;
  vendor_name?: string;
  category?: string;
  project_id?: number;
  order_id?: number;
  amount: number;
  withholding_tax_amount?: number;
  net_amount?: number;
  amount_paid?: number;
  due_date: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'void' | string;
  description?: string;
}

export interface VendorBillSummary {
  total_payable: number;
  current_due: number;
  overdue_amount: number;
  bills_count: number;
}

// ==========================================
// 10. PETTY CASH & ADVANCES
// ==========================================

export interface PettyCashAdvance {
  id: number;
  advance_number?: string;
  employee_id: number;
  employee_name?: string;
  amount: number;
  currency?: string;
  purpose: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'issued' | 'retired' | 'cancelled' | string;
  requested_date: string;
  issued_date?: string | null;
  retired_date?: string | null;
  amount_spent?: number;
  amount_refunded?: number;
}

export interface PettyCashSummary {
  custodian_balance: number;
  total_advances_outstanding: number;
  total_expenses_unretired: number;
  replenishment_threshold: number;
}

// ==========================================
// 11. WALLETS & TRANSACTIONS
// ==========================================

export interface FinanceWallet {
  id: number;
  name: string;
  wallet_type: 'project' | 'department' | 'operational' | 'user' | string;
  project_id?: number;
  balance: number;
  total_funded?: number;
  total_spent?: number;
  status: 'active' | 'frozen' | 'closed' | string;
  currency?: string;
}

export interface WalletEntry {
  id: number;
  wallet_id: number;
  entry_type: 'credit' | 'debit';
  amount: number;
  reference?: string;
  description?: string;
  created_at: string;
  is_voided?: boolean;
}

export interface GenericWalletTransaction {
  id: number;
  user_id?: number;
  amount: number;
  transaction_type: string;
  status: string;
  reference: string;
  created_at: string;
}

// ==========================================
// 12. PAYROLL
// ==========================================

export interface PayrollRunItem {
  id: number;
  period: string;
  run_number?: string;
  employees_count: number;
  total_gross: number;
  total_tax: number;
  total_pension: number;
  total_deductions: number;
  total_net: number;
  status: 'draft' | 'calculated' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'cancelled' | string;
  pay_date?: string;
  created_at?: string;
}

// ==========================================
// 13. COMMISSIONS & BONUSES
// ==========================================

export interface CommissionRule {
  id: number;
  name: string;
  role_id?: number;
  percentage_rate: number;
  threshold_amount?: number;
  is_active: boolean;
}

export interface CommissionAward {
  id: number;
  employee_id: number;
  employee_name?: string;
  source_type: string;
  source_id?: number;
  revenue_base: number;
  commission_rate: number;
  calculated_amount: number;
  approved_amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | string;
  awarded_date?: string;
}

// ==========================================
// 14. STATUTORY & TAX
// ==========================================

export interface StatutoryObligation {
  id: number;
  obligation_type: 'vat' | 'wht' | 'paye' | 'cit' | 'pension' | 'nhf' | string;
  period: string;
  due_date: string;
  amount_payable: number;
  amount_paid?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'void' | string;
  reference_number?: string;
  tax_authority?: string;
}

export interface StatutorySummary {
  total_tax_due: number;
  total_tax_paid: number;
  upcoming_obligations_count: number;
}

// ==========================================
// 15. FIXED ASSETS
// ==========================================

export interface FixedAssetCategory {
  id: number;
  name: string;
  depreciation_method: 'straight_line' | 'reducing_balance' | string;
  useful_life_years: number;
  salvage_value_pct?: number;
  is_active: boolean;
}

export interface FixedAsset {
  id: number;
  asset_tag: string;
  name: string;
  category_id: number;
  category_name?: string;
  purchase_date: string;
  purchase_cost: number;
  salvage_value: number;
  useful_life_years: number;
  accumulated_depreciation: number;
  net_book_value: number;
  status: 'draft' | 'capitalized' | 'depreciating' | 'fully_depreciated' | 'disposed' | string;
  branch_id?: number;
  location?: string;
}

// ==========================================
// 16. PAYMENTS & SUBMISSIONS
// ==========================================

export interface PaymentSubmission {
  id: number;
  client_id?: number;
  client_name?: string;
  invoice_id?: number;
  amount: number;
  payment_method: string;
  payment_reference: string;
  evidence_file_url?: string;
  status: 'submitted' | 'verified' | 'rejected' | string;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewer_notes?: string | null;
}

export interface ConfirmedPayment {
  id: number;
  payment_reference: string;
  invoice_id: number;
  client_name: string;
  amount: number;
  date: string;
  method: string;
  account_id?: number;
  status: string;
}

// ==========================================
// 17. SERVICE ORDER PROFITABILITY
// ==========================================

export interface ServiceOrderProfitability {
  order_id: number;
  order_number?: string;
  client_name: string;
  service_name: string;
  contract_value: number;
  direct_costs: number;
  overhead_allocated: number;
  gross_profit: number;
  gross_margin_pct: number;
  status: string;
}

export interface ProfitabilitySummary {
  total_revenue: number;
  total_direct_costs: number;
  total_overheads: number;
  total_gross_profit: number;
  average_margin_pct: number;
}

// ==========================================
// 18. FINANCIAL REPORTS
// ==========================================

export interface ReportCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
}

export interface FinancialReportStatement {
  report_name?: string;
  period?: string;
  currency: string;
  sections?: Array<{
    title: string;
    subtotal: number;
    items: Array<{
      label: string;
      amount: number;
      code?: string;
    }>;
  }>;
  net_total?: number;
  date_from?: string;
  date_to?: string;
  revenue?: unknown[];
  expenses?: unknown[];
  total_revenue?: number | string;
  total_expenses?: number | string;
  net_profit?: number | string;
}

// ==========================================
// 19. AUDIT & EXCEPTIONS
// ==========================================

export interface FinanceAuditLog {
  id: number;
  timestamp: string;
  actor_id?: number;
  actor_name: string;
  action: string;
  entity: string;
  entity_id?: string | number;
  details?: unknown;
}

export interface FinanceException {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  is_resolved: boolean;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

export interface FinanceExceptionSummary {
  total_unresolved: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

// ==========================================
// 20. SETTINGS
// ==========================================

export interface FinanceSettings {
  default_currency: string;
  financial_year_start_month: number | null;
  closed_through_date?: string | null;
  journal_prefix?: string | null;
  draft_journal_warning_days?: number | null;
  large_manual_journal_review_threshold?: number | string | null;
  [key: string]: unknown;
}

// =========================================================================
// FINANCE SERVICE IMPLEMENTATION (126+ Endpoints)
// =========================================================================

export const financeService = {
  // --- 1. Command Center & Metrics ---
  getCommandCenter: async () => {
    return apiRequest<CommandCenterMetrics>('/api/v1/finance/command-center');
  },

  // --- 2. Accounts & General Ledger ---
  listAccounts: async (params?: PaginationParams & { account_type?: string }) => {
    return apiRequest<PagedResponse<FinanceAccount> | FinanceAccount[]>(
      `/api/v1/finance/accounts${buildQueryString(params)}`,
    );
  },

  createAccount: async (payload: FinanceAccountCreatePayload) => {
    return apiRequest<FinanceAccount>('/api/v1/finance/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateAccount: async (accountId: number | string, payload: FinanceAccountUpdatePayload) => {
    return apiRequest<FinanceAccount>(`/api/v1/finance/accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getAccountBalance: async (accountId: number | string) => {
    return apiRequest<{ account_id: number; balance: number; currency: string }>(
      `/api/v1/finance/accounts/${accountId}/balance`,
    );
  },

  deactivateAccount: async (accountId: number | string) => {
    return apiRequest<{ success: boolean; message?: string }>(
      `/api/v1/finance/accounts/${accountId}/deactivate`,
      { method: 'POST' },
    );
  },

  linkLedgerAccount: async (accountId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<LedgerAccount>(`/api/v1/finance/accounts/${accountId}/ledger-account`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listLedgerAccounts: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<LedgerAccount> | LedgerAccount[]>(
      `/api/v1/finance/ledger-accounts${buildQueryString(params)}`,
    );
  },

  createLedgerAccount: async (payload: Record<string, unknown>) => {
    return apiRequest<LedgerAccount>('/api/v1/finance/ledger-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getLedgerAccount: async (accountId: number | string) => {
    return apiRequest<LedgerAccount>(`/api/v1/finance/ledger-accounts/${accountId}`);
  },

  updateLedgerAccount: async (accountId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<LedgerAccount>(`/api/v1/finance/ledger-accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deactivateLedgerAccount: async (accountId: number | string) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/finance/ledger-accounts/${accountId}/deactivate`,
      { method: 'POST' },
    );
  },

  getGeneralLedger: async (params?: {
    account_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    return apiRequest<PagedResponse<GeneralLedgerEntry> | GeneralLedgerEntry[]>(
      `/api/v1/finance/general-ledger${buildQueryString(params)}`,
    );
  },

  getTrialBalance: async (params?: { as_of_date?: string }) => {
    return apiRequest<TrialBalanceReport>(
      `/api/v1/finance/trial-balance${buildQueryString(params)}`,
    );
  },

  // --- 3. Journals ---
  listJournals: async (params?: PaginationParams & { status?: string; start_date?: string; end_date?: string }) => {
    return apiRequest<PagedResponse<JournalEntry> | JournalEntry[]>(
      `/api/v1/finance/journals${buildQueryString(params)}`,
    );
  },

  createJournal: async (payload: JournalCreatePayload) => {
    return apiRequest<JournalEntry>('/api/v1/finance/journals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getJournal: async (journalId: number | string) => {
    return apiRequest<JournalEntry>(`/api/v1/finance/journals/${journalId}`);
  },

  updateJournal: async (journalId: number | string, payload: Partial<JournalCreatePayload>) => {
    return apiRequest<JournalEntry>(`/api/v1/finance/journals/${journalId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  postJournal: async (journalId: number | string) => {
    return apiRequest<JournalEntry>(`/api/v1/finance/journals/${journalId}/post`, {
      method: 'POST',
    });
  },

  reverseJournal: async (journalId: number | string, payload?: { reason?: string }) => {
    return apiRequest<JournalEntry>(`/api/v1/finance/journals/${journalId}/reverse`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  // --- 4. Cashbook ---
  getCashbook: async (params?: PaginationParams & { start_date?: string; end_date?: string; account_id?: number }) => {
    return apiRequest<PagedResponse<CashbookTransaction> | CashbookTransaction[]>(
      `/api/v1/finance/cashbook${buildQueryString(params)}`,
    );
  },

  getCashbookSummary: async (params?: { period?: string; start_date?: string; end_date?: string }) => {
    return apiRequest<CashbookSummary>(
      `/api/v1/finance/cashbook/summary${buildQueryString(params)}`,
    );
  },

  // --- 5. Cash Flow ---
  getCashFlowForecast: async (params?: { forecast_months?: number }) => {
    return apiRequest<CashFlowForecast>(
      `/api/v1/finance/cash-flow/forecast${buildQueryString(params)}`,
    );
  },

  // --- 6. Invoices & Receivables ---
  listInvoices: async (params?: PaginationParams & { status?: string; client_id?: number; branch_id?: number }) => {
    return apiRequest<PagedResponse<FinanceInvoice> | FinanceInvoice[]>(
      `/api/v1/finance/invoices${buildQueryString(params)}`,
    );
  },

  listClients: async (params?: PaginationParams) => {
    const res = await apiRequest<any>(`/api/v1/clients/clients/${buildQueryString(params)}`);
    if (res.status === 404) {
      return apiRequest<any>(`/api/v1/clients/admin/clients${buildQueryString(params)}`);
    }
    return res;
  },

  listServices: async (params?: PaginationParams) => {
    return apiRequest<any>(`/api/v1/services${buildQueryString(params)}`);
  },


  createInvoice: async (payload: Record<string, unknown>) => {
    const subtotal = Number(payload.subtotal ?? payload.total_amount ?? payload.amount ?? 0);
    const clientId = Number(payload.client_id);
    const serviceId = Number(payload.service_id);
    const createdById = Number(payload.created_by_id);
    if (!Number.isFinite(clientId) || !Number.isFinite(serviceId)) {
      return { status: 400, error: 'Client and service are required before creating an invoice.' };
    }
    const issueDate = String(payload.issue_date || new Date().toISOString().split('T')[0]);
    const dueDate = String(payload.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    const notes = String(payload.notes ?? payload.description ?? '');
    if (!notes.trim()) {
      return { status: 400, error: 'Invoice description is required.' };
    }
    const items = Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items
      : [
          {
            description: notes,
            quantity: 1,
            unit_price: subtotal,
          },
        ];

    const invoicePayload = {
      ...payload,
      client_id: clientId,
      service_id: serviceId,
      ...(Number.isFinite(createdById) ? { created_by_id: createdById } : {}),
      subtotal: subtotal,
      issue_date: issueDate,
      due_date: dueDate,
      notes: notes,
      items: items,
    };

    const endpoints = [
      '/api/v1/invoices',
      '/api/v1/invoices/',
      '/api/v1/finance/invoices/',
      '/api/v1/estate-invoices/',
      '/api/v1/finance/invoices',
    ];

    let lastRes: any = null;
    for (const ep of endpoints) {
      const res = await apiRequest<FinanceInvoice>(ep, {
        method: 'POST',
        body: JSON.stringify(invoicePayload),
      });
      if (res.status !== 404 && res.status !== 405) {
        return res;
      }
      lastRes = res;
    }
    return lastRes || { error: 'Unable to create invoice on backend' };
  },


  getInvoice: async (invoiceId: number | string) => {
    return apiRequest<FinanceInvoice>(`/api/v1/finance/invoices/${invoiceId}`);
  },

  getInvoicesSummary: async () => {
    return apiRequest<{
      total_invoiced: number;
      total_paid: number;
      total_outstanding: number;
      invoices_count: number;
    }>('/api/v1/finance/invoices/summary');
  },

  listReceivables: async (params?: PaginationParams & { overdue_only?: boolean }) => {
    return apiRequest<PagedResponse<FinanceInvoice> | FinanceInvoice[]>(
      `/api/v1/finance/receivables${buildQueryString(params)}`,
    );
  },

  getReceivablesSummary: async () => {
    return apiRequest<ReceivablesSummary>('/api/v1/finance/receivables/summary');
  },

  sendReceivableReminder: async (invoiceId: number | string, payload?: { message?: string }) => {
    return apiRequest<{ success: boolean; message?: string }>(
      `/api/v1/finance/receivables/${invoiceId}/send-reminder`,
      {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      },
    );
  },

  // --- 7. Estate Property Invoices ---
  getEstateInvoiceFieldChoices: async () => {
    return apiRequest<EstateInvoiceFieldChoices>('/api/v1/estate-invoices/choices/fields');
  },

  listEstateInvoices: async (params?: PaginationParams & { status?: string; property_id?: number }) => {
    return apiRequest<PagedResponse<EstatePropertyInvoice> | EstatePropertyInvoice[]>(
      `/api/v1/estate-invoices/${buildQueryString(params)}`,
    );
  },

  createEstateInvoice: async (payload: Record<string, unknown>) => {
    return apiRequest<EstatePropertyInvoice>('/api/v1/estate-invoices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listEstateInvoicesPendingApprovals: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<EstatePropertyInvoice> | EstatePropertyInvoice[]>(
      `/api/v1/estate-invoices/pending-approvals${buildQueryString(params)}`,
    );
  },

  getEstateInvoice: async (invoiceId: number | string) => {
    return apiRequest<EstatePropertyInvoice>(`/api/v1/estate-invoices/${invoiceId}`);
  },

  updateEstateInvoice: async (invoiceId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<EstatePropertyInvoice>(`/api/v1/estate-invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteEstateInvoice: async (invoiceId: number | string) => {
    return apiRequest<{ success: boolean }>(`/api/v1/estate-invoices/${invoiceId}`, {
      method: 'DELETE',
    });
  },

  submitEstateInvoiceForApproval: async (invoiceId: number | string) => {
    return apiRequest<EstatePropertyInvoice>(
      `/api/v1/estate-invoices/${invoiceId}/submit-for-approval`,
      { method: 'POST' },
    );
  },

  decideEstateInvoiceApproval: async (
    invoiceId: number | string,
    step: number | string,
    payload: { action: 'approve' | 'reject'; comment?: string },
  ) => {
    return apiRequest<EstatePropertyInvoice>(
      `/api/v1/estate-invoices/${invoiceId}/approvals/${step}/decide`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  recordEstateInvoicePayment: async (invoiceId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<{ success: boolean; payment_id?: number }>(
      `/api/v1/estate-invoices/${invoiceId}/record-payment`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  // --- 8. Expenses ---
  listExpenses: async (params?: PaginationParams & { status?: string; category?: string; branch_id?: number }) => {
    return apiRequest<PagedResponse<FinanceExpense> | FinanceExpense[]>(
      `/api/v1/finance/expenses${buildQueryString(params)}`,
    );
  },

  createExpense: async (payload: FinanceExpenseCreatePayload) => {
    return apiRequest<FinanceExpense>('/api/v1/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getExpense: async (expenseId: number | string) => {
    return apiRequest<FinanceExpense>(`/api/v1/finance/expenses/${expenseId}`);
  },

  updateExpense: async (expenseId: number | string, payload: Partial<FinanceExpenseCreatePayload>) => {
    return apiRequest<FinanceExpense>(`/api/v1/finance/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteExpense: async (expenseId: number | string) => {
    return apiRequest<{ success: boolean }>(`/api/v1/finance/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  approveExpense: async (expenseId: number | string) => {
    return apiRequest<FinanceExpense>(`/api/v1/finance/expenses/${expenseId}/approve`, {
      method: 'POST',
    });
  },

  rejectExpense: async (expenseId: number | string, payload: { rejection_reason: string }) => {
    return apiRequest<FinanceExpense>(`/api/v1/finance/expenses/${expenseId}/reject`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  payExpense: async (expenseId: number | string, payload?: { payment_method?: string; reference?: string }) => {
    return apiRequest<FinanceExpense>(`/api/v1/finance/expenses/${expenseId}/pay`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  // --- 9. Vendors & Vendor Bills ---
  listVendors: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<FinanceVendor> | FinanceVendor[]>(
      `/api/v1/finance/vendors${buildQueryString(params)}`,
    );
  },

  createVendor: async (payload: { name: string; email?: string; phone?: string; address?: string; tax_id?: string; default_category?: string; status?: string; partner_id?: number }) => {
    return apiRequest<FinanceVendor>('/api/v1/finance/vendors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getVendor: async (vendorId: number | string) => {
    return apiRequest<FinanceVendor>(`/api/v1/finance/vendors/${vendorId}`);
  },

  updateVendor: async (vendorId: number | string, payload: Partial<FinanceVendor>) => {
    return apiRequest<FinanceVendor>(`/api/v1/finance/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deactivateVendor: async (vendorId: number | string) => {
    return apiRequest<{ success: boolean }>(`/api/v1/finance/vendors/${vendorId}/deactivate`, {
      method: 'POST',
    });
  },

  listVendorBills: async (params?: PaginationParams & { status?: string; vendor_id?: number }) => {
    return apiRequest<PagedResponse<VendorBill> | VendorBill[]>(
      `/api/v1/finance/vendor-bills${buildQueryString(params)}`,
    );
  },

  createVendorBill: async (payload: Record<string, unknown>) => {
    return apiRequest<VendorBill>('/api/v1/finance/vendor-bills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getVendorBillsSummary: async () => {
    return apiRequest<VendorBillSummary>('/api/v1/finance/vendor-bills/summary');
  },

  getVendorBill: async (billId: number | string) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}`);
  },

  updateVendorBill: async (billId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  approveVendorBill: async (billId: number | string) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}/approve`, {
      method: 'POST',
    });
  },

  rejectVendorBill: async (billId: number | string, payload?: { reason?: string }) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}/reject`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  payVendorBill: async (billId: number | string, payload?: Record<string, unknown>) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}/pay`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  voidVendorBill: async (billId: number | string, payload?: { reason?: string }) => {
    return apiRequest<VendorBill>(`/api/v1/finance/vendor-bills/${billId}/void`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  // --- 10. Petty Cash & Advances ---
  getPettyCashSummary: async () => {
    return apiRequest<PettyCashSummary>('/api/v1/finance/petty-cash/summary');
  },

  listPettyCashAdvances: async (params?: PaginationParams & { status?: string; employee_id?: number }) => {
    return apiRequest<PagedResponse<PettyCashAdvance> | PettyCashAdvance[]>(
      `/api/v1/finance/petty-cash/advances${buildQueryString(params)}`,
    );
  },

  createPettyCashAdvance: async (payload: { finance_account_id: number; purpose: string; amount_requested: number; due_date: string; requester_id?: number; custodian_id?: number; branch_id?: number; service_order_id?: number; notes?: string }) => {
    return apiRequest<PettyCashAdvance>('/api/v1/finance/petty-cash/advances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPettyCashAdvance: async (advanceId: number | string) => {
    return apiRequest<PettyCashAdvance>(`/api/v1/finance/petty-cash/advances/${advanceId}`);
  },

  updatePettyCashAdvance: async (advanceId: number | string, payload: Partial<PettyCashAdvance>) => {
    return apiRequest<PettyCashAdvance>(`/api/v1/finance/petty-cash/advances/${advanceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  approvePettyCashAdvance: async (advanceId: number | string) => {
    return apiRequest<PettyCashAdvance>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/approve`,
      { method: 'POST' },
    );
  },

  rejectPettyCashAdvance: async (advanceId: number | string, payload?: { reason?: string }) => {
    return apiRequest<PettyCashAdvance>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/reject`,
      {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      },
    );
  },

  issuePettyCashAdvance: async (advanceId: number | string) => {
    return apiRequest<PettyCashAdvance>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/issue`,
      { method: 'POST' },
    );
  },

  retirePettyCashAdvance: async (
    advanceId: number | string,
    payload: { amount_spent: number; amount_refunded?: number; notes?: string },
  ) => {
    return apiRequest<PettyCashAdvance>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/retire`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  cancelPettyCashAdvance: async (advanceId: number | string) => {
    return apiRequest<PettyCashAdvance>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/cancel`,
      { method: 'POST' },
    );
  },

  getPettyCashRetirementLines: async (advanceId: number | string) => {
    return apiRequest<Array<{ id: number; description: string; amount: number }>>(
      `/api/v1/finance/petty-cash/advances/${advanceId}/retirement-lines`,
    );
  },

  // --- 11. Wallets ---
  listWallets: async (params?: PaginationParams & { wallet_type?: string }) => {
    return apiRequest<PagedResponse<FinanceWallet> | FinanceWallet[]>(
      `/api/v1/finance/wallets${buildQueryString(params)}`,
    );
  },

  createWallet: async (payload: { client_id: number; name: string; wallet_type: string; service_order_id?: number; purpose?: string; status?: string }) => {
    return apiRequest<FinanceWallet>('/api/v1/finance/wallets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listServiceOrders: async (params?: PaginationParams) => {
    return apiRequest<any>(`/api/v1/orders${buildQueryString(params)}`);
  },

  getWallet: async (walletId: number | string) => {
    return apiRequest<FinanceWallet>(`/api/v1/finance/wallets/${walletId}`);
  },

  updateWallet: async (walletId: number | string, payload: Partial<FinanceWallet>) => {
    return apiRequest<FinanceWallet>(`/api/v1/finance/wallets/${walletId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  listWalletEntries: async (walletId: number | string, params?: PaginationParams) => {
    return apiRequest<PagedResponse<WalletEntry> | WalletEntry[]>(
      `/api/v1/finance/wallets/${walletId}/entries${buildQueryString(params)}`,
    );
  },

  createWalletEntry: async (
    walletId: number | string,
    payload: { entry_type: 'credit' | 'debit'; amount: number; description?: string; reference?: string },
  ) => {
    return apiRequest<WalletEntry>(`/api/v1/finance/wallets/${walletId}/entries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  voidWalletEntry: async (walletId: number | string, entryId: number | string) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/finance/wallets/${walletId}/entries/${entryId}/void`,
      { method: 'POST' },
    );
  },

  listGenericWalletTransactions: async (params?: PaginationParams & { user_id?: number }) => {
    return apiRequest<PagedResponse<GenericWalletTransaction> | GenericWalletTransaction[]>(
      `/api/v1/wallet/transactions/${buildQueryString(params)}`,
    );
  },

  getUserWalletBalance: async (userId: number | string) => {
    return apiRequest<{ user_id: number; balance: number; currency?: string }>(
      `/api/v1/wallet/balance/${userId}/`,
    );
  },

  // --- 12. Payroll ---
  listPayrollRuns: async (params?: PaginationParams & { status?: string }) => {
    return apiRequest<PagedResponse<PayrollRunItem> | PayrollRunItem[]>(
      `/api/v1/finance/payroll${buildQueryString(params)}`,
    );
  },

  createPayrollRun: async (payload: { period_month: number; period_year: number; scheduled_payment_date: string; branch_id?: number; notes?: string }) => {
    return apiRequest<PayrollRunItem>('/api/v1/finance/payroll', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}`);
  },

  updatePayrollRun: async (runId: number | string, payload: Partial<PayrollRunItem>) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  calculatePayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/calculate`, {
      method: 'POST',
    });
  },

  submitPayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/submit`, {
      method: 'POST',
    });
  },

  approvePayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/approve`, {
      method: 'POST',
    });
  },

  rejectPayrollRun: async (runId: number | string, payload?: { reason?: string }) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/reject`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  payPayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/pay`, {
      method: 'POST',
    });
  },

  cancelPayrollRun: async (runId: number | string) => {
    return apiRequest<PayrollRunItem>(`/api/v1/finance/payroll/${runId}/cancel`, {
      method: 'POST',
    });
  },

  updatePayrollLineManualItems: async (
    runId: number | string,
    lineId: number | string,
    payload: Record<string, unknown>,
  ) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/finance/payroll/${runId}/lines/${lineId}/manual-items`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    );
  },

  // --- 13. Commissions & Bonuses ---
  listCommissionRules: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<CommissionRule> | CommissionRule[]>(
      `/api/v1/finance/commission-rules${buildQueryString(params)}`,
    );
  },

  createCommissionRule: async (payload: { name: string; service_id: number; rate_percent: number; effective_from: string; branch_id?: number; minimum_verified_revenue?: number; effective_to?: string; notes?: string }) => {
    return apiRequest<CommissionRule>('/api/v1/finance/commission-rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCommissionRule: async (ruleId: number | string, payload: Partial<CommissionRule>) => {
    return apiRequest<CommissionRule>(`/api/v1/finance/commission-rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deactivateCommissionRule: async (ruleId: number | string) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/finance/commission-rules/${ruleId}/deactivate`,
      { method: 'POST' },
    );
  },

  listCommissions: async (params?: PaginationParams & { employee_id?: number; status?: string }) => {
    return apiRequest<PagedResponse<CommissionAward> | CommissionAward[]>(
      `/api/v1/finance/commissions${buildQueryString(params)}`,
    );
  },

  calculateCommissions: async (payload: { period: string }) => {
    return apiRequest<{ calculated_count: number; total_amount: number }>(
      '/api/v1/finance/commissions/calculate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getCommission: async (awardId: number | string) => {
    return apiRequest<CommissionAward>(`/api/v1/finance/commissions/${awardId}`);
  },

  approveCommission: async (awardId: number | string) => {
    return apiRequest<CommissionAward>(`/api/v1/finance/commissions/${awardId}/approve`, {
      method: 'POST',
    });
  },

  rejectCommission: async (awardId: number | string, payload?: { reason?: string }) => {
    return apiRequest<CommissionAward>(`/api/v1/finance/commissions/${awardId}/reject`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  awardBonus: async (payload: { employee_id: number; amount: number; payout_month: number; payout_year: number; reason: string; notes?: string }) => {
    return apiRequest<{ success: boolean; bonus_id?: number }>('/api/v1/finance/bonuses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- 14. Statutory & Tax ---
  getStatutorySummary: async () => {
    return apiRequest<StatutorySummary>('/api/v1/finance/statutory/summary');
  },

  listStatutoryObligations: async (params?: PaginationParams & { status?: string; obligation_type?: string }) => {
    return apiRequest<PagedResponse<StatutoryObligation> | StatutoryObligation[]>(
      `/api/v1/finance/statutory/obligations${buildQueryString(params)}`,
    );
  },

  createStatutoryObligation: async (payload: { obligation_type: string; period_label: string; period_start: string; period_end: string; basis: string; amount: number; due_date: string; basis_amount?: number; branch_id?: number; notes?: string }) => {
    return apiRequest<StatutoryObligation>('/api/v1/finance/statutory/obligations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateWhtObligations: async (payload: { period: string }) => {
    return apiRequest<{ generated_count: number; total_amount: number }>(
      '/api/v1/finance/statutory/generate/wht',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  generatePayrollStatutoryObligations: async (payload: { run_id?: number; period?: string }) => {
    return apiRequest<{ generated_count: number; total_amount: number }>(
      '/api/v1/finance/statutory/generate/payroll',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getStatutoryObligation: async (obligationId: number | string) => {
    return apiRequest<StatutoryObligation>(`/api/v1/finance/statutory/obligations/${obligationId}`);
  },

  updateStatutoryObligation: async (obligationId: number | string, payload: Partial<StatutoryObligation>) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  submitStatutoryObligation: async (obligationId: number | string) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}/submit`,
      { method: 'POST' },
    );
  },

  approveStatutoryObligation: async (obligationId: number | string) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}/approve`,
      { method: 'POST' },
    );
  },

  rejectStatutoryObligation: async (obligationId: number | string, payload?: { reason?: string }) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}/reject`,
      {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      },
    );
  },

  payStatutoryObligation: async (obligationId: number | string, payload?: Record<string, unknown>) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}/pay`,
      {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      },
    );
  },

  voidStatutoryObligation: async (obligationId: number | string) => {
    return apiRequest<StatutoryObligation>(
      `/api/v1/finance/statutory/obligations/${obligationId}/void`,
      { method: 'POST' },
    );
  },

  // --- 15. Fixed Assets ---
  listFixedAssetCategories: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<FixedAssetCategory> | FixedAssetCategory[]>(
      `/api/v1/finance/fixed-asset-categories${buildQueryString(params)}`,
    );
  },

  createFixedAssetCategory: async (payload: {
    code: string;
    name: string;
    description?: string;
    asset_ledger_account_id: number;
    accumulated_depreciation_ledger_account_id: number;
    depreciation_expense_ledger_account_id: number;
    default_useful_life_months: number;
    default_residual_value_percent?: number;
  }) => {
    return apiRequest<FixedAssetCategory>('/api/v1/finance/fixed-asset-categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getFixedAssetCategory: async (categoryId: number | string) => {
    return apiRequest<FixedAssetCategory>(`/api/v1/finance/fixed-asset-categories/${categoryId}`);
  },

  updateFixedAssetCategory: async (categoryId: number | string, payload: Partial<FixedAssetCategory>) => {
    return apiRequest<FixedAssetCategory>(
      `/api/v1/finance/fixed-asset-categories/${categoryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  deactivateFixedAssetCategory: async (categoryId: number | string) => {
    return apiRequest<{ success: boolean }>(
      `/api/v1/finance/fixed-asset-categories/${categoryId}/deactivate`,
      { method: 'POST' },
    );
  },

  listFixedAssets: async (params?: PaginationParams & { category_id?: number; status?: string }) => {
    return apiRequest<PagedResponse<FixedAsset> | FixedAsset[]>(
      `/api/v1/finance/fixed-assets${buildQueryString(params)}`,
    );
  },

  createFixedAsset: async (payload: Record<string, unknown>) => {
    return apiRequest<FixedAsset>('/api/v1/finance/fixed-assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getFixedAsset: async (assetId: number | string) => {
    return apiRequest<FixedAsset>(`/api/v1/finance/fixed-assets/${assetId}`);
  },

  updateFixedAsset: async (assetId: number | string, payload: Record<string, unknown>) => {
    return apiRequest<FixedAsset>(`/api/v1/finance/fixed-assets/${assetId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  capitalizeFixedAsset: async (assetId: number | string) => {
    return apiRequest<FixedAsset>(`/api/v1/finance/fixed-assets/${assetId}/capitalize`, {
      method: 'POST',
    });
  },

  depreciateFixedAsset: async (assetId: number | string) => {
    return apiRequest<FixedAsset>(`/api/v1/finance/fixed-assets/${assetId}/depreciate`, {
      method: 'POST',
    });
  },

  getFixedAssetDepreciationSchedule: async (assetId: number | string) => {
    return apiRequest<Array<{ year: number; depreciation_amount: number; net_book_value: number }>>(
      `/api/v1/finance/fixed-assets/${assetId}/depreciation-schedule`,
    );
  },

  disposeFixedAsset: async (assetId: number | string, payload: { proceeds: number; disposal_date?: string }) => {
    return apiRequest<FixedAsset>(`/api/v1/finance/fixed-assets/${assetId}/dispose`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- 16. Payments & Submissions ---
  listPaymentSubmissions: async (params?: PaginationParams & { status?: string }) => {
    return apiRequest<PagedResponse<PaymentSubmission> | PaymentSubmission[]>(
      `/api/v1/finance/payments/submissions${buildQueryString(params)}`,
    );
  },

  createPaymentSubmission: async (payload: Record<string, unknown>) => {
    const sanitizedPayload = {
      ...payload,
      proof_of_payment: typeof payload.proof_of_payment === 'string' && payload.proof_of_payment.trim()
        ? payload.proof_of_payment.trim()
        : 'N/A',
    };
    return apiRequest<PaymentSubmission>('/api/v1/finance/payments/submissions', {
      method: 'POST',
      body: JSON.stringify(sanitizedPayload),
    });
  },

  getPaymentSubmission: async (submissionId: number | string) => {
    return apiRequest<PaymentSubmission>(`/api/v1/finance/payments/submissions/${submissionId}`);
  },

  reviewPaymentSubmission: async (
    submissionId: number | string,
    payload: { action: 'verify' | 'reject'; notes?: string },
  ) => {
    return apiRequest<PaymentSubmission>(
      `/api/v1/finance/payments/submissions/${submissionId}/review`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  listConfirmedPayments: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<ConfirmedPayment> | ConfirmedPayment[]>(
      `/api/v1/finance/payments/confirmed${buildQueryString(params)}`,
    );
  },

  getConfirmedPayment: async (paymentId: number | string) => {
    return apiRequest<ConfirmedPayment>(`/api/v1/finance/payments/confirmed/${paymentId}`);
  },

  // --- 17. Service Order Profitability ---
  listServiceOrderProfitability: async (params?: PaginationParams) => {
    return apiRequest<PagedResponse<ServiceOrderProfitability> | ServiceOrderProfitability[]>(
      `/api/v1/finance/service-orders/profitability${buildQueryString(params)}`,
    );
  },

  getServiceOrderProfitabilitySummary: async () => {
    return apiRequest<ProfitabilitySummary>(
      '/api/v1/finance/service-orders/profitability/summary',
    );
  },

  getServiceOrderProfitability: async (orderId: number | string) => {
    return apiRequest<ServiceOrderProfitability>(
      `/api/v1/finance/service-orders/${orderId}/profitability`,
    );
  },

  listServiceOrderCosts: async (orderId: number | string) => {
    return apiRequest<Array<{ id: number; description: string; amount: number; cost_type?: string }>>(
      `/api/v1/finance/service-orders/${orderId}/costs`,
    );
  },

  listServiceOrderTransactions: async (orderId: number | string) => {
    return apiRequest<Array<{ id: number; date: string; amount: number; type: string }>>(
      `/api/v1/finance/service-orders/${orderId}/transactions`,
    );
  },

  // --- 18. Financial Reports ---
  getReportsCatalog: async () => {
    return apiRequest<ReportCatalogItem[]>('/api/v1/finance/reports/catalog');
  },

  getProfitAndLossReport: async (params?: { start_date?: string; end_date?: string }) => {
    return apiRequest<FinancialReportStatement>(
      `/api/v1/finance/reports/profit-and-loss${buildQueryString(params)}`,
    );
  },

  getBalanceSheetReport: async (params?: { as_of_date?: string }) => {
    return apiRequest<FinancialReportStatement>(
      `/api/v1/finance/reports/balance-sheet${buildQueryString(params)}`,
    );
  },

  getRevenueReport: async (params?: { start_date?: string; end_date?: string; branch_id?: number }) => {
    return apiRequest<FinancialReportStatement>(
      `/api/v1/finance/reports/revenue${buildQueryString(params)}`,
    );
  },

  getExpenseReport: async (params?: { start_date?: string; end_date?: string; category?: string }) => {
    return apiRequest<FinancialReportStatement>(
      `/api/v1/finance/reports/expenses${buildQueryString(params)}`,
    );
  },

  getPayablesAgeingReport: async () => {
    return apiRequest<FinancialReportStatement>('/api/v1/finance/reports/payables-ageing');
  },

  exportFinancialReport: async (params: { report_type: string; format?: 'csv' | 'pdf' | 'xlsx'; start_date?: string; end_date?: string }) => {
    return apiRequest<Blob | string>(
      `/api/v1/finance/reports/export${buildQueryString(params)}`,
    );
  },

  // --- 19. Audit & Exceptions ---
  listAuditLogs: async (params?: PaginationParams & { start_date?: string; end_date?: string }) => {
    return apiRequest<PagedResponse<FinanceAuditLog> | FinanceAuditLog[]>(
      `/api/v1/finance/audit${buildQueryString(params)}`,
    );
  },

  exportAuditLogs: async (params?: { start_date?: string; end_date?: string; format?: string }) => {
    return apiRequest<string | Blob>(
      `/api/v1/finance/audit/export${buildQueryString(params)}`,
    );
  },

  listExceptions: async (params?: PaginationParams & { severity?: string; is_resolved?: boolean }) => {
    return apiRequest<PagedResponse<FinanceException> | FinanceException[]>(
      `/api/v1/finance/exceptions${buildQueryString(params)}`,
    );
  },

  getExceptionsSummary: async () => {
    return apiRequest<FinanceExceptionSummary>('/api/v1/finance/exceptions/summary');
  },

  exportExceptions: async (params?: { is_resolved?: boolean; format?: string }) => {
    return apiRequest<string | Blob>(
      `/api/v1/finance/exceptions/export${buildQueryString(params)}`,
    );
  },

  // --- 20. Settings ---
  getSettings: async () => {
    return apiRequest<FinanceSettings>('/api/v1/finance/settings');
  },

  updateSettings: async (payload: Partial<FinanceSettings>) => {
    return apiRequest<FinanceSettings>('/api/v1/finance/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
