import { useLayoutEffect, type ReactNode } from 'react';
import { useShell } from '../../context/ShellContext';
import { AppIcon } from './AppIcon';
import { Button } from './Button';

interface TopbarProps {
  title: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: Array<{ value: string; label: string; icon?: string }> | string[];
  hidePeriod?: boolean;
  action?: ReactNode;
}

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Fiscal Year' },
];

function DefaultTopbarActions() {
  const { openModal } = useShell();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        icon="ti-receipt"
        onClick={() => openModal('new-expense')}
      >
        Record Expense
      </Button>
      <Button
        variant="primary"
        size="sm"
        icon="ti-file-invoice"
        onClick={() => openModal('create-invoice')}
      >
        New Invoice
      </Button>
    </div>
  );
}

export function Topbar({
  title,
  period = 'month',
  onPeriodChange,
  periodOptions = PERIOD_OPTIONS,
  hidePeriod = false,
  action,
}: TopbarProps) {
  const { setTopbarConfig } = useShell();

  useLayoutEffect(() => {
    setTopbarConfig({ title, period, onPeriodChange, periodOptions, hidePeriod, action });
    return () => setTopbarConfig(null);
  }, [action, hidePeriod, onPeriodChange, period, periodOptions, setTopbarConfig, title]);

  return null;
}

export function ShellTopbar({ fallbackTitle }: { fallbackTitle: string }) {
  const { setMobileOpen, topbarConfig } = useShell();
  const title = topbarConfig?.title || fallbackTitle;
  const action = topbarConfig?.action ?? <DefaultTopbarActions />;

  return (
    <div className="relative z-40 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/95 px-4 py-3 shadow-xs backdrop-blur-md">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-3 hover:bg-surface-1 transition-all md:hidden"
          aria-label="Open navigation"
        >
          <AppIcon name="ti-dashboard" size={18} />
        </button>

        <div className="truncate text-base font-bold text-text font-heading">
          {title}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {action}
      </div>
    </div>
  );
}
