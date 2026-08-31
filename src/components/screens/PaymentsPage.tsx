import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { Table, type Column } from '../shared/Table';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const PaymentsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissionsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.paymentSubmissions(),
    queryFn: () => financeService.listPaymentSubmissions(),
  });

  const submissions = extractApiItems<Record<string, any>>(submissionsRes?.data);
  const { data: invoicesRes } = useQuery({ queryKey: financeQueryKeys.invoices(), queryFn: () => financeService.listInvoices() });
  const { data: accountsRes } = useQuery({ queryKey: financeQueryKeys.accounts(), queryFn: () => financeService.listAccounts() });
  const invoices = extractApiItems<Record<string, any>>(invoicesRes?.data);
  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'payment_reference',
      header: 'Reference',
      render: (item) => (
        <span className="font-mono font-bold text-navy">{item.payment_reference || (item.id ? `#${item.id}` : '—')}</span>
      ),
    },
    {
      key: 'client_name',
      header: 'Client / Depositor',
      render: (item) => <span className="font-semibold text-text">{item.client_name || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          ₦{Number(item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'payment_method',
      header: 'Channel',
      render: (item) => (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2 uppercase">
          {formatDisplayLabel(item.payment_method)}
        </span>
      ),
    },

    {
      key: 'status',
      header: 'Verification Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        const isVerified = s === 'confirmed' || s === 'verified';
        return (
          <span
            className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isVerified
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {formatDisplayLabel(item.status)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">Payments & Submissions</h2>
          <p className="text-xs text-text-3 mt-0.5">
            Audit inbound bank alerts, reconcile deposit slips, and verify receipts
          </p>
        </div>
        <Button variant="primary" icon="ti-cash" onClick={() => setCreateOpen(true)}>
          Record Payment
        </Button>
      </div>

      <Table
        columns={columns}
        data={submissions}
        loading={isLoading}
        error={submissionsRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No payment submissions found"
        emptySubtitle="Record customer deposit slips and incoming bank remittances to start verifying collections."
      />
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Payment Submission"
        fields={[
          { name: 'invoice_id', label: 'Invoice', type: 'select', required: true, options: invoices.filter((invoice) => invoice.id).map((invoice) => ({ value: String(invoice.id), label: String(invoice.invoice_number || invoice.number || invoice.id) })) },
          { name: 'finance_account_id', label: 'Finance account', type: 'select', required: true, options: accounts.filter((account) => account.id).map((account) => ({ value: String(account.id), label: String(account.name || account.display_name || account.id) })) },
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'payment_method', label: 'Payment method', type: 'select', required: true, options: ['bank_transfer', 'pos', 'cheque', 'direct_debit'].map((value) => ({ value, label: formatDisplayLabel(value) })) },
          { name: 'payment_date', label: 'Payment date', type: 'date', required: true },
          { name: 'transaction_reference', label: 'Transaction reference', required: true },
          { name: 'proof_of_payment', label: 'Proof of payment URL', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createPaymentSubmission({ invoice_id: Number(values.invoice_id), finance_account_id: Number(values.finance_account_id), amount: Number(values.amount), payment_method: values.payment_method, payment_date: values.payment_date, transaction_reference: values.transaction_reference, proof_of_payment: values.proof_of_payment, notes: values.notes || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'payment-submissions'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
