export type QuickActionModal = 'new-expense' | 'quick-expense' | 'record-payment' | 'create-invoice' | null
export type QuickActionData = 'invoices' | 'accounts'

export function shouldLoadQuickActionData(modal: string | null, data: QuickActionData): boolean {
  if (data === 'invoices') return modal === 'record-payment'
  return modal === 'new-expense' || modal === 'quick-expense' || modal === 'record-payment'
}
