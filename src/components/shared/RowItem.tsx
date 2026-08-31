import React from 'react';

interface RowItemProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
  divider?: boolean;
}

export function RowItem({ label, value, hint, className = '', divider = true }: RowItemProps) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 text-sm ${
        divider ? 'border-b border-border/60 last:border-b-0' : ''
      } ${className}`}
    >
      <div>
        <span className="text-text-2">{label}</span>
        {hint && <p className="text-[11px] text-text-3">{hint}</p>}
      </div>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}
