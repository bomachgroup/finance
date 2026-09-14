import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const PettyCashPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: advancesRes, isLoading: advancesLoading, refetch: refetchAdvances } = useQuery({
    queryKey: financeQueryKeys.pettyCashAdvances(),
    queryFn: () => financeService.listPettyCashAdvances(),
  });

  const advances = extractApiItems<Record<string, any>>(advancesRes?.data);
  const { data: accountsRes } = useQuery({ queryKey: financeQueryKeys.accounts(), queryFn: () => financeService.listAccounts() });
  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'reference',
      header: 'Voucher #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.reference || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'custodian_name',
      header: 'Custodian / Staff',
      render: (item) => <span className="font-semibold text-text">{item.custodian_name || '—'}</span>,
    },

    {
      key: 'amount_advanced',
      header: 'Advance Amount',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-navy">
          ₦{Number(item.amount_advanced || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Retirement Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        return (
          <span
            className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              s === 'retired'
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
        <h2 className="text-xl font-bold tracking-tight text-text">Petty Cash Management</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Imprest fund allocations, cash vouchers, and expense retirement reconciliation
        </p>
        </div>
        <Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New advance</Button>
      </div>

      <Table
        columns={columns}
        data={advances}
        loading={advancesLoading}
        error={advancesRes?.error}
        onRetry={() => void refetchAdvances()}
        emptyTitle="No active petty cash advances"
        emptySubtitle="Disburse cash floats for minor operational needs and monitor their timely retirement."
      />
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Petty Cash Advance"
        fields={[
          {
            name: 'finance_account_id',
            label: 'Finance account',
            type: 'select',
            required: true,
            options: accounts
              .filter((account) => account.id)
              .sort((a, b) => {
                const aIsCash = String(a.account_type || '').toLowerCase() === 'cash' ? 1 : 0;
                const bIsCash = String(b.account_type || '').toLowerCase() === 'cash' ? 1 : 0;
                return bIsCash - aIsCash;
              })
              .map((account) => {
                const type = formatDisplayLabel(account.account_type || account.type || 'account');
                const bal =
                  account.balance !== undefined || account.current_balance !== undefined
                    ? ` — ₦${Number(account.balance || account.current_balance || 0).toLocaleString('en-NG')}`
                    : '';
                return {
                  value: String(account.id),
                  label: `${String(account.name || account.display_name || account.id)} (${type})${bal}`,
                };
              }),
            helperText: 'Must be an active cash/disbursement account belonging to your branch.',
          },
          { name: 'purpose', label: 'Purpose', required: true, type: 'textarea', placeholder: 'Reason for cash float or requisition' },
          { name: 'amount_requested', label: 'Amount requested (₦)', required: true, type: 'number', placeholder: '0.00' },
          { name: 'due_date', label: 'Retirement due date', required: true, type: 'date' },
          { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional details or memo' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createPettyCashAdvance({
            finance_account_id: Number(values.finance_account_id),
            purpose: values.purpose,
            amount_requested: Number(values.amount_requested),
            due_date: values.due_date,
            notes: values.notes || undefined,
          });
          if (response.error) {
            if (response.error.includes('No FinanceAccount matches the given query')) {
              return {
                error: 'The selected account cannot disburse petty cash. Please ensure you choose an active Cash account in your branch.',
              };
            }
            return { error: response.error };
          }
          await queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash-advances'] });
        }}
      />
    </div>
  );
};
