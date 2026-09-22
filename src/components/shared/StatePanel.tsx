import type { ReactNode } from 'react';
import { AppIcon } from './AppIcon';

export type StatePanelType = 'loading' | 'empty' | 'error' | 'success' | 'info' | 'warning';

export interface StatePanelProps {
  type?: StatePanelType;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
  kind?: 'unauthorized' | 'forbidden' | 'unsupported' | 'network' | 'generic';
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  compact?: boolean;
  className?: string;
}

const stateStyles: Record<StatePanelType, { icon: string; frame: string; glyph: string }> = {
  loading: {
    icon: 'loader-2',
    frame: 'border-border bg-surface-1 text-text-3',
    glyph: 'border-border bg-surface text-text-3',
  },
  empty: {
    icon: 'folder-open',
    frame: 'border-dashed border-border bg-surface-1 text-text-3',
    glyph: 'border-border bg-surface text-text-3',
  },
  error: {
    icon: 'alert-circle',
    frame: 'border-rose-200 bg-rose-50 text-rose-900',
    glyph: 'border-rose-200 bg-white text-rose-600',
  },
  success: {
    icon: 'circle-check',
    frame: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    glyph: 'border-emerald-200 bg-white text-emerald-600',
  },
  info: {
    icon: 'info-circle',
    frame: 'border-blue-200 bg-blue-50 text-blue-900',
    glyph: 'border-blue-200 bg-white text-blue-600',
  },
  warning: {
    icon: 'alert-triangle',
    frame: 'border-amber-200 bg-amber-50 text-amber-900',
    glyph: 'border-amber-200 bg-white text-amber-600',
  },
};

export function StatePanel({
  type = 'empty',
  title,
  subtitle,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  compact = false,
  className = '',
}: StatePanelProps) {
  const styles = stateStyles[type] || stateStyles.empty;
  const iconName = icon?.replace(/^ti-/, '') || styles.icon;
  const desc = description || subtitle;

  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border ${styles.frame} ${
        compact ? 'px-3 py-3' : 'px-4 py-5'
      } ${className}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg border ${styles.glyph} ${
          compact ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'
        }`}
      >
        <AppIcon name={iconName} size={compact ? 14 : 18} className={type === 'loading' ? 'animate-spin' : ''} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={`${compact ? 'text-xs' : 'text-sm'} break-words font-bold leading-snug`}>
          {title}
        </h4>
        {desc ? (
          <p className="mt-1 break-words text-xs font-medium leading-relaxed opacity-75">{desc}</p>
        ) : null}
        {action ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div>
        ) : actionLabel && onAction ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={onAction}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy-light"
            >
              {actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LoadingState({ title = 'Please wait', compact = false }: { title?: string; compact?: boolean }) {
  return <StatePanel type="loading" title={title} compact={compact} />;
}

export function EmptyState({ title, description, subtitle, action, actionLabel, onAction, icon, compact = false, className = '' }: EmptyStateProps) {
  return (
    <StatePanel
      type="empty"
      title={title}
      description={description || subtitle}
      action={action}
      actionLabel={actionLabel}
      onAction={onAction}
      icon={icon}
      compact={compact}
      className={className}
    />
  );
}

export function ErrorState({ message, onRetry, compact = false, className = '', kind = 'generic' }: ErrorStateProps) {
  const title = kind === 'unauthorized'
    ? 'Your session has expired'
    : kind === 'forbidden'
      ? 'You do not have access to this page'
      : kind === 'unsupported'
      ? 'This capability is unavailable'
      : kind === 'network'
        ? 'Could not load data'
        : 'Could not load data';
  return (
    <StatePanel
      type="error"
      title={title}
      description={message}
      compact={compact}
      className={className}
      action={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50"
          >
            Retry
          </button>
        ) : undefined
      }
    />
  );
}
