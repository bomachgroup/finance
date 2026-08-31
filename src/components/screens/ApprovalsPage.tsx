import { useQuery } from '@tanstack/react-query';
import { useState, type FC } from 'react';
import { useToast } from '../../context/ToastContext';
import { extractApiItems } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { ModalDialog } from '../shared/ModalDialog';
import { Table, type Column } from '../shared/Table';

export const ApprovalsPage: FC = () => {
  const { showToast } = useToast();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);

  const { data: expensesRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.expenses({ status: 'pending' }),
    queryFn: () => financeService.listExpenses({ status: 'pending' }),
  });

  const pendingExpenses = extractApiItems<Record<string, any>>(expensesRes?.data);

  const handleApprove = async (id: number) => {
    setProcessing({ id, action: 'approve' });
    try {
      const res = await financeService.approveExpense(id);
      if (res.error) {
        showToast(`Approval failed: ${res.error}`, 'error');
      } else {
        showToast('Approved expense voucher', 'success');
        void refetch();
      }
    } catch (error) {
      showToast(`Approval failed: ${error instanceof Error ? error.message : 'Unexpected error'}`, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (rejectId === null || !rejectReason.trim()) {
      showToast('A rejection reason is required', 'error');
      return;
    }

    const id = rejectId;
    setProcessing({ id, action: 'reject' });
    try {
      const res = await financeService.rejectExpense(id, { rejection_reason: rejectReason.trim() });
      if (res.error) {
        showToast(`Rejection failed: ${res.error}`, 'error');
      } else {
        showToast('Expense rejected', 'info');
        setRejectId(null);
        setRejectReason('');
        void refetch();
      }
    } catch (error) {
      showToast(`Rejection failed: ${error instanceof Error ? error.message : 'Unexpected error'}`, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'date',
      header: 'Submission Date',
      render: (item) => <span className="font-mono text-text-2">{item.date || '—'}</span>,
    },
    {
      key: 'beneficiary',
      header: 'Payee / Purpose',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.beneficiary || '—'}</div>
          <div className="text-[11px] text-text-3">{item.purpose || item.description || '—'}</div>
        </div>
      ),
    },

    {
      key: 'amount',
      header: 'Amount Requested',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          ₦{Number(item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Decision',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => { setRejectId(Number(item.id)); setRejectReason(''); }}
            loading={processing?.id === Number(item.id) && processing.action === 'reject'}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => void handleApprove(Number(item.id))}
            loading={processing?.id === Number(item.id) && processing.action === 'approve'}
          >
            Approve & Sign
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Finance Approvals Queue</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Executive authorization dashboard for payment requisitions and budget disbursements
        </p>
      </div>

      <Table
        columns={columns}
        data={pendingExpenses}
        loading={isLoading}
        error={expensesRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="All caught up!"
        emptySubtitle="There are currently no pending financial approvals awaiting your signature."
      />

      <ModalDialog
        open={rejectId !== null}
        onClose={() => { if (!processing) { setRejectId(null); setRejectReason(''); } }}
        title="Reject expense voucher"
        subtitle="Provide the reason that will be recorded with this decision."
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setRejectId(null); setRejectReason(''); }} disabled={processing !== null}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleReject()} loading={processing?.action === 'reject'} disabled={!rejectReason.trim()}>
              Confirm rejection
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-text" htmlFor="rejection-reason">
          Rejection reason
        </label>
        <textarea
          id="rejection-reason"
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="Explain why this voucher is being rejected"
          rows={4}
          className="mt-2 w-full rounded-xl border border-border-2 bg-surface px-3 py-2.5 text-sm text-text outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
          disabled={processing !== null}
        />
      </ModalDialog>
    </div>
  );
};
