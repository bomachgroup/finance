import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { useToast } from '../../context/ToastContext';
import { extractApiItems } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const FixedAssetsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: assetsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.fixedAssets(),
    queryFn: () => financeService.listFixedAssets(),
  });

  const assets = extractApiItems<Record<string, any>>(assetsRes?.data);
  const { data: categoriesRes } = useQuery({ queryKey: financeQueryKeys.fixedAssetCategories(), queryFn: () => financeService.listFixedAssetCategories() });
  const { data: expensesRes } = useQuery({ queryKey: financeQueryKeys.expenses(), queryFn: () => financeService.listExpenses() });
  const { data: ledgerAccountsRes } = useQuery({ queryKey: financeQueryKeys.ledgerAccounts(), queryFn: () => financeService.listLedgerAccounts() });
  const categories = extractApiItems<Record<string, any>>(categoriesRes?.data);
  const expenses = extractApiItems<Record<string, any>>(expensesRes?.data);
  const ledgerAccounts = extractApiItems<Record<string, any>>(ledgerAccountsRes?.data);
  const capitalExpenses = expenses.filter(
    (item) => String(item.cost_type || '').toLowerCase() === 'capital_expenditure'
      && String(item.status || '').toLowerCase() === 'paid',
  );
  const assetAction = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'capitalize' | 'depreciate' }) => {
      const response = action === 'capitalize' ? await financeService.capitalizeFixedAsset(id) : await financeService.depreciateFixedAsset(id);
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: (_, variables) => {
      showToast(`Asset ${variables.action === 'capitalize' ? 'capitalized' : 'depreciated'} successfully`, 'success');
      void queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] });
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Asset action failed', 'error'),
  });

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'asset_tag',
      header: 'Asset Tag',
      render: (item) => <span className="font-mono font-bold text-navy">{item.asset_tag || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'name',
      header: 'Asset Description',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.name || item.asset_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.location || '—'}</div>
        </div>
      ),
    },

    {
      key: 'purchase_cost',
      header: 'Historical Cost',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.purchase_cost || item.cost || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'net_book_value',
      header: 'Net Book Value (NBV)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-navy">
          ₦{Number(item.net_book_value || item.current_value || item.purchase_cost || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (item) => item.id && String(item.status || '').toLowerCase() === 'draft' ? <Button size="sm" variant="outline" loading={assetAction.isPending} onClick={() => assetAction.mutate({ id: Number(item.id), action: 'capitalize' })}>Capitalize</Button> : item.id && ['capitalized', 'depreciating'].includes(String(item.status || '').toLowerCase()) ? <Button size="sm" variant="outline" loading={assetAction.isPending} onClick={() => assetAction.mutate({ id: Number(item.id), action: 'depreciate' })}>Depreciate</Button> : <span className="text-xs text-text-3">—</span>,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Fixed Assets Register</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Capital asset inventory, straight-line depreciation schedules, and salvage valuations
        </p>
        </div>
        <div className="flex gap-2"><Button variant="outline" icon="ti-category" onClick={() => setCategoryOpen(true)}>New category</Button><Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New asset</Button></div>
      </div>

      <Table
        columns={columns}
        data={assets}
        loading={isLoading}
        error={assetsRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No fixed assets cataloged"
        emptySubtitle="Registered capital equipment, vehicles, and company real estate will be tracked here."
      />
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Fixed Asset"
        fields={[
          { name: 'category_id', label: 'Asset category', type: 'select', required: true, options: categories.filter((item) => item.id).map((item) => ({ value: String(item.id), label: String(item.name || item.id) })) },
          { name: 'source_expense_id', label: 'Source expense', type: 'select', required: true, options: capitalExpenses.map((item) => ({ value: String(item.id), label: `${item.beneficiary || item.vendor || item.id} - ${item.amount || ''}` })) },
          { name: 'name', label: 'Asset name', required: true },
          { name: 'acquisition_date', label: 'Acquisition date', type: 'date', required: true },
          { name: 'acquisition_cost', label: 'Acquisition cost', type: 'number', required: true },
          { name: 'residual_value', label: 'Residual value', type: 'number' },
          { name: 'useful_life_months', label: 'Useful life (months)', type: 'number' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createFixedAsset({ category_id: Number(values.category_id), source_expense_id: Number(values.source_expense_id), name: values.name, acquisition_date: values.acquisition_date, acquisition_cost: Number(values.acquisition_cost), residual_value: values.residual_value ? Number(values.residual_value) : undefined, useful_life_months: values.useful_life_months ? Number(values.useful_life_months) : undefined, description: values.description || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] });
          return { error: response.error };
        }}
      />
      <CreateRecordModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        title="Create Asset Category"
        fields={[
          { name: 'code', label: 'Category code', required: true },
          { name: 'name', label: 'Category name', required: true },
          { name: 'asset_ledger_account_id', label: 'Asset ledger account', type: 'select', required: true, options: ledgerAccounts.filter((item) => item.id).map((item) => ({ value: String(item.id), label: `${item.code || item.id} - ${item.name || 'Ledger account'}` })) },
          { name: 'accumulated_depreciation_ledger_account_id', label: 'Accumulated depreciation account', type: 'select', required: true, options: ledgerAccounts.filter((item) => item.id).map((item) => ({ value: String(item.id), label: `${item.code || item.id} - ${item.name || 'Ledger account'}` })) },
          { name: 'depreciation_expense_ledger_account_id', label: 'Depreciation expense account', type: 'select', required: true, options: ledgerAccounts.filter((item) => item.id).map((item) => ({ value: String(item.id), label: `${item.code || item.id} - ${item.name || 'Ledger account'}` })) },
          { name: 'default_useful_life_months', label: 'Default useful life (months)', type: 'number', required: true },
          { name: 'default_residual_value_percent', label: 'Default residual value (%)', type: 'number' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createFixedAssetCategory({
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            asset_ledger_account_id: Number(values.asset_ledger_account_id),
            accumulated_depreciation_ledger_account_id: Number(values.accumulated_depreciation_ledger_account_id),
            depreciation_expense_ledger_account_id: Number(values.depreciation_expense_ledger_account_id),
            default_useful_life_months: Number(values.default_useful_life_months),
            default_residual_value_percent: values.default_residual_value_percent ? Number(values.default_residual_value_percent) : undefined,
          });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-asset-categories'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
