import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';

export const EstateFinancePage: FC = () => {
  const { data: invoicesRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.estateInvoices(),
    queryFn: () => financeService.listEstateInvoices(),
  });

  const invoices = extractApiItems<Record<string, any>>(invoicesRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'invoice_number',
      header: 'Estate Invoice #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.invoice_number || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'property_unit',
      header: 'Property Unit / Estate',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.property_unit || item.unit_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.estate_name || '—'}</div>
        </div>
      ),
    },
    {
      key: 'buyer_name',
      header: 'Purchaser / Client',
      render: (item) => <span className="font-semibold text-text">{item.buyer_name || item.client_name || '—'}</span>,
    },

    {
      key: 'total_amount',
      header: 'Invoice Amount',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.total_amount || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        return (
          <span
            className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              s === 'paid'
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
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Estate Property Invoices</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Real estate installment schedules, milestone billings, and deed allocations
        </p>
      </div>

      <Table
        columns={columns}
        data={invoices}
        loading={isLoading}
        error={invoicesRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No estate invoices found"
        emptySubtitle="Property sales installments and infrastructure levy billings will display here."
      />
    </div>
  );
};
