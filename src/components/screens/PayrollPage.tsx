import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { Table, type Column } from '../shared/Table';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const PayrollPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: runsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.payrollRuns(),
    queryFn: () => financeService.listPayrollRuns(),
  });

  const runs = extractApiItems<Record<string, any>>(runsRes?.data);


  const columns: Column<Record<string, any>>[] = [
    {
      key: 'period',
      header: 'Pay Period',
      render: (item) => <span className="font-bold text-navy">{item.period || '—'}</span>,
    },

    {
      key: 'total_gross',
      header: 'Gross Payroll',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-text">
          ₦{Number(item.total_gross || item.gross_amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'total_net',
      header: 'Net Remittance',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          ₦{Number(item.total_net || item.net_amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
          {formatDisplayLabel(item.status)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">Payroll Runs & Remittance</h2>
          <p className="text-xs text-text-3 mt-0.5">
            Salary schedules, pension & PAYE tax deductions, and direct bank bulk payouts
          </p>
        </div>
        <Button variant="primary" icon="ti-users" onClick={() => setCreateOpen(true)}>
          New payroll run
        </Button>
      </div>

      <Table
        columns={columns}
        data={runs}
        loading={isLoading}
        error={runsRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No payroll runs executed yet"
        emptySubtitle="Click 'Calculate Monthly Batch' to generate this month's salary and tax deduction register."
      />
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Payroll Run"
        subtitle="Create a backend payroll period before calculation."
        fields={[
          { name: 'period_month', label: 'Period month', type: 'number', required: true, placeholder: '1-12' },
          { name: 'period_year', label: 'Period year', type: 'number', required: true },
          { name: 'scheduled_payment_date', label: 'Scheduled payment date', type: 'date', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createPayrollRun({ period_month: Number(values.period_month), period_year: Number(values.period_year), scheduled_payment_date: values.scheduled_payment_date, notes: values.notes || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'payroll-runs'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
