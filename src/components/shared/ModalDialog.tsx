import React from 'react';
import { Modal } from './Modal';

export interface ModalDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function ModalDialog({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}: ModalDialogProps) {
  const isShown = open ?? isOpen ?? false;

  return (
    <Modal open={isShown} onClose={onClose} title={title} subtitle={subtitle} maxWidth={maxWidth}>
      <div className="space-y-4">
        {children}
        {footer && <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-border">{footer}</div>}
      </div>
    </Modal>
  );
}
