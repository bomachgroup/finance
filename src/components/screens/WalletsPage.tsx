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
  const getOrderClientId = (order: Record<string, any>): number | null => {
    const raw = order.client_id ?? order.customer_id ?? order.client?.id ?? order.owner_id;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const getOrderClientName = (order: Record<string, any>): string => {
    return (
      order.client_name ||
      order.customer_name ||
      order.client?.name ||
      order.client?.company_name ||
      [order.client?.first_name, order.client?.last_name].filter(Boolean).join(' ') ||
      ''
    );
  };

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
          {
            name: 'client_id',
            label: 'Client',
            type: 'select',
            required: true,
            options: clients
              .filter((client) => client.id)
              .map((client) => ({
                value: String(client.id),
                label: String(client.name || client.company_name || [client.first_name, client.last_name].filter(Boolean).join(' ') || `Client #${client.id}`),
              })),
          },
          {
            name: 'wallet_type',
            label: 'Wallet type',
            type: 'select',
            required: true,
            options: [
              { value: 'client', label: 'General Client Wallet' },
              { value: 'project', label: 'Project Wallet' },
              { value: 'property', label: 'Property Wallet' },
              { value: 'restricted_project', label: 'Restricted Project Wallet' },
            ],
            helperText: (values) =>
              values.wallet_type === 'client'
                ? 'General Client Wallets do not require a linked service order.'
                : 'Project / property wallets require a linked service order belonging to the selected client.',
          },
          {
            name: 'service_order_id',
            label: 'Linked service order',
            type: 'select',
            options: (values) => {
              const selectedClientId = values.client_id ? Number(values.client_id) : null;
              const filteredOrders = orders.filter((order) => {
                if (!order.id) return false;
                if (!selectedClientId) return true;
                const orderClientId = getOrderClientId(order);
                return orderClientId === null || orderClientId === selectedClientId;
              });

              return filteredOrders.map((order) => {
                const clientName = getOrderClientName(order);
                const suffix = clientName ? ` (${clientName})` : '';
                return {
                  value: String(order.id),
                  label: `${String(order.order_number || order.reference || `Order #${order.id}`)}${suffix}`,
                };
              });
            },
            helperText: (values) => {
              if (values.wallet_type === 'client') {
                return 'Optional: Leave unselected if this is a general-purpose wallet.';
              }
              return 'Required: Must be a service order belonging to the selected client.';
            },
          },
          { name: 'name', label: 'Wallet name', required: true, placeholder: 'e.g. Escrow Account or Site Petty' },
          { name: 'purpose', label: 'Purpose', type: 'textarea', placeholder: 'Brief explanation of how funds in this wallet will be used' },
        ]}
        onSubmit={async (values) => {
          const selectedClientId = Number(values.client_id);
          const selectedOrderId = values.service_order_id ? Number(values.service_order_id) : undefined;

          if (values.wallet_type !== 'client' && !selectedOrderId) {
            return { error: 'Select a linked service order for this wallet type.' };
          }

          if (selectedOrderId) {
            const linkedOrder = orders.find((o) => Number(o.id) === selectedOrderId);
            const orderClientId = linkedOrder ? getOrderClientId(linkedOrder) : null;
            if (orderClientId !== null && orderClientId !== selectedClientId) {
              const orderClientName = linkedOrder ? getOrderClientName(linkedOrder) : '';
              return {
                error: `Service order client mismatch: Order #${linkedOrder?.order_number || selectedOrderId} belongs to a different client${orderClientName ? ` (${orderClientName})` : ''}. The wallet client must match the service order client.`,
              };
            }
          }

          const response = await financeService.createWallet({
            client_id: selectedClientId,
            wallet_type: values.wallet_type,
            service_order_id: selectedOrderId,
            name: values.name,
            purpose: values.purpose || undefined,
          });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
