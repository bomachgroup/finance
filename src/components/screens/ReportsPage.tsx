import { useState, type FC } from 'react';
import { financeService, type FinancialReportStatement } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { StatePanel } from '../shared/StatePanel';
import { ModalDialog } from '../shared/ModalDialog';

type ReportDefinition = {
  id: string;
  title: string;
  desc: string;
  category: string;
  period: string;
  endpoint: 'profit-and-loss' | 'balance-sheet' | 'revenue' | 'expenses' | 'payables-ageing';
};

const reports: ReportDefinition[] = [
  { id: 'profit-and-loss', title: 'Statement of Profit or Loss (Income Statement)', desc: 'Revenues, cost of goods sold (COGS), operating expenses, and net profit before tax.', category: 'Statutory Financials', period: 'Monthly & YTD', endpoint: 'profit-and-loss' },
  { id: 'balance-sheet', title: 'Statement of Financial Position (Balance Sheet)', desc: 'Total current & non-current assets, liabilities, and owners equity balances.', category: 'Statutory Financials', period: 'Fiscal Year Close', endpoint: 'balance-sheet' },
  { id: 'revenue', title: 'Revenue Report', desc: 'Revenue recognised across clients, services, and operating branches.', category: 'Management Reporting', period: 'Monthly & YTD', endpoint: 'revenue' },
  { id: 'expenses', title: 'Expense Report', desc: 'Operating expenditure grouped by category and reporting period.', category: 'Management Reporting', period: 'Monthly & YTD', endpoint: 'expenses' },
  { id: 'payables-ageing', title: 'Accounts Payable & Vendor Spend Matrix', desc: 'Procurement liabilities, supplier terms, and scheduled vendor disbursements.', category: 'Working Capital', period: 'Weekly Schedule', endpoint: 'payables-ageing' },
];

export const ReportsPage: FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<ReportDefinition | null>(null);
  const [statement, setStatement] = useState<FinancialReportStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const generateReport = async (report: ReportDefinition) => {
    setSelected(report);
    setStatement(null);
    setError('');
    setLoading(true);
    const params = { start_date: startDate || undefined, end_date: endDate || undefined };
    const response = report.endpoint === 'profit-and-loss'
      ? await financeService.getProfitAndLossReport(params)
      : report.endpoint === 'balance-sheet'
        ? await financeService.getBalanceSheetReport({ as_of_date: endDate || undefined })
        : report.endpoint === 'revenue'
          ? await financeService.getRevenueReport(params)
          : report.endpoint === 'expenses'
            ? await financeService.getExpenseReport(params)
            : await financeService.getPayablesAgeingReport();
    if (response.data) setStatement(response.data);
    else setError(response.error || 'The report could not be generated.');
    setLoading(false);
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!selected) return;
    setExporting(format);
    const today = new Date().toISOString().slice(0, 10);
    const exportStartDate = startDate || statement?.date_from || `${today.slice(0, 4)}-01-01`;
    const exportEndDate = endDate || statement?.date_to || today;
    const response = await financeService.exportFinancialReport({ report_type: selected.endpoint, format, start_date: exportStartDate, end_date: exportEndDate });
    if (response.data) {
      const content = response.data instanceof Blob ? response.data : new Blob([String(response.data)], { type: format === 'csv' ? 'text/csv' : 'application/octet-stream' });
      const url = URL.createObjectURL(content);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${selected.id}-${exportStartDate || 'report'}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } else {
      setError(response.error || 'The report export could not be generated.');
    }
    setExporting(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">Financial Statements & Reports</h2>
        <p className="text-xs text-text-3 mt-0.5">
          Audited IFRS / GAAP financial reporting packages, management accounts, and tax schedules
        </p>
      </div>

      <Card title="Reporting period" subtitle="Choose a period before generating a statement.">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-text">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-border bg-surface px-2 text-xs" /></label>
          <label className="text-xs font-semibold text-text">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-border bg-surface px-2 text-xs" /></label>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card
            key={r.id}
            className="flex flex-col justify-between transition hover:border-navy"
            bodyClassName="flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-navy uppercase tracking-wider mb-2">
                <span>{r.category}</span>
                <span className="text-text-3 font-medium text-[10px]">{r.period}</span>
              </div>
              <h3 className="text-sm font-bold text-text mb-2 leading-snug">{r.title}</h3>
              <p className="text-xs text-text-3 leading-relaxed">{r.desc}</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
              <span className="text-xs font-semibold text-navy">Generate statement</span>
              <Button size="sm" variant="outline" icon="ti-file-analytics" onClick={() => void generateReport(r)}>Open</Button>
            </div>
          </Card>
        ))}
      </div>

      <ModalDialog
        isOpen={Boolean(selected)}
        onClose={() => { setSelected(null); setStatement(null); setError(''); }}
        title={selected?.title || 'Financial statement'}
        subtitle={statement?.period || 'Generated statement'}
        maxWidth="4xl"
        footer={<>
          {statement && <><Button size="sm" variant="outline" loading={exporting === 'csv'} disabled={exporting !== null} onClick={() => void exportReport('csv')}>CSV</Button><Button size="sm" variant="outline" loading={exporting === 'xlsx'} disabled={exporting !== null} onClick={() => void exportReport('xlsx')}>XLSX</Button><Button size="sm" variant="outline" loading={exporting === 'pdf'} disabled={exporting !== null} onClick={() => void exportReport('pdf')}>PDF</Button></>}
          <Button variant="outline" onClick={() => { setSelected(null); setStatement(null); setError(''); }}>Close</Button>
        </>}
      >
          {loading ? <StatePanel type="loading" title="Generating report" compact /> : error ? <StatePanel type="error" title="Report unavailable" description={error} compact /> : statement ? (
            <div className="space-y-4">
              {Array.isArray(statement.sections) ? statement.sections.map((section) => (
                <div key={section.title} className="border-b border-border/70 pb-3 last:border-0">
                  <div className="flex items-center justify-between text-xs font-bold text-text"><span>{section.title}</span><span>₦{Number(section.subtotal || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></div>
                  <div className="mt-2 space-y-1">{section.items.map((item) => <div key={`${section.title}-${item.code || item.label}`} className="flex justify-between text-xs text-text-2"><span>{item.label}</span><span>₦{Number(item.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></div>)}</div>
                </div>
              )) : <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[
                ['Revenue', statement.total_revenue],
                ['Expenses', statement.total_expenses],
                ['Net profit', statement.net_profit],
              ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-border bg-surface-1 p-3"><div className="text-xs font-semibold text-text-3">{label}</div><div className="mt-1 text-sm font-bold text-navy">{value == null ? '—' : `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}</div></div>)}</div>}
              {Array.isArray(statement.sections) && <div className="flex justify-between border-t border-border pt-3 text-sm font-bold text-navy"><span>Net total</span><span>₦{Number(statement.net_total ?? statement.net_profit ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></div>}
            </div>
          ) : <StatePanel type="info" title="Generate a statement" description="Select a report above to load its current figures." compact />}
      </ModalDialog>
    </div>
  );
};
