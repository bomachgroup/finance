import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FC } from 'react';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import type { FinanceSettings } from '../../services/api/financeService';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { StatePanel } from '../shared/StatePanel';

export const SettingsPage: FC = () => {
  const { data: settingsRes } = useQuery({
    queryKey: financeQueryKeys.settings,
    queryFn: () => financeService.getSettings(),
  });

  const settings = (settingsRes?.data as FinanceSettings | undefined) || {} as FinanceSettings;
  const queryClient = useQueryClient();
  const [yearStart, setYearStart] = useState('');
  const [closedThroughDate, setClosedThroughDate] = useState('');
  const [journalPrefix, setJournalPrefix] = useState('');
  const [warningDays, setWarningDays] = useState('');
  const [reviewThreshold, setReviewThreshold] = useState('');

  useEffect(() => {
    if (!settingsRes?.data) return;
    setYearStart(settings.financial_year_start_month == null ? '' : String(settings.financial_year_start_month));
    setClosedThroughDate(settings.closed_through_date || '');
    setJournalPrefix(settings.journal_prefix || '');
    setWarningDays(settings.draft_journal_warning_days == null ? '' : String(settings.draft_journal_warning_days));
    setReviewThreshold(settings.large_manual_journal_review_threshold == null ? '' : String(settings.large_manual_journal_review_threshold));
  }, [settingsRes?.data]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      const response = await financeService.updateSettings({ financial_year_start_month: Number(yearStart), closed_through_date: closedThroughDate || null, journal_prefix: journalPrefix || null, draft_journal_warning_days: Number(warningDays), large_manual_journal_review_threshold: reviewThreshold || null });
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: financeQueryKeys.settings }),
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Finance Configuration & Settings</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Global financial year parameters, currency definitions, and tax default rules
        </p>
      </div>

      <div className="space-y-6">
        <Card title="Fiscal Calendar & Base Currency">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div><label className="block font-semibold text-text mb-1">Functional Base Currency</label><div className="h-9 rounded-xl border border-border bg-surface-1 px-3 py-2 text-xs font-semibold text-text">{settings.default_currency || '—'}</div></div>
            <div>
              <label className="block font-semibold text-text mb-1">Fiscal Year Start Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={yearStart}
                onChange={(event) => setYearStart(event.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-surface-1 px-3 text-xs text-text font-semibold outline-none"
              />
            </div>
          </div>
        </Card>

        <Card title="Ledger Controls">
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <label className="font-semibold text-text">Closed through date<input type="date" value={closedThroughDate} onChange={(event) => setClosedThroughDate(event.target.value)} className="mt-1 h-9 w-full rounded-xl border border-border bg-surface-1 px-3 text-xs text-text" /></label>
            <label className="font-semibold text-text">Journal prefix<input value={journalPrefix} onChange={(event) => setJournalPrefix(event.target.value)} className="mt-1 h-9 w-full rounded-xl border border-border bg-surface-1 px-3 text-xs text-text" /></label>
            <label className="font-semibold text-text">Draft journal warning days<input type="number" min="0" value={warningDays} onChange={(event) => setWarningDays(event.target.value)} className="mt-1 h-9 w-full rounded-xl border border-border bg-surface-1 px-3 text-xs text-text" /></label>
            <label className="font-semibold text-text">Manual journal review threshold<input type="number" min="0" step="0.01" value={reviewThreshold} onChange={(event) => setReviewThreshold(event.target.value)} className="mt-1 h-9 w-full rounded-xl border border-border bg-surface-1 px-3 text-xs text-text" /></label>
          </div>
        </Card>
      </div>
      {saveSettings.isError && <StatePanel type="error" title="Settings were not saved" description={saveSettings.error instanceof Error ? saveSettings.error.message : 'The server rejected the update.'} compact />}
      {saveSettings.isSuccess && <StatePanel type="success" title="Settings saved" description="Finance configuration was updated." compact />}
      <Button
        icon="ti-save"
        loading={saveSettings.isPending}
        disabled={!yearStart || !journalPrefix || !warningDays}
        onClick={() => saveSettings.mutate()}
      >
        Save settings
      </Button>
    </div>
  );
};
