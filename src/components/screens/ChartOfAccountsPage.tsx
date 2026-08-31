import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const ChartOfAccountsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: accountsRes, isLoading, refetch: refetchAccounts } = useQuery({
    queryKey: financeQueryKeys.accounts(),
    queryFn: () => financeService.listAccounts(),
  });
  const { data: ledgerRes, isLoading: ledgerLoading, refetch: refetchLedger } = useQuery({
    queryKey: financeQueryKeys.ledgerAccounts(),
    queryFn: () => financeService.listLedgerAccounts(),
  });

  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);
  const ledgerAccounts = extractApiItems<Record<string, any>>(ledgerRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'code',
      header: 'Account Code',
      render: (item) => <span className="font-mono font-bold text-navy">{item.code || item.account_code || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'name',
      header: 'Account Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.name || item.account_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.description || '—'}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category / Class',
      render: (item) => (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2 uppercase">
          {formatDisplayLabel(item.type || item.account_type)}
        </span>
      ),
    },

    {
      key: 'current_balance',
      header: 'Balance',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.current_balance || item.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
          {item.is_active !== false ? 'Active' : 'Archived'}
        </span>
      ),
    },
  ];

  const ledgerColumns: Column<Record<string, any>>[] = [
    { key: 'code', header: 'Ledger Code', render: (item) => <span className="font-mono font-bold text-navy">{item.code || '—'}</span> },
    { key: 'name', header: 'Ledger Account', render: (item) => <span className="font-semibold text-text">{item.name || '—'}</span> },
    { key: 'account_type', header: 'Type', render: (item) => <span className="uppercase text-xs text-text-2">{formatDisplayLabel(item.account_type)}</span> },
    { key: 'normal_balance', header: 'Normal Balance', render: (item) => <span className="uppercase text-xs text-text-2">{formatDisplayLabel(item.normal_balance)}</span> },
    { key: 'is_active', header: 'Status', align: 'center', render: (item) => <span className="text-xs font-semibold text-emerald-700">{item.is_active === false ? 'Archived' : 'Active'}</span> },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Chart of Accounts & General Ledger</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Hierarchical ledger structure across Assets, Liabilities, Equity, Revenue, and Expenses
        </p>
        </div>
        <div className="flex gap-2"><Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New account</Button><Button variant="outline" icon="ti-list-tree" onClick={() => setLedgerOpen(true)}>New ledger account</Button></div>
      </div>

      <Table
        columns={columns}
        data={accounts}
        loading={isLoading}
        error={accountsRes?.error}
        onRetry={() => void refetchAccounts()}
        emptyTitle="No accounts found in ledger"
        emptySubtitle="Standard chart of accounts will be mapped to financial statements."
      />
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text">General Ledger Accounts</h3>
        <Table columns={ledgerColumns} data={ledgerAccounts} loading={ledgerLoading} error={ledgerRes?.error} onRetry={() => void refetchLedger()} emptyTitle="No ledger accounts found" emptySubtitle="Postable ledger accounts returned by the Finance API will appear here." />
      </div>
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Finance Account"
        subtitle="Add an account to the backend chart of accounts."
        fields={[
          { name: 'display_name', label: 'Account name', required: true },
          { name: 'account_type', label: 'Account type', type: 'select', required: true, options: [{ value: 'bank', label: 'Bank' }, { value: 'cash', label: 'Cash' }, { value: 'mobile_money', label: 'Mobile money' }] },
          { name: 'bank_name', label: 'Bank name', required: true },
          { name: 'account_number', label: 'Account number', required: true },
          { name: 'account_name', label: 'Account holder name', required: true },
          { name: 'currency', label: 'Currency', placeholder: 'NGN' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createAccount({
            display_name: values.display_name,
            account_type: values.account_type,
            bank_name: values.bank_name,
            account_number: values.account_number,
            account_name: values.account_name,
            currency: values.currency || undefined,
            description: values.description || undefined,
          });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
          return { error: response.error };
        }}
      />
      <CreateRecordModal
        open={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        title="Create Ledger Account"
        subtitle="Add a postable account to the general ledger."
        fields={[
          { name: 'code', label: 'Account code', required: true },
          { name: 'name', label: 'Account name', required: true },
          { name: 'account_type', label: 'Account type', type: 'select', required: true, options: ['asset', 'liability', 'equity', 'revenue', 'expense'].map((value) => ({ value, label: formatDisplayLabel(value) })) },
          { name: 'normal_balance', label: 'Normal balance', type: 'select', required: true, options: ['debit', 'credit'].map((value) => ({ value, label: formatDisplayLabel(value) })) },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createLedgerAccount({ code: values.code, name: values.name, account_type: values.account_type, normal_balance: values.normal_balance, description: values.description || undefined });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'ledger-accounts'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
