import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: 'default' | 'flat' | 'outline';
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
  variant = 'default',
  ...rest
}: CardProps) {
  const variantStyles = {
    default: 'bg-surface border border-border shadow-xs',
    flat: 'bg-surface-1 border border-border/80',
    outline: 'bg-transparent border border-border-2',
  };

  return (
    <div className={`rounded-2xl transition-all ${variantStyles[variant]} ${className}`} {...rest}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-bold text-text">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-text-2">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
