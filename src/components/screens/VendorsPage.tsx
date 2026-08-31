import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { extractApiItems, formatDisplayLabel } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Table, type Column } from '../shared/Table';
import { Button } from '../shared/Button';
import { CreateRecordModal } from '../shared/CreateRecordModal';

export const VendorsPage: FC = () => {
  const [vendorOpen, setVendorOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: vendorsRes, isLoading: vendorsLoading, refetch: refetchVendors } = useQuery({
    queryKey: financeQueryKeys.vendors(),
    queryFn: () => financeService.listVendors(),
  });

  const { data: billsRes, isLoading: billsLoading, refetch: refetchBills } = useQuery({
    queryKey: financeQueryKeys.vendorBills(),
    queryFn: () => financeService.listVendorBills(),
  });

  const vendors = extractApiItems<Record<string, any>>(vendorsRes?.data);
  const bills = extractApiItems<Record<string, any>>(billsRes?.data);

  const vendorColumns: Column<Record<string, any>>[] = [
    {
      key: 'name',
      header: 'Vendor Name / Company',
      render: (item) => (
        <div>
          <div className="font-semibold text-text">{item.name || item.vendor_name || '—'}</div>
          <div className="text-[11px] text-text-3">{item.email || item.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Trade',
      render: (item) => (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2">
          {item.category || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Compliance Status',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
          {formatDisplayLabel(item.status)}
        </span>
      ),
    },
  ];

  const billColumns: Column<Record<string, any>>[] = [
    {
      key: 'bill_number',
      header: 'Bill #',
      render: (item) => <span className="font-mono font-bold text-navy">{item.bill_number || (item.id ? `#${item.id}` : '—')}</span>,
    },
    {
      key: 'vendor_name',
      header: 'Vendor Name',
      render: (item) => <span className="font-semibold text-text">{item.vendor_name || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Bill Total',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-rose-700">
          ₦{Number(item.amount || item.total_amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'due_date',
      header: 'Payment Due Date',
      render: (item) => <span className="text-text-2">{item.due_date || '—'}</span>,
    },

    {
      key: 'status',
      header: 'Bill Status',
      align: 'center',
      render: (item) => (
        <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
          {formatDisplayLabel(item.status)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Vendors & Payables</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Supplier directory, contract purchase orders, and payable bills register
        </p>
        </div>
        <div className="flex gap-2"><Button icon="ti-truck" onClick={() => setVendorOpen(true)}>New vendor</Button><Button variant="outline" icon="ti-file-invoice" onClick={() => setBillOpen(true)}>New bill</Button></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text">Approved Vendors Register</h3>
          <Table
            columns={vendorColumns}
            data={vendors}
            loading={vendorsLoading}
            error={vendorsRes?.error}
            onRetry={() => void refetchVendors()}
            emptyTitle="No vendors registered"
            emptySubtitle="Suppliers and contractors will be cataloged here once registered."
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text">Upcoming Vendor Bills Due</h3>
          <Table
            columns={billColumns}
            data={bills}
            loading={billsLoading}
            error={billsRes?.error}
            onRetry={() => void refetchBills()}
            emptyTitle="No vendor bills pending"
            emptySubtitle="All supplier invoices and payables are settled."
          />
        </div>
      </div>
      <CreateRecordModal
        open={vendorOpen}
        onClose={() => setVendorOpen(false)}
        title="Create Vendor"
        subtitle="Add a supplier to the Finance vendor register."
        fields={[
          { name: 'name', label: 'Vendor name', required: true },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'phone', label: 'Phone' },
          { name: 'tax_id', label: 'Tax ID' },
          { name: 'address', label: 'Address', type: 'textarea' },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createVendor({ name: values.name, email: values.email, phone: values.phone, tax_id: values.tax_id, address: values.address });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] });
          return { error: response.error };
        }}
      />
      <CreateRecordModal
        open={billOpen}
        onClose={() => setBillOpen(false)}
        title="Create Vendor Bill"
        subtitle="Record a payable against a backend vendor."
        fields={[
          { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: vendors.filter((vendor) => vendor.id).map((vendor) => ({ value: String(vendor.id), label: String(vendor.name || vendor.vendor_name || vendor.id) })) },
          { name: 'category', label: 'Category', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'gross_amount', label: 'Gross amount', type: 'number', required: true },
          { name: 'withholding_tax', label: 'Withholding tax', type: 'number' },
          { name: 'bill_date', label: 'Bill date', type: 'date', required: true },
          { name: 'due_date', label: 'Due date', type: 'date', required: true },
        ]}
        onSubmit={async (values) => {
          const response = await financeService.createVendorBill({ vendor_id: Number(values.vendor_id), category: values.category, description: values.description, gross_amount: Number(values.gross_amount), withholding_tax: values.withholding_tax ? Number(values.withholding_tax) : undefined, bill_date: values.bill_date, due_date: values.due_date });
          if (!response.error) await queryClient.invalidateQueries({ queryKey: ['finance', 'vendor-bills'] });
          return { error: response.error };
        }}
      />
    </div>
  );
};
