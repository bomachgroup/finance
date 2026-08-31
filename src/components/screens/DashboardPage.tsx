import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useShell } from '../../context/ShellContext';
import { extractApiItems, formatDisplayLabel, formatNumber } from '../../data/helpers';
import { financeQueryKeys } from '../../services/api/financeQueries';
import { financeService } from '../../services/api/financeService';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ErrorState } from '../shared/StatePanel';
import { KCard } from '../shared/KCard';
import { SkeletonChart, SkeletonKpiGrid, SkeletonList } from '../shared/Skeletons';

export const DashboardPage: FC = () => {
  const { openModal } = useShell();

  const { data: summaryRes, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: financeQueryKeys.commandCenter,
    queryFn: () => financeService.getCommandCenter(),
  });

  const { data: invoicesRes, isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: financeQueryKeys.invoices({ limit: 10 }),
    queryFn: () => financeService.listInvoices({ limit: 10 }),
  });

  const { data: expensesRes, isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
    queryKey: financeQueryKeys.expenses({ limit: 10 }),
    queryFn: () => financeService.listExpenses({ limit: 10 }),
  });

  const { data: accountsRes, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: financeQueryKeys.accounts(),
    queryFn: () => financeService.listAccounts(),
  });

  const { data: forecastRes, refetch: refetchForecast } = useQuery({
    queryKey: financeQueryKeys.cashFlowForecast(),
    queryFn: () => financeService.getCashFlowForecast(),
  });

  const formatCurrency = (val: number | string | undefined) => {
    const num = Number(val) || 0;
    return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const summary = (summaryRes?.data as Record<string, unknown>) || {};
  const invoices = extractApiItems<Record<string, any>>(invoicesRes?.data);
  const expenses = extractApiItems<Record<string, any>>(expensesRes?.data);
  const accounts = extractApiItems<Record<string, any>>(accountsRes?.data);

  // Compute calculated metrics if summary is empty (e.g. if 403 on command-center)
  const totalInvoicesSum = invoices.reduce((sum: number, item: any) => sum + Number(item.total_amount || item.amount || 0), 0);
  const totalExpensesSum = expenses.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const calculatedNet = totalInvoicesSum - totalExpensesSum;

  const totalRevenue = summary.total_revenue !== undefined ? Number(summary.total_revenue) : totalInvoicesSum;
  const totalExpenses = summary.total_expenses !== undefined ? Number(summary.total_expenses) : totalExpensesSum;
  const netProfit = summary.net_profit !== undefined ? Number(summary.net_profit) : calculatedNet;
  const dashboardError = [
    summaryRes?.error,
    invoicesRes?.error,
    expensesRes?.error,
    accountsRes?.error,
    forecastRes?.error,
  ].find((error): error is string => Boolean(error));

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text">Executive Command Center</h2>
          <p className="text-xs text-text-3 mt-0.5">
            Real-time liquidity, revenue tracking, and operating expenditure overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon="ti-receipt" onClick={() => openModal('new-expense')}>
            Record Expense
          </Button>
          <Button variant="primary" icon="ti-bill" onClick={() => openModal('record-payment')}>
            Record Payment
          </Button>
        </div>
      </div>

      {dashboardError ? (
        <ErrorState
          message={dashboardError}
          onRetry={() => {
            void refetchSummary();
            void refetchInvoices();
            void refetchExpenses();
            void refetchAccounts();
            void refetchForecast();
          }}
        />
      ) : null}

      {/* KPI Grid */}
      {summaryLoading && expensesLoading && invoicesLoading ? (
        <SkeletonKpiGrid cards={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KCard
            label="Total Revenue (MTD)"
            value={formatCurrency(totalRevenue)}
            trend={invoices.length > 0 ? { value: `${invoices.length} invoices issued`, isPositive: true } : undefined}
            icon="ti-cash"
            color="green"
            subtext="Verified Collections"
          />
          <KCard
            label="Operating Expenses"
            value={formatCurrency(totalExpenses)}
            trend={expenses.length > 0 ? { value: `${expenses.length} logged items`, isPositive: false } : undefined}
            icon="ti-receipt"
            color="red"
            subtext="Expenditure Records"
          />
          <KCard
            label="Net Operating Profit"
            value={formatCurrency(netProfit)}
            trend={{ value: 'Net Position', isPositive: netProfit >= 0 }}
            icon="ti-award"
            color="gold"
            subtext="Operating Surplus"
          />
          <KCard
            label="Cash Accounts"
            value={summary.cash_runway_days ? `${formatNumber(Number(summary.cash_runway_days))} Days Runway` : `${accounts.length} Active Accounts`}
            icon="ti-wallet"
            color="navy"
            subtext="Treasury & Vault Positions"
          />
        </div>
      )}

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue vs Expense Breakdown & Recent Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cashflow & Financial Performance */}
          <Card
            title="Revenue & Expenditure Trajectory"
            subtitle="Monthly inflows vs outflows breakdown across business units"
          >
            {summaryLoading && expensesLoading ? (
              <SkeletonChart bars={8} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="h-3 w-3 rounded-full bg-emerald-600" />
                      <span className="font-semibold text-text">Collections</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="h-3 w-3 rounded-full bg-rose-600" />
                      <span className="font-semibold text-text">Disbursements</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-text-3">Active Fiscal Year</span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-2">
                  {(() => {
                    const dataObj = forecastRes?.data as Record<string, unknown> | undefined;
                    const monthlyItems = Array.isArray(dataObj?.monthly_breakdown)
                      ? (dataObj.monthly_breakdown as Record<string, unknown>[])
                      : [];

                    const bars = monthlyItems.map((item) => {
                      const inVal = Number(item.inflows ?? item.revenue ?? 0);
                      const outVal = Number(item.outflows ?? item.expenses ?? 0);
                      const maxVal = Math.max(inVal, outVal, 1);
                      const hIn = `${Math.min(100, Math.max(5, (inVal / maxVal) * 90))}%`;
                      const hOut = `${Math.min(100, Math.max(5, (outVal / maxVal) * 90))}%`;

                      return {
                        m: String(item.month || item.period || '—'),
                        in: formatCurrency(inVal),
                        out: formatCurrency(outVal),
                        hIn,
                        hOut,
                      };
                    });

                    return bars.length > 0 ? bars.map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="flex h-36 w-full items-end justify-center gap-1 rounded-lg bg-surface-1 p-1">
                          <div
                            style={{ height: bar.hIn }}
                            className="w-1/2 rounded-t-md bg-emerald-600 transition-all hover:opacity-90"
                            title={`Collections: ${bar.in}`}
                          />
                          <div
                            style={{ height: bar.hOut }}
                            className="w-1/2 rounded-t-md bg-rose-500 transition-all hover:opacity-90"
                            title={`Disbursements: ${bar.out}`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-text-2">{formatDisplayLabel(bar.m)}</span>
                      </div>
                    )) : <div className="col-span-6 py-12 text-center text-xs text-text-3">No cash-flow forecast data available.</div>;
                  })()}
                </div>
              </div>
            )}
          </Card>

          {/* Recent Invoices */}
          <Card
            title="Recent Invoices & Receivables"
            subtitle="Latest billings issued to clients"
          >
            {invoicesLoading ? (
              <SkeletonList rows={4} />
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-3">
                No invoices recorded yet. Click &quot;New Invoice&quot; to issue your first invoice.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {invoices.slice(0, 5).map((inv: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text truncate">
                        {inv.invoice_number || (inv.id ? `#${inv.id}` : '—')}
                      </div>
                      <div className="text-[11px] text-text-3 truncate">
                        {inv.client_name || '—'} {inv.due_date ? `• Due ${inv.due_date}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-text">
                        {formatCurrency(inv.total_amount || inv.amount)}
                      </div>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {formatDisplayLabel(inv.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Recent Outflows & Treasury Position */}
        <div className="space-y-6">
          <Card
            title="Recent Expenditures"
            subtitle="Latest operating disbursements"
          >
            {expensesLoading ? (
              <SkeletonList rows={4} />
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-3">
                No recent expenses logged. Click &quot;Record Expense&quot; to record spend.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {expenses.slice(0, 5).map((exp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text truncate">
                        {exp.category || 'Expense'}
                      </div>
                      <div className="text-[11px] text-text-3 truncate">
                        {exp.beneficiary || '—'} {exp.date ? `• ${exp.date}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-bold text-xs text-rose-700">
                      {formatCurrency(exp.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Treasury Position"
            subtitle="Liquid accounts and ledger positions"
          >
            {accountsLoading ? (
              <SkeletonList rows={3} />
            ) : accounts.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-3">
                No bank or treasury accounts registered yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {accounts.map((acc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-1 border border-border/80">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text truncate">
                        {acc.name || acc.account_name || 'Account'}
                      </div>
                      <div className="text-[10px] text-text-3 font-mono">
                        {formatDisplayLabel(acc.code || acc.account_number || acc.account_type)}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-navy shrink-0">
                      {formatCurrency(acc.balance || acc.current_balance)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
