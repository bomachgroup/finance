import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { extractApiItems, formatNumber } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';

export const ServiceOrdersPage: FC = () => {
  const { data: ordersRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.serviceOrderProfitability(),
    queryFn: () => financeService.listServiceOrderProfitability(),
  });

  const orders = extractApiItems<Record<string, any>>(ordersRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'order_number',
      header: 'Service Order #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.order_number || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'client_name',
      header: 'Client & Service',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.client_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.service_title || '—'}</div>
        </div>
      ),
    },

    {
      key: 'contract_value',
      header: 'Contract Value',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.contract_value || item.revenue || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'actual_cost',
      header: 'Direct Costs',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          ₦{Number(item.actual_cost || item.cost || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'margin_percentage',
      header: 'Gross Margin',
      align: 'right',
      render: (item) => {
        const rawMargin = item.margin_percentage;
        const margin = rawMargin === undefined || rawMargin === null || rawMargin === '' ? null : Number(rawMargin);
        return (
          <span className={`font-bold ${margin !== null && margin >= 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {formatNumber(margin)}{margin !== null ? '%' : ''}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Service Orders Profitability</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Job cost tracking, real-time gross profit margins, and project budget variances
        </p>
      </div>

      <Table
        columns={columns}
        data={orders}
        loading={isLoading}
        error={ordersRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No service orders analyzed"
        emptySubtitle="Project milestones and contract deliverables will appear here with margin calculations."
      />
    </div>
  );
};
