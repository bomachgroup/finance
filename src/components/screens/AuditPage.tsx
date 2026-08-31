import { useQuery } from '@tanstack/react-query';
import { useState, type FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';

export const AuditPage: FC = () => {
  const [view, setView] = useState<'logs' | 'exceptions'>('logs');
  const { data: logsRes, isLoading, refetch: refetchLogs } = useQuery({
    queryKey: financeQueryKeys.auditLogs(),
    queryFn: () => financeService.listAuditLogs(),
  });

  const logs = extractApiItems<Record<string, any>>(logsRes?.data);
  const { data: exceptionsRes, isLoading: exceptionsLoading, refetch: refetchExceptions } = useQuery({
    queryKey: financeQueryKeys.exceptions(),
    queryFn: () => financeService.listExceptions(),
    enabled: view === 'exceptions',
  });
  const exceptions = extractApiItems<Record<string, any>>(exceptionsRes?.data);

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => <span className="font-mono text-text-3 text-[11px]">{item.timestamp || item.created_at || '—'}</span>,
    },
    {
      key: 'user_email',
      header: 'User / Actor',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.user_name || item.user_email || '—'}</div>
          <div className="text-[10px] text-text-3 font-mono">{item.ip_address || '—'}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action / Event',
      render: (item) => (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text uppercase">
          {formatDisplayLabel(item.action)}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Event Description',
      render: (item) => <span className="text-text-2">{item.details || item.description || '—'}</span>,
    },
  ];

  const exceptionColumns: Column<Record<string, any>>[] = [
    { key: 'type', header: 'Exception', render: (item) => <div><div className="font-semibold text-text">{formatDisplayLabel(item.type)}</div><div className="text-xs text-text-3">{item.description || '—'}</div></div> },
    { key: 'severity', header: 'Severity', render: (item) => <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">{formatDisplayLabel(item.severity)}</span> },
    { key: 'detected_at', header: 'Detected', render: (item) => <span className="font-mono text-xs text-text-3">{item.detected_at || '—'}</span> },
    { key: 'is_resolved', header: 'Status', render: (item) => <span className="text-xs font-semibold text-text-2">{item.is_resolved ? 'Resolved' : 'Open'}</span> },
  ];


  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Audit Trail & Financial Exceptions</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Immutable event ledger tracking all voucher creations, modifications, approvals, and deletions
        </p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={view === 'logs' ? 'primary' : 'outline'} icon="ti-history" onClick={() => setView('logs')}>Audit log</Button>
        <Button size="sm" variant={view === 'exceptions' ? 'primary' : 'outline'} icon="ti-alert-triangle" onClick={() => setView('exceptions')}>Exceptions</Button>
      </div>

      {view === 'logs' ? <Table columns={columns} data={logs} loading={isLoading} error={logsRes?.error} onRetry={() => void refetchLogs()} emptyTitle="No audit logs found" emptySubtitle="Transactional modifications and user security events will appear here." /> : <Table columns={exceptionColumns} data={exceptions} loading={exceptionsLoading} error={exceptionsRes?.error} onRetry={() => void refetchExceptions()} emptyTitle="No financial exceptions found" emptySubtitle="Control exceptions detected by Finance will appear here." />}
    </div>
  );
};
