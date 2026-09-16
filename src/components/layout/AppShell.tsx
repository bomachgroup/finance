import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { Suspense, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShell } from '../../context/ShellContext';
import { useToast } from '../../context/ToastContext';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { screenTitleFromPath } from '../../navigation';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { LoginScreen } from '../LoginScreen';
import { AppIcon } from '../shared/AppIcon';
import { Button } from '../shared/Button';
import { ModalDialog } from '../shared/ModalDialog';
import { SkeletonCard, SkeletonKpiGrid, SkeletonTable } from '../shared/Skeletons';
import { NoPermissionPage } from './NoPermissionPage';
import { Sidebar } from './Sidebar';


function AppRouteSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <SkeletonKpiGrid cards={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonTable rows={6} columns={5} />
        </div>
        <div className="space-y-6">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-2" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-2" />
            <div className="h-2.5 w-40 animate-pulse rounded-full bg-surface-2" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <div className="h-10 animate-pulse rounded-xl bg-surface-2" />
          <div className="h-10 animate-pulse rounded-xl bg-surface-2" />
          <div className="h-10 animate-pulse rounded-xl bg-navy/20" />
        </div>
      </div>
    </div>
  );
}

export const AppShell: FC<{ children?: ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading, hasPermission, getFirstAccessibleScreen } = useAuth();
  const { activeModal, closeModal, setMobileOpen } = useShell();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);


  const currentScreen = location.pathname.replace(/^\//, '') || 'dashboard';
  const canAccess = hasPermission(currentScreen, 'view');

  // Query invoices and accounts for linking submissions
  const { data: invoicesRes } = useQuery({
    queryKey: financeQueryKeys.invoices({ limit: 50 }),
    queryFn: () => financeService.listInvoices({ limit: 50 }),
  });
  const invoices = extractApiItems<Record<string, any>>(invoicesRes?.data);

  const { data: accountsRes } = useQuery({
    queryKey: financeQueryKeys.accounts(),
    queryFn: () => financeService.listAccounts(),
  });
  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);

  // Form State for Quick Action Modals
  const [submitting, setSubmitting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    cost_type: 'operating_expense',
    finance_account_id: '',
    amount: '',
    beneficiary: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    finance_account_id: '',
    amount: '',
    payment_reference: '',
    payment_method: 'bank_transfer',
    client_name: '',
    payment_date: new Date().toISOString().split('T')[0],
    proof_of_payment: '',
  });

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const isEmbed =
    typeof window !== 'undefined' &&
    (window.self !== window.top ||
      searchParams.get('embed') === 'true' ||
      searchParams.has('token') ||
      searchParams.has('access_token'));

  const hideSidebar = searchParams.get('hideSidebar') === 'true';
  const hideTopbar = searchParams.get('hideTopbar') === 'true';

  useEffect(() => {
    document.title = `${screenTitleFromPath(location.pathname)} - Bomach Finance OS`;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (isLoading && !isEmbed) {
    return <AuthLoadingSkeleton />;
  }

  if (!isLoggedIn && !isEmbed) {
    return <LoginScreen />;
  }

  const handleCreateExpense = async () => {
    if (!expenseForm.finance_account_id) {
      showToast('Please select a finance account', 'error');
      return;
    }
    if (!expenseForm.category?.trim()) {
      showToast('Please specify an expense category', 'error');
      return;
    }
    if (!expenseForm.beneficiary?.trim()) {
      showToast('Please enter the beneficiary name', 'error');
      return;
    }
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      showToast('Please enter a valid expense amount', 'error');
      return;
    }
    if (!expenseForm.purpose?.trim()) {
      showToast('Please provide a description or purpose for the expenditure', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await financeService.createExpense({
        date: expenseForm.date,
        category: expenseForm.category,
        cost_type: expenseForm.cost_type,
        finance_account_id: Number(expenseForm.finance_account_id),
        amount: Number(expenseForm.amount),
        beneficiary: expenseForm.beneficiary,
        description: expenseForm.purpose,
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Expense recorded successfully', 'success');
        void queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
        void queryClient.invalidateQueries({ queryKey: financeQueryKeys.commandCenter });
        closeModal();
        setExpenseForm({
          category: '',
          cost_type: 'operating_expense',
          finance_account_id: '',
          amount: '',
          beneficiary: '',
          purpose: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.invoice_id || !paymentForm.finance_account_id) {
      showToast('Select an invoice and target finance account before recording payment', 'error');
      return;
    }

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      showToast('Please specify a valid payment amount', 'error');
      return;
    }

    if (!paymentForm.payment_reference?.trim()) {
      showToast('Please enter a bank reference or payment narration', 'error');
      return;
    }

    if (!paymentForm.payment_date) {
      showToast('Please specify the payment date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await financeService.createPaymentSubmission({
        invoice_id: Number(paymentForm.invoice_id),
        finance_account_id: Number(paymentForm.finance_account_id),
        amount: Number(paymentForm.amount),
        transaction_reference: paymentForm.payment_reference.trim(),
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        proof_of_payment: paymentForm.proof_of_payment?.trim() || 'N/A',
        notes: paymentForm.client_name ? `Client / depositor: ${paymentForm.client_name.trim()}` : undefined,
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Payment recorded successfully', 'success');
        void queryClient.invalidateQueries({ queryKey: ['finance', 'payment-submissions'] });
        void queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
        void queryClient.invalidateQueries({ queryKey: financeQueryKeys.commandCenter });
        closeModal();
        setPaymentForm({
          invoice_id: '',
          finance_account_id: '',
          amount: '',
          payment_reference: '',
          payment_method: 'bank_transfer',
          client_name: '',
          payment_date: new Date().toISOString().split('T')[0],
          proof_of_payment: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text antialiased">

      {/* Sidebar */}
      {!hideSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Header (Hidden on Desktop or when hideTopbar) */}
        {!hideTopbar && (
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5 md:hidden">
            <div className="font-bold text-sm text-text">{screenTitleFromPath(location.pathname)}</div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-text-3"
              aria-label="Open navigation"
            >
              <AppIcon name="hamberger-menu" size={18} />
            </button>
          </div>
        )}

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {!canAccess ? (
            getFirstAccessibleScreen() !== currentScreen &&
            hasPermission(getFirstAccessibleScreen(), 'view') ? (
              <Navigate to="/$screenId" params={{ screenId: getFirstAccessibleScreen() }} replace />
            ) : (
              <NoPermissionPage screen={currentScreen} />
            )
          ) : (
            <Suspense fallback={<AppRouteSkeleton />}>
              {children || <Outlet />}
            </Suspense>
          )}
        </main>
      </div>


      {/* Quick Action: New Expense Modal */}
      <ModalDialog
        isOpen={activeModal === 'new-expense' || activeModal === 'quick-expense'}
        onClose={closeModal}
        title="Record New Expense"
        subtitle="Submit an expense for verification and approval"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleCreateExpense}>
              Submit Expense
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                value={expenseForm.cost_type}
                onChange={(e) => setExpenseForm((p) => ({ ...p, cost_type: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="operating_expense">Operating Expense</option>
                <option value="capital_expenditure">Capital Expenditure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Expense category"
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Finance Account <span className="text-red-500">*</span>
              </label>
              <select
                value={expenseForm.finance_account_id}
                onChange={(e) => setExpenseForm((p) => ({ ...p, finance_account_id: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="">Select account</option>
                {accounts.map((account: any) => (
                  <option key={account.id} value={account.id}>
                    {account.display_name || account.name || account.account_name || `Account ${account.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Beneficiary Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={expenseForm.beneficiary}
              onChange={(e) => setExpenseForm((p) => ({ ...p, beneficiary: e.target.value }))}
              placeholder="Beneficiary name"
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Amount (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Purpose / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={expenseForm.purpose}
              onChange={(e) => setExpenseForm((p) => ({ ...p, purpose: e.target.value }))}
              rows={3}
              placeholder="Provide a clear description of the expenditure..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>
      </ModalDialog>

      {/* Quick Action: Record Payment Modal */}
      <ModalDialog
        isOpen={activeModal === 'record-payment'}
        onClose={closeModal}
        title="Record Payment Submission"
        subtitle="Log an inbound bank transfer or payment receipt"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleRecordPayment}>
              Record Submission
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Invoice Linked <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentForm.invoice_id}
                onChange={(e) => setPaymentForm((p) => ({ ...p, invoice_id: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="">Select invoice</option>
                {invoices.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number || `INV-${inv.id}`} ({inv.client_name || 'Client'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Target Account <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentForm.finance_account_id}
                onChange={(e) => setPaymentForm((p) => ({ ...p, finance_account_id: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="">Select account</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name || acc.account_name || `Account ${acc.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Client / Depositor Name <span className="text-text-3 font-normal text-[11px]">(optional)</span>
            </label>
            <input
              type="text"
              value={paymentForm.client_name}
              onChange={(e) => setPaymentForm((p) => ({ ...p, client_name: e.target.value }))}
              placeholder="e.g. Chief Emeka Nnamdi"
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="bank_transfer">{formatDisplayLabel('bank_transfer')} (NIBSS)</option>
                <option value="pos">{formatDisplayLabel('pos')} Terminal</option>
                <option value="cheque">{formatDisplayLabel('cheque')} Deposit</option>
                <option value="direct_debit">{formatDisplayLabel('direct_debit')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Bank Reference / Narration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paymentForm.payment_reference}
              onChange={(e) => setPaymentForm((p) => ({ ...p, payment_reference: e.target.value }))}
              placeholder="e.g. REF-20260821-9842"
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))} className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Proof of Payment URL <span className="text-text-3 font-normal text-[11px]">(optional)</span>
              </label>
              <input type="url" value={paymentForm.proof_of_payment} onChange={(e) => setPaymentForm((p) => ({ ...p, proof_of_payment: e.target.value }))} placeholder="https://..." className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy" />
            </div>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};
