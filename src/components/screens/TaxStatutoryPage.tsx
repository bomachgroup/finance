import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const TaxStatutoryPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: obligationsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.statutoryObligations(),
    queryFn: () => financeService.listStatutoryObligations(),
  });

  const obligations = extractApiItems<Record<string, any>>(obligationsRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'tax_type',
      header: 'Tax / Obligation Type',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{formatDisplayLabel(item.tax_type || item.obligation_name)}</div>
          <div className="text-[11px] text-text-3">{item.statutory_body || '—'}</div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Assessment Period',
      render: (item) => <span className="font-mono text-text-2">{item.period || '—'}</span>,
    },

    {
      key: 'amount_due',
      header: 'Remittance Due',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-navy">
          ₦{Number(item.amount_due || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Filing Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        return (
          <span
            className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              s === 'filed' || s === 'paid'
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Tax & Statutory Obligations</h2>
        <p className="text-xs text-text-3 mt-0.5">
          FIRS / NRS tax compliance, PAYE payroll deductions, VAT returns, and pension remittances
        </p>
        </div>
        <Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New obligation</Button>
      </div>

      <Table
        columns={columns}
        data={obligations}
        loading={isLoading}
        error={obligationsRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No statutory obligations pending"
        emptySubtitle="Generated tax schedules and filing receipts will be logged here."
      />
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Statutory Obligation"
        fields={[
          { name: 'obligation_type', label: 'Obligation type', type: 'select', required: true, options: ['vat', 'wht', 'paye', 'cit', 'pension', 'nhf'].map((value) => ({ value, label: formatDisplayLabel(value).toUpperCase() })) },
          { name: 'period_label', label: 'Period label', required: true },
          { name: 'period_start', label: 'Period start', type: 'date', required: true },
          { name: 'period_end', label: 'Period end', type: 'date', required: true },
          { name: 'basis', label: 'Basis', required: true },
          { name: 'basis_amount', label: 'Basis amount', type: 'number' },
          { name: 'amount', label: 'Amount payable', type: 'number', required: true },
          { name: 'due_date', label: 'Due date', type: 'date', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createStatutoryObligation({ obligation_type: values.obligation_type, period_label: values.period_label, period_start: values.period_start, period_end: values.period_end, basis: values.basis, basis_amount: values.basis_amount ? Number(values.basis_amount) : undefined, amount: Number(values.amount), due_date: values.due_date, notes: values.notes || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory-obligations'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
