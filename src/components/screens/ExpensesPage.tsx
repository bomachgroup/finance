import { useQuery } from '@tanstack/react-query';
import { useState, type FC } from 'react';
import { useShell } from '../../context/ShellContext';
import { useToast } from '../../context/ToastContext';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { Select } from '../shared/Select';
import { Table, type Column } from '../shared/Table';

export const ExpensesPage: FC = () => {
  const { openModal } = useShell();
  const { showToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { data: expensesRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.expenses({ category: categoryFilter || undefined }),
    queryFn: () => financeService.listExpenses({ category: categoryFilter || undefined }),
  });

  const expenses = extractApiItems<Record<string, any>>(expensesRes?.data);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await financeService.approveExpense(id);
      if (res.error) {
        showToast(`Approval failed: ${res.error}`, 'error');
      } else {
        showToast('Expense approved successfully', 'success');
        void refetch();
      }
    } catch (error) {
      showToast(`Approval failed: ${error instanceof Error ? error.message : 'Unexpected error'}`, 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => <span className="font-mono text-text-2">{item.date || '—'}</span>,
    },
    {
      key: 'beneficiary',
      header: 'Beneficiary & Purpose',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.beneficiary || '—'}</div>
          <div className="text-[11px] text-text-3">{item.purpose || item.description || '—'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2">
          {item.category || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          ₦{Number(item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Approval Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        const styles: Record<string, string> = {
          approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          rejected: 'bg-rose-50 text-rose-700 border-rose-200',
          pending: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        const styleClass = styles[s] || 'bg-surface-2 text-text-3 border-border';

        return (
          <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styleClass}`}>
            {formatDisplayLabel(item.status)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => {
        if (String(item.status || '').toLowerCase() === 'pending') {
          return (
            <Button size="sm" variant="outline" loading={approvingId === Number(item.id)} onClick={() => handleApprove(Number(item.id))}>
              Approve
            </Button>
          );
        }
        return <span className="text-text-3 text-[11px]">Processed</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">Expense Management</h2>
          <p className="text-xs text-text-3 mt-0.5">
            Log, verify, and audit all operating and capital expenditure vouchers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={categoryFilter}
            onChangeValue={setCategoryFilter}
            placeholder="All Categories"
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Logistics', label: 'Logistics' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Materials', label: 'Direct Materials' },
              { value: 'Legal', label: 'Legal & Compliance' },
            ]}
          />
          <Button variant="primary" icon="ti-receipt" onClick={() => openModal('new-expense')}>
            Record Expense
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={expenses}
        loading={isLoading}
        error={expensesRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No expense vouchers recorded"
        emptySubtitle="Click 'Record Expense' to create and submit an expense claim."
      />
    </div>
  );
};
