import React, { useEffect } from 'react';
import { AppIcon } from './AppIcon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidthMap[maxWidth]} max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-lg animate-in zoom-in-95 duration-150 ${className}`}
      >
        {(title || subtitle) && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              {title && <h3 className="text-base font-bold text-text">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-xs text-text-2">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
            >
              <AppIcon name="ti-close" size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
