import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { extractApiItems } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Card } from '../shared/Card';
import { KCard } from '../shared/KCard';
import { SkeletonKpiGrid } from '../shared/Skeletons';
import { ErrorState } from '../shared/StatePanel';
import { Table, type Column } from '../shared/Table';

export const ReceivablesPage: FC = () => {
  const { data: agingRes, isLoading: agingLoading, refetch: refetchAging } = useQuery({
    queryKey: financeQueryKeys.receivablesSummary,
    queryFn: () => financeService.getReceivablesSummary(),
  });

  const { data: overdueRes, isLoading: overdueLoading, refetch: refetchOverdue } = useQuery({
    queryKey: financeQueryKeys.receivables({ overdue_only: true }),
    queryFn: () => financeService.listReceivables({ overdue_only: true }),
  });

  const aging = (agingRes?.data as Record<string, any>) || {};
  const overdueList = extractApiItems<Record<string, any>>(overdueRes?.data);

  const formatCurrency = (num: number | undefined) => {
    return typeof num === 'number' ? `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '—';
  };

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.invoice_number || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'client_name',
      header: 'Debtor / Account',
      render: (item) => <span className="font-semibold text-text">{item.client_name || '—'}</span>,
    },

    {
      key: 'balance_due',
      header: 'Outstanding Balance',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          {formatCurrency(item.balance_due || item.amount || item.total_amount)}
        </span>
      ),
    },
    {
      key: 'days_overdue',
      header: 'Overdue By',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 font-bold text-rose-700 text-[10px]">
          {item.days_overdue ? `${item.days_overdue} Days` : 'Overdue'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Receivables & Aging Schedule</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Track debtor aging buckets, overdue collections, and credit recovery
        </p>
      </div>

      {agingLoading ? (
        <SkeletonKpiGrid cards={4} />
      ) : agingRes?.error ? (
        <ErrorState message={agingRes.error} onRetry={() => void refetchAging()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KCard
            label="Current (0 - 30 Days)"
            value={formatCurrency(aging.current)}
            color="green"
            subtext="Backend ageing data"
          />
          <KCard
            label="Past Due (31 - 60 Days)"
            value={formatCurrency(aging.days_31_60)}
            color="gold"
            subtext="Backend ageing data"
          />
          <KCard
            label="Delinquent (61 - 90 Days)"
            value={formatCurrency(aging.days_61_90)}
            color="red"
            subtext="Backend ageing data"
          />
          <KCard
            label="Doubtful (90+ Days)"
            value={formatCurrency(aging.over_90_days)}
            color="purple"
            subtext="Backend ageing data"
          />
        </div>
      )}

      <Card title="Overdue Invoices Action Register" subtitle="Immediate collection focus list">
        <Table
          columns={columns}
          data={overdueList}
          loading={overdueLoading}
          error={overdueRes?.error}
          onRetry={() => void refetchOverdue()}
          emptyTitle="No overdue receivables!"
          emptySubtitle="All client accounts are currently settled or within active payment grace terms."
        />
      </Card>
    </div>
  );
};
