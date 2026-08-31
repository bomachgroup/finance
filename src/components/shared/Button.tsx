import React from 'react';
import { AppIcon } from './AppIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-navy hover:bg-navy-dark text-white shadow-xs focus:ring-navy/30',
  secondary: 'bg-surface-2 hover:bg-border text-text focus:ring-border',
  outline: 'border border-border-2 hover:bg-surface-1 text-text focus:ring-border',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500/30',
  ghost: 'text-text-2 hover:text-text hover:bg-surface-2 focus:ring-transparent',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-bold rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <AppIcon name={icon} size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
      {!loading && iconRight && <AppIcon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}
