import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel, formatNumber } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';
import { extractApiItems as extractItems } from '../../data/helpers';

export const CommissionsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: commissionsRes, isLoading, refetch: refetchCommissions } = useQuery({
    queryKey: financeQueryKeys.commissions(),
    queryFn: () => financeService.listCommissions(),
  });

  const commissions = extractApiItems<Record<string, any>>(commissionsRes?.data);
  const { data: rulesRes, isLoading: rulesLoading, refetch: refetchRules } = useQuery({
    queryKey: financeQueryKeys.commissionRules(),
    queryFn: () => financeService.listCommissionRules(),
  });
  const rules = extractApiItems<Record<string, any>>(rulesRes?.data);
  const { data: servicesRes } = useQuery({ queryKey: ['finance', 'services'], queryFn: () => financeService.listServices() });
  const services = extractItems<Record<string, any>>(servicesRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'agent_name',
      header: 'Realtor / Sales Associate',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.agent_name || item.beneficiary_name || '—'}</div>
          <div className="text-[11px] text-text-3 font-mono">{item.deal_reference || (item.id ? `#${item.id}` : '—')}</div>
        </div>
      ),
    },

    {
      key: 'deal_value',
      header: 'Deal Value',
      align: 'right',
      render: (item) => (
        <span className="text-text-2 font-medium">
          ₦{Number(item.deal_value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'commission_amount',
      header: 'Earned Commission',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          ₦{Number(item.commission_amount || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payout Status',
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

  const ruleColumns: Column<Record<string, any>>[] = [
    {
      key: 'name',
      header: 'Rule',
      render: (item) => <span className="font-semibold text-text">{item.name || '—'}</span>,
    },
    {
      key: 'service',
      header: 'Service',
      render: (item) => <span className="text-text-2">{item.service_name || item.service?.name || item.service_id || '—'}</span>,
    },
    {
      key: 'rate_percent',
      header: 'Rate',
      align: 'right',
      render: (item) => {
        const rate = item.rate_percent ?? item.percentage_rate;
        return <span className="font-bold text-navy">{formatNumber(rate)}{rate !== undefined && rate !== null && rate !== '' ? '%' : ''}</span>;
      },
    },
    {
      key: 'effective_from',
      header: 'Effective from',
      render: (item) => <span className="text-text-2">{item.effective_from || '—'}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (item) => <span className="text-xs font-semibold uppercase text-emerald-700">{item.is_active === false ? 'Inactive' : 'Active'}</span>,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Commissions & Sales Incentives</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Automated commission tier calculations for property realtors, contractors, and partners
        </p>
        </div>
        <div className="flex gap-2"><Button variant="outline" icon="ti-gift" onClick={() => setBonusOpen(true)}>New bonus</Button><Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New rule</Button></div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text">Commission Rules</h3>
        <Table
          columns={ruleColumns}
          data={rules}
          loading={rulesLoading}
          error={rulesRes?.error}
          onRetry={() => void refetchRules()}
          emptyTitle="No commission rules found"
          emptySubtitle="Backend commission rules will appear here."
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text">Commission Claims & Bonus Awards</h3>
        <Table
          columns={columns}
          data={commissions}
          loading={isLoading}
          error={commissionsRes?.error}
          onRetry={() => void refetchCommissions()}
          emptyTitle="No commission claims found"
          emptySubtitle="Backend commission claims and bonus awards will appear here."
        />
      </div>
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Commission Rule"
        fields={[
          { name: 'name', label: 'Rule name', required: true },
          { name: 'service_id', label: 'Service', type: 'select', required: true, options: services.filter((service) => service.id).map((service) => ({ value: String(service.id), label: String(service.name || service.title || service.id) })) },
          { name: 'rate_percent', label: 'Rate (%)', type: 'number', required: true },
          { name: 'effective_from', label: 'Effective from', type: 'date', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createCommissionRule({ name: values.name, service_id: Number(values.service_id), rate_percent: Number(values.rate_percent), effective_from: values.effective_from, notes: values.notes || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'commission-rules'] });
          return { error: response.error };
        }}
      />
      <CreateRecordModal
        open={bonusOpen}
        onClose={() => setBonusOpen(false)}
        title="Create Bonus Award"
        fields={[
          { name: 'employee_id', label: 'Employee ID', type: 'number', required: true },
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'payout_month', label: 'Payout month', type: 'number', required: true },
          { name: 'payout_year', label: 'Payout year', type: 'number', required: true },
          { name: 'reason', label: 'Reason', type: 'textarea', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.awardBonus({ employee_id: Number(values.employee_id), amount: Number(values.amount), payout_month: Number(values.payout_month), payout_year: Number(values.payout_year), reason: values.reason, notes: values.notes || undefined } as never);
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'commissions'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
