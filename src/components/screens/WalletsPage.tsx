import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const WalletsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: walletsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.wallets(),
    queryFn: () => financeService.listWallets(),
  });

  const wallets = extractApiItems<Record<string, any>>(walletsRes?.data);
  const { data: clientsRes } = useQuery({ queryKey: ['finance', 'clients'], queryFn: () => financeService.listClients() });
  const { data: ordersRes } = useQuery({ queryKey: ['finance', 'service-orders'], queryFn: () => financeService.listServiceOrders() });
  const clients = extractApiItems<Record<string, any>>(clientsRes?.data);
  const orders = extractApiItems<Record<string, any>>(ordersRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'name',
      header: 'Wallet Name / Purpose',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.name || item.wallet_name || '—'}</div>
          <div className="text-[11px] text-text-3 font-mono">{item.account_number || (item.id ? `#${item.id}` : '—')}</div>
        </div>
      ),
    },

    {
      key: 'balance',
      header: 'Available Balance',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-navy">
          ₦{Number(item.balance || item.current_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Wallets & Project Accounts</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Dedicated escrow, site petty balances, and specialized department sub-wallets
        </p>
        </div>
        <Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New wallet</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Table
            columns={columns}
          data={wallets}
          loading={isLoading}
          error={walletsRes?.error}
          onRetry={() => void refetch()}
            emptyTitle="No wallets provisioned yet"
            emptySubtitle="Sub-wallets enable strict cost-center tracking across projects and business branches."
          />
        </div>
      </div>
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Finance Wallet"
        fields={[
          { name: 'client_id', label: 'Client', type: 'select', required: true, options: clients.filter((client) => client.id).map((client) => ({ value: String(client.id), label: String(client.name || client.company_name || [client.first_name, client.last_name].filter(Boolean).join(' ') || client.id) })) },
          { name: 'wallet_type', label: 'Wallet type', type: 'select', required: true, options: [
            { value: 'client', label: 'General Client Wallet' },
            { value: 'project', label: 'Project Wallet' },
            { value: 'property', label: 'Property Wallet' },
            { value: 'restricted_project', label: 'Restricted Project Wallet' },
          ] },
          { name: 'service_order_id', label: 'Linked service order', type: 'select', options: orders.filter((order) => order.id).map((order) => ({ value: String(order.id), label: String(order.order_number || order.reference || `Order #${order.id}`) })) },
          { name: 'name', label: 'Wallet name', required: true },
          { name: 'purpose', label: 'Purpose', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          if (values.wallet_type !== 'client' && !values.service_order_id) {
            return { error: 'Select a linked service order for this wallet type' };
          }
          const response = await financeService.createWallet({ client_id: Number(values.client_id), wallet_type: values.wallet_type, service_order_id: values.service_order_id ? Number(values.service_order_id) : undefined, name: values.name, purpose: values.purpose || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
