import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { useToast } from '../../context/ToastContext';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';
import { ModalDialog } from '../shared/ModalDialog';

export const JournalsPage: FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reverseJournalId, setReverseJournalId] = useState<number | null>(null);
  const [reverseReason, setReverseReason] = useState('');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: journalsRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.journals(),
    queryFn: () => financeService.listJournals(),
  });

  const journals = extractApiItems<Record<string, any>>(journalsRes?.data);
  const { data: accountsRes } = useQuery({ queryKey: financeQueryKeys.ledgerAccounts(), queryFn: () => financeService.listLedgerAccounts() });
  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);
  const journalAction = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: 'post' | 'reverse'; reason?: string }) => {
      const response = action === 'post' ? await financeService.postJournal(id) : await financeService.reverseJournal(id, { reason });
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: (_, variables) => {
      showToast(`Journal ${variables.action === 'post' ? 'posted' : 'reversed'} successfully`, 'success');
      if (variables.action === 'reverse') {
        setReverseJournalId(null);
        setReverseReason('');
      }
      void queryClient.invalidateQueries({ queryKey: ['finance', 'journals'] });
      void queryClient.invalidateQueries({ queryKey: ['finance', 'general-ledger'] });
      void queryClient.invalidateQueries({ queryKey: ['finance', 'trial-balance'] });
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Journal action failed', 'error'),
  });

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'entry_number',
      header: 'Entry #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.entry_number || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'description',
      header: 'Memo / Description',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.description || item.memo || '—'}</div>
          <div className="text-[11px] text-text-3">{item.date || '—'}</div>
        </div>
      ),
    },

    {
      key: 'total_debit',
      header: 'Total Debit (DR)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.total_debit || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'total_credit',
      header: 'Total Credit (CR)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.total_credit || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Ledger Post Status',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
          {formatDisplayLabel(item.is_reversed ? 'reversed' : item.entry_type === 'reversal' ? 'reversal_posted' : item.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (item) => item.id && String(item.status || '').toLowerCase() === 'draft' ? <Button size="sm" variant="primary" loading={journalAction.isPending} onClick={() => journalAction.mutate({ id: Number(item.id), action: 'post' })}>Post</Button> : item.id && String(item.status || '').toLowerCase() === 'posted' && !item.is_reversed && item.entry_type !== 'reversal' ? <Button size="sm" variant="outline" loading={journalAction.isPending} onClick={() => { setReverseJournalId(Number(item.id)); setReverseReason(''); }}>Reverse</Button> : <span className="text-xs text-text-3">—</span>,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Journal Entries & Postings</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Double-entry bookkeeping, adjusting ledger entries, and audit trail postings
        </p>
        </div>
        <Button icon="ti-plus" onClick={() => setCreateOpen(true)}>New journal</Button>
      </div>

      <Table
        columns={columns}
        data={journals}
        loading={isLoading}
        error={journalsRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No journal entries recorded"
        emptySubtitle="Manual double-entry adjustments and auto-posted system vouchers will appear here."
      />
      <ModalDialog
        open={reverseJournalId !== null}
        onClose={() => { if (!journalAction.isPending) { setReverseJournalId(null); setReverseReason(''); } }}
        title="Reverse Journal Entry"
        subtitle="A reversal creates a compensating posted journal entry."
        footer={
          <>
            <Button variant="ghost" onClick={() => { setReverseJournalId(null); setReverseReason(''); }} disabled={journalAction.isPending}>Cancel</Button>
            <Button variant="danger" loading={journalAction.isPending} disabled={!reverseReason.trim()} onClick={() => { if (reverseJournalId !== null) journalAction.mutate({ id: reverseJournalId, action: 'reverse', reason: reverseReason.trim() }); }}>Confirm reversal</Button>
          </>
        }
      >
        <label className="block text-xs font-semibold text-text">
          Reason
          <textarea
            value={reverseReason}
            onChange={(event) => setReverseReason(event.target.value)}
            placeholder="Enter the reason for this reversal"
            className="mt-1 h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </label>
      </ModalDialog>
      <CreateRecordModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Manual Journal"
        fields={[
          { name: 'entry_date', label: 'Entry date', type: 'date', required: true },
          { name: 'memo', label: 'Memo', required: true, type: 'textarea' },
          { name: 'reference', label: 'Reference' },
          { name: 'debit_account_id', label: 'Debit account', type: 'select', required: true, options: accounts.filter((account) => account.id).map((account) => ({ value: String(account.id), label: String(account.name || account.display_name || account.id) })) },
          { name: 'credit_account_id', label: 'Credit account', type: 'select', required: true, options: accounts.filter((account) => account.id).map((account) => ({ value: String(account.id), label: String(account.name || account.display_name || account.id) })) },
          { name: 'amount', label: 'Amount', type: 'number', required: true },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createJournal({ entry_date: values.entry_date, memo: values.memo, reference: values.reference || undefined, lines: [{ ledger_account_id: Number(values.debit_account_id), debit: Number(values.amount), credit: 0 }, { ledger_account_id: Number(values.credit_account_id), debit: 0, credit: Number(values.amount) }] });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'journals'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
