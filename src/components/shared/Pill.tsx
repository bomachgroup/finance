import React from 'react';

export type PillVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';

interface PillProps {
  label?: string;
  children?: React.ReactNode;
  variant?: PillVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<PillVariant, string> = {
  default: 'bg-surface-2 text-text-2 border-border',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
  outline: 'bg-transparent text-text-2 border-border-2',
};

const dotColors: Record<PillVariant, string> = {
  default: 'bg-text-3',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  purple: 'bg-purple-600',
  outline: 'bg-text-3',
};

const sizeStyles = {
  xs: 'text-[10px] px-1.5 py-0.5 font-medium',
  sm: 'text-[11px] px-2 py-0.5 font-medium',
  md: 'text-xs px-2.5 py-1 font-semibold',
};

export function Pill({
  label,
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  dot = false,
}: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children ?? label}
    </span>
  );
}
