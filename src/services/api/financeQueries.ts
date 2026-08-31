import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  financeService,
  type FinanceAccountCreatePayload,
  type FinanceAccountUpdatePayload,
  type FinanceExpenseCreatePayload,
  type JournalCreatePayload,
  type PaginationParams,
} from './financeService';

export const financeQueryKeys = {
  commandCenter: ['finance', 'command-center'] as const,
  accounts: (params?: PaginationParams) => ['finance', 'accounts', params] as const,
  accountBalance: (id: number | string) => ['finance', 'accounts', id, 'balance'] as const,
  ledgerAccounts: (params?: PaginationParams) => ['finance', 'ledger-accounts', params] as const,
  generalLedger: (params?: Record<string, unknown>) => ['finance', 'general-ledger', params] as const,
  trialBalance: (params?: Record<string, unknown>) => ['finance', 'trial-balance', params] as const,
  journals: (params?: PaginationParams) => ['finance', 'journals', params] as const,
  journal: (id: number | string) => ['finance', 'journals', id] as const,
  cashbook: (params?: PaginationParams) => ['finance', 'cashbook', params] as const,
  cashbookSummary: (params?: Record<string, unknown>) => ['finance', 'cashbook-summary', params] as const,
  cashFlowForecast: (params?: Record<string, unknown>) => ['finance', 'cash-flow-forecast', params] as const,
  invoices: (params?: PaginationParams) => ['finance', 'invoices', params] as const,
  invoicesSummary: ['finance', 'invoices-summary'] as const,
  receivables: (params?: PaginationParams) => ['finance', 'receivables', params] as const,
  receivablesSummary: ['finance', 'receivables-summary'] as const,
  estateInvoices: (params?: PaginationParams) => ['finance', 'estate-invoices', params] as const,
  estateInvoiceChoices: ['finance', 'estate-invoices', 'choices'] as const,
  expenses: (params?: PaginationParams) => ['finance', 'expenses', params] as const,
  vendors: (params?: PaginationParams) => ['finance', 'vendors', params] as const,
  vendorBills: (params?: PaginationParams) => ['finance', 'vendor-bills', params] as const,
  vendorBillsSummary: ['finance', 'vendor-bills-summary'] as const,
  pettyCashSummary: ['finance', 'petty-cash-summary'] as const,
  pettyCashAdvances: (params?: PaginationParams) => ['finance', 'petty-cash-advances', params] as const,
  wallets: (params?: PaginationParams) => ['finance', 'wallets', params] as const,
  walletEntries: (id: number | string, params?: PaginationParams) =>
    ['finance', 'wallets', id, 'entries', params] as const,
  payrollRuns: (params?: PaginationParams) => ['finance', 'payroll-runs', params] as const,
  commissions: (params?: PaginationParams) => ['finance', 'commissions', params] as const,
  commissionRules: (params?: PaginationParams) => ['finance', 'commission-rules', params] as const,
  statutorySummary: ['finance', 'statutory-summary'] as const,
  statutoryObligations: (params?: PaginationParams) => ['finance', 'statutory-obligations', params] as const,
  fixedAssets: (params?: PaginationParams) => ['finance', 'fixed-assets', params] as const,
  fixedAssetCategories: (params?: PaginationParams) => ['finance', 'fixed-asset-categories', params] as const,
  paymentSubmissions: (params?: PaginationParams) => ['finance', 'payment-submissions', params] as const,
  confirmedPayments: (params?: PaginationParams) => ['finance', 'confirmed-payments', params] as const,
  serviceOrderProfitability: (params?: PaginationParams) =>
    ['finance', 'service-order-profitability', params] as const,
  profitabilitySummary: ['finance', 'profitability-summary'] as const,
  reportsCatalog: ['finance', 'reports-catalog'] as const,
  auditLogs: (params?: PaginationParams) => ['finance', 'audit-logs', params] as const,
  exceptions: (params?: PaginationParams) => ['finance', 'exceptions', params] as const,
  exceptionsSummary: ['finance', 'exceptions-summary'] as const,
  settings: ['finance', 'settings'] as const,
};

// --- REACT QUERY HOOKS ---

export function useCommandCenterMetrics() {
  return useQuery({
    queryKey: financeQueryKeys.commandCenter,
    queryFn: () => financeService.getCommandCenter(),
  });
}

export function useFinanceAccounts(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.accounts(params),
    queryFn: () => financeService.listAccounts(params),
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinanceAccountCreatePayload) => financeService.createAccount(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: FinanceAccountUpdatePayload }) =>
      financeService.updateAccount(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

export function useJournals(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.journals(params),
    queryFn: () => financeService.listJournals(params),
  });
}

export function useCreateJournalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JournalCreatePayload) => financeService.createJournal(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['finance', 'journals'] });
      void queryClient.invalidateQueries({ queryKey: ['finance', 'general-ledger'] });
      void queryClient.invalidateQueries({ queryKey: ['finance', 'trial-balance'] });
    },
  });
}

export function useCashbook(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.cashbook(params),
    queryFn: () => financeService.getCashbook(params),
  });
}

export function useInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.invoices(params),
    queryFn: () => financeService.listInvoices(params),
  });
}

export function useExpenses(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.expenses(params),
    queryFn: () => financeService.listExpenses(params),
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinanceExpenseCreatePayload) => financeService.createExpense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      void queryClient.invalidateQueries({ queryKey: financeQueryKeys.commandCenter });
    },
  });
}

export function useVendors(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.vendors(params),
    queryFn: () => financeService.listVendors(params),
  });
}

export function useVendorBills(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.vendorBills(params),
    queryFn: () => financeService.listVendorBills(params),
  });
}

export function usePettyCashAdvances(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.pettyCashAdvances(params),
    queryFn: () => financeService.listPettyCashAdvances(params),
  });
}

export function useWallets(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.wallets(params),
    queryFn: () => financeService.listWallets(params),
  });
}

export function usePayrollRuns(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.payrollRuns(params),
    queryFn: () => financeService.listPayrollRuns(params),
  });
}

export function useStatutoryObligations(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.statutoryObligations(params),
    queryFn: () => financeService.listStatutoryObligations(params),
  });
}

export function useFixedAssets(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.fixedAssets(params),
    queryFn: () => financeService.listFixedAssets(params),
  });
}

export function useServiceOrderProfitability(params?: PaginationParams) {
  return useQuery({
    queryKey: financeQueryKeys.serviceOrderProfitability(params),
    queryFn: () => financeService.listServiceOrderProfitability(params),
  });
}

export function useFinanceSettings() {
  return useQuery({
    queryKey: financeQueryKeys.settings,
    queryFn: () => financeService.getSettings(),
  });
}
