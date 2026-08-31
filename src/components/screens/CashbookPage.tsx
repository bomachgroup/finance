import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { extractApiItems } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';

export const CashbookPage: FC = () => {
  const { data: entriesRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.cashbook(),
    queryFn: () => financeService.getCashbook(),
  });

  const entries = extractApiItems<Record<string, any>>(entriesRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-text-2">{item.date || '—'}</span>,
    },
    {
      key: 'narration',
      header: 'Transaction Narration',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.narration || item.description || '—'}</div>
          <div className="text-[11px] text-text-3">{item.account_name || '—'}</div>
        </div>
      ),
    },

    {
      key: 'inflow',
      header: 'Inflow (Receipts)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          {item.inflow || item.type === 'inflow'
            ? `+₦${Number(item.inflow || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'outflow',
      header: 'Outflow (Payments)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          {item.outflow || item.type === 'outflow'
            ? `-₦${Number(item.outflow || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Closing Balance',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-navy">
          ₦{Number(item.balance || item.running_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Cashbook & Daily Balances</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Continuous record of all physical and electronic cash movements
        </p>
      </div>

      <Table
        columns={columns}
        data={entries}
        loading={isLoading}
        error={entriesRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No cashbook entries found"
        emptySubtitle="All verified inflows and disbursements will be logged chronologically into this register."
      />
    </div>
  );
};
