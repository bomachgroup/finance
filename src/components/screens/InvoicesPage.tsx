import { useQuery } from '@tanstack/react-query';
import { useState, type FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { ModalDialog } from '../shared/ModalDialog';
import { Select } from '../shared/Select';
import { Table, type Column } from '../shared/Table';

export const InvoicesPage: FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    client_id: '',
    service_id: '',
    total_amount: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: '',
  });

  const { data: invoicesRes, isLoading, refetch } = useQuery({
    queryKey: financeQueryKeys.invoices({ status: statusFilter || undefined }),
    queryFn: () => financeService.listInvoices({ status: statusFilter || undefined }),
  });

  const { data: clientsRes, isLoading: clientsLoading } = useQuery({
    queryKey: ['finance', 'invoice-clients'],
    queryFn: () => financeService.listClients(),
  });

  const { data: servicesRes, isLoading: servicesLoading } = useQuery({
    queryKey: ['finance', 'invoice-services'],
    queryFn: () => financeService.listServices(),
  });

  const invoices = extractApiItems<Record<string, any>>(invoicesRes?.data);
  const clients = extractApiItems<Record<string, any>>(clientsRes?.data);
  const services = extractApiItems<Record<string, any>>(servicesRes?.data);

  const handleCreate = async () => {
    if (!form.total_amount || Number(form.total_amount) <= 0) {
      showToast('Please enter a valid invoice amount', 'error');
      return;
    }

    if (!form.client_id) {
      showToast('Please select a client record', 'error');
      return;
    }

    if (!form.service_id) {
      showToast('Please select a service record', 'error');
      return;
    }

    const selectedService = services.find((s: any) => String(s.id) === String(form.service_id));
    const serviceName = selectedService?.name || selectedService?.service_name || selectedService?.title;
    const finalDescription = form.description.trim() || serviceName || 'Professional Services';

    setSubmitting(true);
    try {
      const totalNum = Number(form.total_amount) || 0;
      const res = await financeService.createInvoice({
        client_id: Number(form.client_id),
        service_id: Number(form.service_id),
        ...(user?.id ? { created_by_id: Number(user.id) } : {}),
        subtotal: totalNum,
        issue_date: form.issue_date,
        due_date: form.due_date,
        notes: finalDescription,
        items: [
          {
            description: finalDescription,
            quantity: 1,
            unit_price: totalNum,
          },
        ],
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Invoice created successfully', 'success');
        setIsCreateOpen(false);
        void refetch();
        setForm({
          client_id: '',
          service_id: '',
          total_amount: '',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          description: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (item) => (
        <span className="font-mono font-bold text-navy">{item.invoice_number || (item.id ? `#${item.id}` : '—')}</span>
      ),
    },
    {
      key: 'client_name',
      header: 'Client / Account',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.client_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.client_email || '—'}</div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-text">
          ₦{Number(item.total_amount || item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'issue_date',
      header: 'Issued Date',
      render: (item) => <span className="text-text-2">{item.issue_date || '—'}</span>,
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (item) => <span className="text-text-2">{item.due_date || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => {
        const s = String(item.status || '').toLowerCase();
        const styles: Record<string, string> = {
          paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          overdue: 'bg-rose-50 text-rose-700 border-rose-200',
          pending: 'bg-amber-50 text-amber-700 border-amber-200',
          draft: 'bg-surface-2 text-text-3 border-border',
        };
        const styleClass = styles[s] || 'bg-surface-2 text-text-3 border-border';

        return (
          <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styleClass}`}>
            {formatDisplayLabel(item.status)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">Invoices & Billing</h2>
          <p className="text-xs text-text-3 mt-0.5">
            Manage client billing schedules, issue statements, and track collections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChangeValue={setStatusFilter}
            placeholder="All Statuses"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          <Button variant="primary" icon="ti-file-invoice" onClick={() => setIsCreateOpen(true)}>
            Create Invoice
          </Button>
        </div>
      </div>


      {/* Main Table */}
      <Table
        columns={columns}
        data={invoices}
        loading={isLoading}
        error={invoicesRes?.error}
        onRetry={() => void refetch()}
        emptyTitle="No invoices created yet"
        emptySubtitle="Click 'Create Invoice' above to issue your first client billing statement."
      />

      {/* Create Modal */}
      <ModalDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue New Client Invoice"
        subtitle="Generate an invoice record and send billing notification"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleCreate}>
              Generate Invoice
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Total Amount (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.total_amount}
              onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))}
              placeholder="0.00"
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>

          <div>
            <Select
              label={
                <span>
                  Client record <span className="text-red-500">*</span>
                </span>
              }
              options={clients.map((client: any) => ({ value: String(client.id), label: client.name || client.client_name || client.company_name || [client.first_name, client.last_name].filter(Boolean).join(' ') || String(client.id) }))}
              value={form.client_id}
              onChangeValue={(value) => {
                setForm((p) => ({ ...p, client_id: value }));
              }}
              placeholder={clientsLoading ? 'Loading clients...' : 'Select a backend client'}
              fullWidth
              disabled={clientsLoading}
            />
          </div>

          <div>
            <Select
              label={
                <span>
                  Service record <span className="text-red-500">*</span>
                </span>
              }
              options={services.map((service: any) => ({ value: String(service.id), label: service.name || service.service_name || service.title || String(service.id) }))}
              value={form.service_id}
              onChangeValue={(value) => setForm((p) => ({ ...p, service_id: value }))}
              placeholder={servicesLoading ? 'Loading services...' : 'Select a backend service'}
              fullWidth
              disabled={servicesLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm((p) => ({ ...p, issue_date: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Description / Project Scope <span className="text-text-3 font-normal text-[11px]">(optional - defaults to service)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Summary of services rendered or deliverable milestones..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};
