import React from 'react';
import { AppIcon } from './AppIcon';

export interface KCardProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  sub?: React.ReactNode;
  subtext?: React.ReactNode;
  trend?: string | { value: string; isPositive?: boolean };
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function KCard({
  label,
  value,
  icon,
  sub,
  subtext,
  trend,
  trendType = 'neutral',
  color: _color = 'navy',
  className = '',
  onClick,
}: KCardProps) {
  const trendColors = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-red-700 bg-red-50 border-red-200',
    neutral: 'text-text-2 bg-surface-2 border-border',
  };

  const displaySub = sub || subtext;
  let trendLabel = typeof trend === 'string' ? trend : trend?.value;
  let resolvedTrendType = trendType;
  if (typeof trend === 'object' && trend?.isPositive !== undefined) {
    resolvedTrendType = trend.isPositive ? 'positive' : 'negative';
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-navy/40 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-2 uppercase tracking-wider">{label}</p>
          <div className="mt-2 text-xl font-extrabold text-text tracking-tight">{value}</div>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-navy">
            <AppIcon name={icon} size={20} />
          </div>
        )}
      </div>

      {(displaySub || trendLabel) && (
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          {displaySub && <span className="text-text-3 truncate">{displaySub}</span>}
          {trendLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${trendColors[resolvedTrendType]}`}
            >
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
